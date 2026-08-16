// ==========================================================================
// ERIK 50 ÅR - LOGIC & INTERACTION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initPinLock();
  initCountdown();
  initNavigation();
  initToastmasterModal();
  initSongWishlist();
  initGreetingsWall();
  initForms();
});

/* --------------------------------------------------------------------------
   0. PIN Code Lock (PIN: 1976)
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
    if (input.value.length === 4) {
      validatePin(input.value);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    validatePin(input.value);
  });

  function validatePin(code) {
    if (code === '1976') {
      sessionStorage.setItem('erik50_unlocked', 'true');
      overlay.classList.add('unlocked');
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } else {
      if (errorMsg) errorMsg.classList.add('active');
      input.value = '';
      input.focus();
    }
  }
}

/* --------------------------------------------------------------------------
   1. Live Countdown Timer (Target: 19 Sep 2026, 18:00)
   -------------------------------------------------------------------------- */
function initCountdown() {
  const partyDate = new Date('2026-09-19T18:00:00').getTime();

  function update() {
    const now = new Date().getTime();
    const distance = partyDate - now;

    if (distance < 0) {
      document.getElementById('countdown').innerHTML = `
        <div style="font-size: 1.5rem; color: var(--gold-light); font-weight: 500;">
          Jubileet pågår
        </div>
      `;
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
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

      if (attendance === 'ja') {
        showToast(`Tack för din O.S.A., ${name}. Välkommen till Ljunglöfska Slottet.`);
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
