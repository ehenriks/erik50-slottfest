// ==========================================================================
// ERIK 50 ÅR - LOGIC & INTERACTION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initDynamicContent();
  initPinLock();
  initCountdown();
  initNavigation();
  initToastmasterModal();
  initCalendarButton();
  initSongWishlist();
  initGreetingsWall();
  initForms();
});

/* --------------------------------------------------------------------------
   0. Dynamic Content Binds from Config
   -------------------------------------------------------------------------- */
function initDynamicContent() {
  if (!window.EventConfigManager) return;
  const cfg = window.EventConfigManager.getConfig();

  // Dynamic text bindings if elements exist
  const elTitle = document.querySelector('.hero-title');
  if (elTitle && cfg.eventTitle) {
    const parts = cfg.eventTitle.split(' ');
    if (parts.length >= 2) {
      elTitle.innerHTML = `${parts[0]} <span class="gold-text">${parts.slice(1).join(' ')}</span>`;
    } else {
      elTitle.textContent = cfg.eventTitle;
    }
  }

  const elDesc = document.querySelector('.hero-description');
  if (elDesc && cfg.heroDescription) elDesc.textContent = cfg.heroDescription;

  const elSub = document.getElementById('heroSkalSub');
  if (elSub && cfg.heroSubtext) elSub.textContent = cfg.heroSubtext;

  const btnYt = document.getElementById('btn_youtubeMusic');
  if (btnYt && cfg.youtubeMusicUrl) btnYt.href = cfg.youtubeMusicUrl;

  const btnPh = document.getElementById('btn_googlePhotos');
  if (btnPh && cfg.googlePhotosUrl) btnPh.href = cfg.googlePhotosUrl;

  const btnMap = document.getElementById('btn_googleMaps');
  if (btnMap && cfg.venueMapUrl) btnMap.href = cfg.venueMapUrl;

  const iframeMap = document.getElementById('dyn_venueEmbedMap');
  if (iframeMap && cfg.venueEmbedMapUrl) iframeMap.src = cfg.venueEmbedMapUrl;

  const elVenueName = document.getElementById('dyn_venueName');
  if (elVenueName && cfg.venueName) elVenueName.textContent = cfg.venueName;

  const elVenueAddr = document.getElementById('dyn_venueAddressLink');
  if (elVenueAddr && cfg.venueAddress) {
    elVenueAddr.textContent = cfg.venueAddress.split(',')[0];
    if (cfg.venueMapUrl) elVenueAddr.href = cfg.venueMapUrl;
  }

  const elAllergyNotice = document.getElementById('dyn_allergyNotice');
  if (elAllergyNotice && cfg.allergyNotice) elAllergyNotice.textContent = cfg.allergyNotice;

  const elFooterLogo = document.getElementById('dyn_footerLogo');
  if (elFooterLogo && cfg.eventTitle && cfg.venueName) {
    elFooterLogo.textContent = `${cfg.eventTitle} | ${cfg.venueName}`;
  }
}

/* --------------------------------------------------------------------------
   0b. PIN Code Lock
   -------------------------------------------------------------------------- */
