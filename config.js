// ==========================================================================
// ERIK 50 ÅR - CONFIGURATION & DATA MANAGEMENT MODULE
// ==========================================================================

const DEFAULT_EVENT_CONFIG = {
  // General Info
  eventTitle: "Erik 50 år",
  heroDescription: "Varmt välkommen till middag och firande på slottet i Bromma!",
  heroSubtext: "Kl 18:00 Skål på balkongen",
  eventDateISO: "2026-09-19T18:00:00",
  guestPin: "1976",
  adminPin: "1976",

  // Location & Details
  venueName: "Ljunglöfska Slottet",
  venueAddress: "Ljunglöfsvägen 1, 168 47 Bromma (Blackeberg)",
  venueMapUrl: "https://maps.google.com/?q=Ljunglöfsvägen+1+Bromma",
  venueEmbedMapUrl: "https://maps.google.com/maps?q=Ljungl%C3%B6fska%20Slottet%2C%20Ljungl%C3%B6fsv%C3%A4gen%201%2C%20Bromma&t=&z=15&ie=UTF8&iwloc=&output=embed",
  dressCode: "Kavaj, bekvämt för en fest på slottet.",
  eventTimeDetails: "Lördagen den 19 September 2026<br><strong style=\"color: var(--gold-light);\">Kl 18:00 Skål på balkongen</strong><br><span style=\"font-size: 0.9rem; color: var(--text-muted);\">Kl. 01:00 stänger portarna</span>",
  programDescription: "18:00 Skål på balkongen. Kom gärna en stund innan för att landa och njuta av utsikten. Därefter sätter vi oss till bords i festsalen för hummersoppa följt av buffé. Kvällen avrundas med tårta och kaffe i biblioteket. Portarna stänger 01:00.",

  // Toastmaster
  toastmasterName: "Thomas Falkenström",
  toastmasterDesc: "Thomas styr upp kvällen och är kontaktperson för eventuella tal och inslag.",
  toastmasterPhone: "+46733926982",
  toastmasterPhoneDisplay: "+46 73-392 69 82",
  toastmasterEmail: "thomas@falcaounited.com",

  // Hotel / Accommodation
  accommodationDesc: "För gäster som önskar övernatta erbjuder Ljunglöfska Slottet hotellrum. Boka direkt via slottets hemsida för att säkra ert boende.",
  accommodationLink: "https://www.ljunglofska.se/Oevernattning-foer-dina-gaester-2.html",

  // Dinner & Menu
  dinnerDesc: "Efter champagneskål på balkongen kl. 18:00 inleds middagen till bords med hummersoppa. Därefter serveras buffé, och kvällen avrundas med tårta och kaffe i slottets bibliotek.",

  // Gifts & Charities
  giftsTitle: "Födelsedagsönskan",
  giftsDesc: "Att du är med och firar min födelsedag är min present. För dig som ändå önskar ge något ligger Hjärnfonden (till minne av pappa som gick bort i ALS), Barncancerfonden och Tobiasregistret extra varmt om hjärtat. Utan cancerforskningen och registret hade livet kunnat se helt annorlunda ut.",

  // Media Links
  youtubeMusicUrl: "https://music.youtube.com/playlist?list=PLRODbdTjkqZs",
  googlePhotosUrl: "https://photos.app.goo.gl/XBhsaRKAiPdSsVVd6",

  // Contact for Allergies
  allergyNotice: "Vi har fångat upp de allergier vi känner till. Om vi har missat något, eller om du får förhinder, kontakta Pernilla snarast."
};

// LocalStorage Keys
const STORAGE_KEYS = {
  CONFIG: 'erik50_config',
  RSVP: 'erik50_rsvps',
  ANALYTICS: 'erik50_analytics'
};

// Retrieve Current Config
function getEventConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      return { ...DEFAULT_EVENT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn("Could not load config from localStorage", e);
  }
  return { ...DEFAULT_EVENT_CONFIG };
}

// Save Config
function saveEventConfig(newConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(newConfig));
    return true;
  } catch (e) {
    console.error("Error saving config:", e);
    return false;
  }
}

// Reset Config to Defaults
function resetEventConfig() {
  localStorage.removeItem(STORAGE_KEYS.CONFIG);
}

// RSVP Management
function getRSVPList() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RSVP);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveRSVP(rsvpEntry) {
  const list = getRSVPList();
  const entryWithMeta = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    submittedAt: new Date().toISOString(),
    ...rsvpEntry
  };
  list.unshift(entryWithMeta);
  localStorage.setItem(STORAGE_KEYS.RSVP, JSON.stringify(list));
  return entryWithMeta;
}

function clearRSVPList() {
  localStorage.removeItem(STORAGE_KEYS.RSVP);
}

// Calendar Download Analytics
function getAnalyticsData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    return saved ? JSON.parse(saved) : { icsDownloads: 0, googleCalClicks: 0, log: [] };
  } catch (e) {
    return { icsDownloads: 0, googleCalClicks: 0, log: [] };
  }
}

function trackCalendarDownload(type, details = '') {
  const data = getAnalyticsData();
  if (type === 'ics') {
    data.icsDownloads = (data.icsDownloads || 0) + 1;
  } else if (type === 'google') {
    data.googleCalClicks = (data.googleCalClicks || 0) + 1;
  }

  data.log = data.log || [];
  data.log.unshift({
    type: type,
    timestamp: new Date().toISOString(),
    details: details || 'Guest interaction'
  });

  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(data));
}

// Global Exports for browser window
window.EventConfigManager = {
  DEFAULT_CONFIG: DEFAULT_EVENT_CONFIG,
  getConfig: getEventConfig,
  saveConfig: saveEventConfig,
  resetConfig: resetEventConfig,
  getRSVPs: getRSVPList,
  saveRSVP: saveRSVP,
  clearRSVPs: clearRSVPList,
  getAnalytics: getAnalyticsData,
  trackCalendarDownload: trackCalendarDownload
};
