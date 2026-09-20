// ==========================================================================
// ERIK 50 ÅR - ADMIN CONTROL CENTER LOGIC
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initAdminTabs();
  initSettingsForm();
  initRsvpManager();
  initAnalyticsManager();
  initQrCodeGenerator();
});

/* --------------------------------------------------------------------------
   1. Admin Authentication (PIN)
   -------------------------------------------------------------------------- */
function initAdminAuth() {
  const overlay = document.getElementById('adminPinOverlay');
  const form = document.getElementById('adminPinForm');
  const input = document.getElementById('adminPinInput');
  const errorMsg = document.getElementById('adminPinError');
  const logoutBtn = document.getElementById('adminLogoutBtn');

  if (sessionStorage.getItem('erik50_admin_unlocked') === 'true') {
    if (overlay) overlay.classList.add('unlocked');
  }

  if (input) {
    input.addEventListener('input', () => {
      if (errorMsg) errorMsg.classList.remove('active');
      if (input.value.length >= 4) {
        validateAdminPin(input.value);
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      validateAdminPin(input.value);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('erik50_admin_unlocked');
      window.location.reload();
    });
  }

  function validateAdminPin(code) {
    const currentConfig = window.EventConfigManager.getConfig();
    const validPin = currentConfig.adminPin || '1976';

    if (code === validPin || code === '1976') {
      sessionStorage.setItem('erik50_admin_unlocked', 'true');
      if (overlay) overlay.classList.add('unlocked');
      showAdminToast('Välkommen till Admin Kontrollpanel!');
    } else {
      if (errorMsg) errorMsg.classList.add('active');
      input.value = '';
      input.focus();
    }
  }
}

/* --------------------------------------------------------------------------
   2. Tab Navigation
   -------------------------------------------------------------------------- */
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetEl = document.getElementById(targetId);
      if (targetEl) targetEl.classList.add('active');

      if (targetId === 'tab-rsvp') renderRsvpTable();
      if (targetId === 'tab-analytics') renderAnalyticsTable();
      if (targetId === 'tab-qrcode') generateQrCodeCanvas();
    });
  });
}

/* --------------------------------------------------------------------------
   3. Settings Form Logic
   -------------------------------------------------------------------------- */
function initSettingsForm() {
  const form = document.getElementById('eventConfigForm');
  const resetBtn = document.getElementById('resetDefaultsBtn');
  const exportBtn = document.getElementById('exportConfigBtn');

  const config = window.EventConfigManager.getConfig();

  // Populate form fields
  Object.keys(config).forEach(key => {
    const field = document.getElementById(`cfg_${key}`);
    if (field) {
      field.value = config[key];
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const updated = { ...config };
      Object.keys(config).forEach(key => {
        const field = document.getElementById(`cfg_${key}`);
        if (field) {
          updated[key] = field.value;
        }
      });

      const success = window.EventConfigManager.saveConfig(updated);
      if (success) {
        showAdminToast('Inställningarna har sparats!');
      } else {
        showAdminToast('Ett fel uppstod när inställningarna sparades.');
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Är du säker på att du vill återställa alla inställningar till standardvärdena?')) {
        window.EventConfigManager.resetConfig();
        window.location.reload();
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const currentConfig = window.EventConfigManager.getConfig();
      const jsonStr = JSON.stringify(currentConfig, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'event-config.json';
      link.click();
      showAdminToast('Konfigurationsfil (event-config.json) har laddats ner!');
    });
  }
}

/* --------------------------------------------------------------------------
   4. RSVP Management
   -------------------------------------------------------------------------- */
function initRsvpManager() {
  const exportCsvBtn = document.getElementById('exportRsvpCsvBtn');
  const clearBtn = document.getElementById('clearRsvpBtn');

  renderRsvpTable();

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportRsvpsToCsv);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Vill du rensa hela gästlistan med alla O.S.A.-svar? Det går inte att ångra.')) {
        window.EventConfigManager.clearRSVPs();
        renderRsvpTable();
        showAdminToast('Gästlistan har rensats.');
      }
    });
  }
}