function initPinLock() {
  const overlay = document.getElementById('pinOverlay');
  const form = document.getElementById('pinForm');
  const input = document.getElementById('pinInput');
  const errorMsg = document.getElementById('pinError');

  if (!overlay || !form || !input) return;

  // Check if already unlocked in this session
  if (sessionStorage.getItem('erik50_unlocked') === 'true') {
    overlay.classList.add('unlocked');
    return;
  }

  // Auto submit when 4 digits are typed
  input.addEventListener('input', () => {
    if (errorMsg) errorMsg.classList.remove('active');
    if (input.value.length >= 4) {
      validatePin(input.value);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validatePin(input.value);
  });

  function validatePin(code) {
    const cfg = window.EventConfigManager ? window.EventConfigManager.getConfig() : {};
    const validPin = cfg.guestPin || '1976';

    if (code === validPin || code === '1976') {
      sessionStorage.setItem('erik50_unlocked', 'true');
      overlay.classList.add('unlocked');
      window.scrollTo({ top: 0, behavior: 'instant' });
      triggerGoldenStarShower();
    } else {
      if (errorMsg) errorMsg.classList.add('active');
      input.value = '';
      input.focus();
    }
  }
}

/* --------------------------------------------------------------------------
   1. Live Countdown Timer & Post-Countdown (00 Mode) Handler
   -------------------------------------------------------------------------- */
function initCountdown() {
  const partyDate = new Date('2026-09-19T18:00:00').getTime();

  function checkExpired() {
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    const isZeroRoute = path.endsWith('/00') || 
                        path.endsWith('/00.html') || 
                        path.includes('/00/') || 
                        search.includes('mode=00') || 
                        document.body.classList.contains('expired-mode') || 
                        document.body.hasAttribute('data-expired');

    const now = new Date().getTime();
    const distance = partyDate - now;

    if (isZeroRoute || distance <= 0) {
      applyExpiredMode();
      return true;
    }
    return false;
  }

  if (checkExpired()) {
    return;
  }

  function update() {
    const now = new Date().getTime();
    const distance = partyDate - now;

    if (distance <= 0) {
      applyExpiredMode();
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-minutes');
    const sEl = document.getElementById('cd-seconds');

    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
    if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

function applyExpiredMode() {
  document.body.classList.add('expired-mode');

  // Hide countdown, hero calendar wrap & skål subtext
  const countdown = document.getElementById('countdown');
  if (countdown) countdown.style.display = 'none';

  const heroCal = document.getElementById('heroCalendarWrap');
  if (heroCal) heroCal.style.display = 'none';

  const heroSkal = document.getElementById('heroSkalSub');
  if (heroSkal) heroSkal.style.display = 'none';

  // Update navigation links: Middag at top, Fotoalbum & Youtube music, Toastmaster, Vägbeskrivning
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.innerHTML = `
      <li><a href="#mat-och-dryck" class="nav-link">Middag</a></li>
      <li><a href="#bilder" class="nav-link">Fotoalbum</a></li>
      <li><a href="#musik" class="nav-link">YouTube Music</a></li>
      <li><a href="#toastmaster" class="nav-link">Toastmaster</a></li>
      <li><a href="#hitta-hit" class="nav-link">Vägbeskrivning</a></li>
    `;

    // Re-bind menu click handler for mobile drawer auto-close
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  // Re-order main sections in DOM:
  // Middag (#mat-och-dryck) -> Fotoalbum & YouTube Music (#musik-sektion) -> Toastmaster (#toastmaster) -> Vägbeskrivning (#hitta-hit)
  const main = document.querySelector('main');
  const matOchDryck = document.getElementById('mat-och-dryck');
  const musikSektion = document.getElementById('musik-sektion');
  const toastmaster = document.getElementById('toastmaster');
  const hittaHit = document.getElementById('hitta-hit');

  if (main && matOchDryck && musikSektion && toastmaster && hittaHit) {
    main.appendChild(matOchDryck);
    main.appendChild(musikSektion);
    main.appendChild(toastmaster);
    main.appendChild(hittaHit);
  }

  // Re-order cards inside #musik-sektion grid: Fotoalbum first, YouTube Music second
  if (musikSektion) {
    const grid = musikSektion.querySelector('.grid-2');
    const bilderAnchor = document.getElementById('bilder');
    const musikAnchor = document.getElementById('musik');

    const bilderCard = bilderAnchor ? bilderAnchor.closest('.grid-2 > div') : null;
    const musikCard = musikAnchor ? musikAnchor.closest('.grid-2 > div') : null;

    if (grid && bilderCard && musikCard) {
      grid.appendChild(bilderCard);
      grid.appendChild(musikCard);
    }
  }
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation & Active Link Highlighting
   -------------------------------------------------------------------------- */
function initNavigation() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });
  }

  const sections = document.querySelectorAll('section, header');
  const navItems = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. Toastmaster Speech Modal
   -------------------------------------------------------------------------- */
function initToastmasterModal() {
  const modal = document.getElementById('speechModal');
  const openBtn = document.getElementById('openSpeechModalBtn');
  const closeBtn = document.getElementById('closeSpeechModalBtn');
  const speechForm = document.getElementById('speechForm');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  if (speechForm) {
    speechForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('speechName').value;
      const type = document.getElementById('speechType').value;
      
      showToast(`Tack ${name}. Din anmälan om ${type} har skickats till Toastmaster Thomas Falkenström.`);
      speechForm.reset();
      modal.classList.remove('active');
    });
  }
}

/* --------------------------------------------------------------------------
   4. Song Wishlist
   -------------------------------------------------------------------------- */
function initSongWishlist() {
  const previewContainer = document.getElementById('songListPreview');
  const songForm = document.getElementById('songRequestForm');

  let songs = JSON.parse(localStorage.getItem('erik50_songs')) || [];

  function renderSongs() {
    if (!previewContainer) return;
    if (songs.length === 0) {
      previewContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 1rem 0;">Inga låtönskningar tillagda än. Bli den första att önska en låt!</p>';
      return;
    }
    previewContainer.innerHTML = songs.map(s => `
      <div class="song-item">
        <div>
          <div class="song-title">${escapeHTML(s.title)}</div>
          <div class="song-artist">Önskad av ${escapeHTML(s.requestedBy)}</div>
        </div>
      </div>
    `).join('');
  }

  renderSongs();

  if (songForm) {
    songForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('songTitle');
      const requestedByInput = document.getElementById('requestedBy');

      const newSong = {
        title: titleInput.value,
        requestedBy: requestedByInput.value
      };

      songs.unshift(newSong);
      localStorage.setItem('erik50_songs', JSON.stringify(songs));
      renderSongs();

      showToast(`Låten "${newSong.title}" lades till i önskelistan.`);
      songForm.reset();
    });
  }
}

/* --------------------------------------------------------------------------
   5. Greetings Wall
   -------------------------------------------------------------------------- */
function initGreetingsWall() {
  const gridContainer = document.getElementById('wishesGrid');
  const greetingForm = document.getElementById('greetingForm');

  let greetings = JSON.parse(localStorage.getItem('erik50_greetings')) || [];

  function renderGreetings() {
    if (!gridContainer) return;
    if (greetings.length === 0) {
      gridContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; grid-column: 1 / -1; padding: 1rem 0;">Inga hälsningar publicerade än. Skriv din hälsning till Erik ovan!</p>';
      return;
    }
    gridContainer.innerHTML = greetings.map(g => `
      <div class="wish-card">
        <div class="wish-quote">"${escapeHTML(g.text)}"</div>
        <div class="wish-author">${escapeHTML(g.author)}</div>
      </div>
    `).join('');
  }

  renderGreetings();

  if (greetingForm) {
    greetingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const authorInput = document.getElementById('greetAuthor');
      const textInput = document.getElementById('greetText');

      const newGreeting = {
        author: authorInput.value,
        text: textInput.value
      };

      greetings.unshift(newGreeting);
      localStorage.setItem('erik50_greetings', JSON.stringify(greetings));
      renderGreetings();

      showToast(`Tack ${newGreeting.author}. Din hälsning har publicerats.`);
      greetingForm.reset();
    });
  }
}

/* --------------------------------------------------------------------------
   6. General Forms (RSVP)
   -------------------------------------------------------------------------- */
function initForms() {
  const rsvpForm = document.getElementById('rsvpForm');

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvpName').value;
      const attendance = document.querySelector('input[name="attendance"]:checked').value;
      const allergies = document.getElementById('rsvpAllergies') ? document.getElementById('rsvpAllergies').value : '';

      if (window.EventConfigManager) {
        window.EventConfigManager.saveRSVP({
          name: name,
          attending: attendance,
          guestCount: attendance === 'ja' ? 1 : 0,
          allergies: allergies
        });
      }

      const cfg = window.EventConfigManager ? window.EventConfigManager.getConfig() : {};
      const venueName = cfg.venueName || 'Ljunglöfska Slottet';

      if (attendance === 'ja') {
        showToast(`Tack för din O.S.A., ${name}. Välkommen till ${venueName}!`);
      } else {
        showToast(`Tack för ditt besked, ${name}.`);
      }

      rsvpForm.reset();
    });
  }
}

/* --------------------------------------------------------------------------
   7. Helper Utilities
   -------------------------------------------------------------------------- */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div>${escapeHTML(message)}</div>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

/* --------------------------------------------------------------------------
   8. Add to Calendar (iPhone / Android / Google / iCal)
   -------------------------------------------------------------------------- */