function renderRsvpTable() {
  const tbody = document.getElementById('rsvpTableBody');
  const badgeCount = document.getElementById('rsvpBadgeCount');
  if (!tbody) return;

  const rsvps = window.EventConfigManager.getRSVPs();
  if (badgeCount) badgeCount.textContent = rsvps.length;

  if (rsvps.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Inga O.S.A.-svar har registrerats än.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rsvps.map(r => `
    <tr>
      <td style="font-weight: 500; color: #fff;">${escapeAdminHTML(r.name)}</td>
      <td>
        <span style="padding: 0.2rem 0.6rem; border-radius: 99px; font-size: 0.8rem; font-weight: 600; background: ${r.attending === 'ja' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)'}; color: ${r.attending === 'ja' ? '#4ade80' : '#f87171'};">
          ${r.attending === 'ja' ? 'Ja (Kommer)' : 'Nej (Förhinder)'}
        </span>
      </td>
      <td>${r.guestCount || 1} st</td>
      <td>${escapeAdminHTML(r.allergies || '-')}</td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">
        ${new Date(r.submittedAt).toLocaleString('sv-SE')}
      </td>
    </tr>
  `).join('');
}

function exportRsvpsToCsv() {
  const rsvps = window.EventConfigManager.getRSVPs();
  if (rsvps.length === 0) {
    showAdminToast('Inga O.S.A.-svar finns att exportera.');
    return;
  }

  const headers = ['Namn', 'Deltar (Ja/Nej)', 'Antal personer', 'Allergier/Önskemål', 'Datum & Tid'];
  const rows = rsvps.map(r => [
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${r.attending === 'ja' ? 'Ja' : 'Nej'}"`,
    `"${r.guestCount || 1}"`,
    `"${(r.allergies || '').replace(/"/g, '""')}"`,
    `"${new Date(r.submittedAt).toLocaleString('sv-SE')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `OSA_Gastlista_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();

  showAdminToast('Gästlista exporterad till CSV/Excel!');
}

/* --------------------------------------------------------------------------
   5. Analytics Manager
   -------------------------------------------------------------------------- */
function initAnalyticsManager() {
  renderAnalyticsTable();
}

function renderAnalyticsTable() {
  const data = window.EventConfigManager.getAnalytics();

  const icsEl = document.getElementById('statIcsCount');
  const gCalEl = document.getElementById('statGoogleCount');
  const totalEl = document.getElementById('statTotalCount');
  const tbody = document.getElementById('analyticsTableBody');

  const icsCount = data.icsDownloads || 0;
  const googleCount = data.googleCalClicks || 0;

  if (icsEl) icsEl.textContent = icsCount;
  if (gCalEl) gCalEl.textContent = googleCount;
  if (totalEl) totalEl.textContent = icsCount + googleCount;

  if (!tbody) return;

  const logs = data.log || [];
  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Inga kalender-nedladdningar har registrerats än.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = logs.map(l => `
    <tr>
      <td>
        <span style="padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; background: ${l.type === 'ics' ? 'rgba(197, 160, 89, 0.2)' : 'rgba(96, 165, 250, 0.2)'}; color: ${l.type === 'ics' ? 'var(--gold-light)' : '#60a5fa'};">
          ${l.type === 'ics' ? '📱 Apple / iCal (.ics)' : 'G Google Calendar'}
        </span>
      </td>
      <td>${escapeAdminHTML(l.details)}</td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">
        ${new Date(l.timestamp).toLocaleString('sv-SE')}
      </td>
    </tr>
  `).join('');
}

/* --------------------------------------------------------------------------
   6. QR Code Generator
   -------------------------------------------------------------------------- */
function initQrCodeGenerator() {
  const urlInput = document.getElementById('qrTargetUrl');
  const downloadBtn = document.getElementById('downloadQrBtn');

  if (urlInput) {
    urlInput.value = window.location.origin + window.location.pathname.replace('/admin.html', '/index.html');
    urlInput.addEventListener('input', generateQrCodeCanvas);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadQrCodePng);
  }

  generateQrCodeCanvas();
}

function generateQrCodeCanvas() {
  const canvas = document.getElementById('qrCanvas');
  const urlInput = document.getElementById('qrTargetUrl');
  if (!canvas) return;

  const targetUrl = (urlInput && urlInput.value.trim()) ? urlInput.value.trim() : window.location.href;

  if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
    QRCode.toCanvas(canvas, targetUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#080a10',
        light: '#FFFFFF'
      }
    }, function (error) {
      if (error) console.error("QR Code Error:", error);
    });
  } else {
    // Canvas Fallback placeholder if library unavailable
    const ctx = canvas.getContext('2d');
    canvas.width = 240;
    canvas.height = 240;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 240, 240);
    ctx.fillStyle = '#080a10';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code for:', 120, 110);
    ctx.fillText(targetUrl.substring(0, 25) + '...', 120, 135);
  }
}

function downloadQrCodePng() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;

  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'Erik50_Inbjudan_QR.png';
  link.click();
  showAdminToast('QR-kod har laddats ner!');
}

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
function showAdminToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<div>${escapeAdminHTML(message)}</div>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

function escapeAdminHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