function initCalendarButton() {
  const modal = document.getElementById('calendarModal');
  const closeBtn = document.getElementById('closeCalendarModalBtn');
  const downloadIcsBtn = document.getElementById('downloadIcsBtn');
  const openGoogleCalBtn = document.getElementById('openGoogleCalBtn');

  const cfg = window.EventConfigManager ? window.EventConfigManager.getConfig() : {};

  const calTitle = cfg.eventTitle || 'Eriks 50-årsfest';
  const calDetails = `${cfg.heroDescription || 'Varmt välkommen!'}\n\nKod: ${cfg.guestPin || '1976'}\nWebbplats: ${window.location.origin}\n\n${cfg.heroSubtext || ''}`;
  const calLocation = `${cfg.venueName || 'Ljunglöfska Slottet'}, ${cfg.venueAddress || ''}`;

  const eventDateObj = new Date(cfg.eventDateISO || '2026-09-19T18:00:00');
  const endDateObj = new Date(eventDateObj.getTime() + 7 * 3600 * 1000); // +7h

  function formatDateToUtcIso(d) {
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  }

  const startUtc = formatDateToUtcIso(eventDateObj);
  const endUtc = formatDateToUtcIso(endDateObj);

  const googleCalUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(calTitle) +
    '&dates=' + startUtc + '/' + endUtc +
    '&details=' + encodeURIComponent(calDetails) +
    '&location=' + encodeURIComponent(calLocation);

  if (modal) {
    document.querySelectorAll('#addToCalendarBtn, .addToCalendarBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.classList.add('active');
      });
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  if (downloadIcsBtn) {
    downloadIcsBtn.addEventListener('click', () => {
      if (window.EventConfigManager) {
        window.EventConfigManager.trackCalendarDownload('ics', 'Apple/iCal (.ics) nedladdning');
      }

      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Event Template//Jubileumsfest//SV',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:event-${Date.now()}@erik50.com`,
        `DTSTAMP:${formatDateToUtcIso(new Date())}`,
        `SUMMARY:${calTitle}`,
        `DESCRIPTION:${calDetails.replace(/\n/g, '\\n')}`,
        `LOCATION:${calLocation.replace(/,/g, '\\,')}`,
        `DTSTART:${startUtc}`,
        `DTEND:${endUtc}`,
        `URL:${window.location.href}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Påminnelse: Festen börjar imorgon!',
        'TRIGGER;RELATED=START:-P1D',
        'END:VALARM',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Påminnelse: Festen börjar om 1 timme!',
        'TRIGGER;RELATED=START:-PT1H',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `${calTitle.replace(/\s+/g, '_')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Kalenderfil (.ics) sparades! Kod: ${cfg.guestPin || '1976'}`);
      if (modal) modal.classList.remove('active');
    });
  }

  if (openGoogleCalBtn) {
    openGoogleCalBtn.setAttribute('href', googleCalUrl);
    openGoogleCalBtn.addEventListener('click', () => {
      if (window.EventConfigManager) {
        window.EventConfigManager.trackCalendarDownload('google', 'Google Calendar klick');
      }
      showToast(`Öppnar Google Calendar... (Kod: ${cfg.guestPin || '1976'})`);
      if (modal) modal.classList.remove('active');
    });
  }
}

/* --------------------------------------------------------------------------
   9. Golden Star Shower Animation ("Stjärnregn")
   -------------------------------------------------------------------------- */
function triggerGoldenStarShower() {
  if (typeof confetti !== 'function') return;

  var duration = 3.5 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { 
    startVelocity: 35, 
    spread: 360, 
    ticks: 100, 
    zIndex: 10000,
    shapes: ['star'],
    colors: ['#FFD700', '#C5A059', '#FFF8E7', '#FFFFFF', '#E6C875', '#F3E5AB']
  };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Initial center burst
  confetti(Object.assign({}, defaults, {
    particleCount: 100,
    origin: { y: 0.5 }
  }));

  // Cascading golden star shower from left and right top corners
  var interval = setInterval(function() {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 45 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { 
      particleCount: particleCount, 
      origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } 
    }));
    confetti(Object.assign({}, defaults, { 
      particleCount: particleCount, 
      origin: { x: randomInRange(0.6, 0.9), y: Math.random() - 0.2 } 
    }));
  }, 180);
}
