// Wedding Invitation JavaScript - With Photo Cover

document.addEventListener('DOMContentLoaded', function() {
    // Get guest name from URL - supports multiple formats:
    // ?nama=Budi          → query param 'nama'
    // ?to=Budi            → query param 'to'
    // ?Budi%20Santoso     → raw query string (no key)
    // #Budi%20Santoso     → hash fragment (RECOMMENDED - tidak minta file ke server, tidak 404)
    const urlParams = new URLSearchParams(window.location.search);
    let guestName = urlParams.get('nama') || urlParams.get('to');
    
    // Raw query string: ?NamaTamu (tanpa key=value)
    if (!guestName && window.location.search) {
        const queryString = window.location.search.substring(1);
        if (!queryString.includes('=')) {
            guestName = queryString;
        }
    }

    // Hash fragment: index.html#NamaTamu (tidak minta ke server → tidak 404)
    if (!guestName && window.location.hash) {
        guestName = window.location.hash.substring(1);
    }
    
    const guestNameElement = document.getElementById('guestName');
    
    if (guestName && guestNameElement) {
        const decodedName = decodeURIComponent(guestName.replace(/\+/g, ' '));
        guestNameElement.textContent = decodedName;
    }


    // Elements
    const animatedOpening = document.getElementById('animatedOpening');
    const mainContent = document.getElementById('mainContent');
    const openInvitation = document.getElementById('openInvitation');
    const closeInvitation = document.getElementById('closeInvitation');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');

    // Music State
    let isMusicPlaying = false;

    // Open Invitation
    openInvitation.addEventListener('click', function() {
        // 1. Hide cover
        animatedOpening.classList.remove('active');
        animatedOpening.style.display = 'none';
        
        // 2. Show main content (BUG FIX: Explicitly display block first)
        mainContent.style.display = 'block';
        
        // 3. Trigger animation with slight delay to allow display change to register
        setTimeout(() => {
            mainContent.classList.add('show');
        }, 10);
        
        // Show close button
        closeInvitation.style.display = 'block';
        
        // Auto play music
        playMusic();
        
        // Start countdown
        startCountdown();
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Close Invitation - Back to Cover
    closeInvitation.addEventListener('click', function() {
        // 1. Hide main content animation
        mainContent.classList.remove('show');
        
        // 2. Hide close button
        closeInvitation.style.display = 'none';
        
        // 3. Show cover
        animatedOpening.style.display = 'flex';
        // Force reflow
        void animatedOpening.offsetWidth;
        animatedOpening.classList.add('active');
        
        // 4. Pause music
        pauseMusic();
        
        // 5. Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 6. After animation fade out, set main display none
        setTimeout(() => {
            mainContent.style.display = 'none';
        }, 500);
    });

    // Music Toggle
    musicToggle.addEventListener('click', function() {
        if (isMusicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    });

    function playMusic() {
        bgMusic.play().catch(error => {
            console.log('Music play failed:', error);
        });
        isMusicPlaying = true;
        musicToggle.classList.add('playing');
    }

    function pauseMusic() {
        bgMusic.pause();
        isMusicPlaying = false;
        musicToggle.classList.remove('playing');
    }

    // Countdown Timer
    function startCountdown() {
        // Prevent multiple intervals
        if (window.countdownInterval) clearInterval(window.countdownInterval);
        
        const weddingDate = new Date('2026-03-28T08:00:00').getTime();
        
        window.countdownInterval = setInterval(function() {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            if (distance < 0) {
                clearInterval(window.countdownInterval);
                if(document.getElementById('days')) {
                    document.getElementById('days').textContent = '00';
                    document.getElementById('hours').textContent = '00';
                    document.getElementById('minutes').textContent = '00';
                    document.getElementById('seconds').textContent = '00';
                }
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if(document.getElementById('days')) {
                document.getElementById('days').textContent = String(days).padStart(2, '0');
                document.getElementById('hours').textContent = String(hours).padStart(2, '0');
                document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
                document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
            }
        }, 1000);
    }

    // ============================================================
    // SUPABASE CONFIG
    // ============================================================
    const SUPABASE_URL = 'https://cxmusrwehcdrxsntiavy.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bXVzcndlaGNkcnhzbnRpYXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzQ3NzEsImV4cCI6MjA4NjkxMDc3MX0.oM0a0Av9nT-o1TfhmBBku7z5aKz0mKccVjIbHzWGdXs';

    async function supabaseFetch(path, options = {}) {
        const { prefer, headers: extraHeaders, ...restOptions } = options;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
            ...restOptions,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': prefer || 'return=representation',
                ...(extraHeaders || {})
            }
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    }

    // ============================================================
    // RSVP Form Handling
    // ============================================================
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSuccess = document.getElementById('rsvpSuccess');
    const rsvpSummary = document.getElementById('rsvpSummary');
    const rsvpList = document.getElementById('rsvpList');
    const btnAnother = document.getElementById('btnAnother');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const allRsvpsModal = document.getElementById('allRsvpsModal');
    const closeModal = document.getElementById('closeModal');
    const allRsvpsList = document.getElementById('allRsvpsList');

    // Load existing RSVPs on page load
    loadRSVPs();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = rsvpForm.querySelector('.submit-btn');
            submitBtn.textContent = 'Mengirim...';
            submitBtn.disabled = true;

            const name = document.getElementById('name').value.trim();
            const attendance = document.getElementById('attendance').value;
            const guests = document.getElementById('guests').value;
            const message = document.getElementById('message').value.trim();

            let statusText = '';
            let statusClass = '';
            if (attendance === 'hadir') {
                statusText = '✓ Hadir';
                statusClass = 'hadir';
            } else if (attendance === 'tidak-hadir') {
                statusText = '✗ Tidak Hadir';
                statusClass = 'tidak-hadir';
            } else {
                statusText = '? Masih Ragu';
                statusClass = 'ragu';
            }

            const timestamp = new Date().toLocaleString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            try {
                await supabaseFetch('rsvps', {
                    method: 'POST',
                    prefer: 'return=minimal',
                    body: JSON.stringify({
                        name,
                        attendance,
                        status_text: statusText,
                        status_class: statusClass,
                        guests: parseInt(guests),
                        message,
                        timestamp
                    })
                });

                rsvpSummary.innerHTML = `
                    <p><strong>Nama:</strong> ${name}</p>
                    <p><strong>Status:</strong> ${statusText}</p>
                    <p><strong>Jumlah Tamu:</strong> ${guests} orang</p>
                    ${message ? `<p><strong>Ucapan:</strong> ${message}</p>` : ''}
                    <p><strong>Waktu:</strong> ${timestamp}</p>
                `;

                rsvpForm.style.display = 'none';
                rsvpSuccess.style.display = 'block';
                loadRSVPs();
                rsvpSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
                createConfetti();

            } catch (err) {
                console.error('Gagal kirim RSVP:', err);
                alert('Gagal mengirim konfirmasi. Silakan coba lagi.');
                submitBtn.textContent = 'Kirim Konfirmasi';
                submitBtn.disabled = false;
            }
        });
    }

    if (btnAnother) {
        btnAnother.addEventListener('click', function() {
            rsvpForm.reset();
            const submitBtn = rsvpForm.querySelector('.submit-btn');
            submitBtn.textContent = 'Kirim Konfirmasi';
            submitBtn.disabled = false;
            rsvpForm.style.display = 'block';
            rsvpSuccess.style.display = 'none';
            rsvpForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            loadAllRSVPs();
            allRsvpsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            allRsvpsModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    if (allRsvpsModal) {
        allRsvpsModal.addEventListener('click', function(e) {
            if (e.target === allRsvpsModal) {
                allRsvpsModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    function renderRsvpItem(rsvp) {
        return `
            <div class="rsvp-item">
                <div class="rsvp-name">${rsvp.name}</div>
                <span class="rsvp-status ${rsvp.status_class}">${rsvp.status_text}</span>
                <div class="rsvp-guests">👥 ${rsvp.guests} orang</div>
                ${rsvp.message ? `<div class="rsvp-message">"${rsvp.message}"</div>` : ''}
                <div style="font-size: 12px; color: #999; margin-top: 8px;">${rsvp.timestamp}</div>
            </div>
        `;
    }

    async function loadRSVPs() {
        try {
            const data = await supabaseFetch('rsvps?select=*&order=created_at.desc&limit=5');

            if (!data || data.length === 0) {
                if (rsvpList) rsvpList.innerHTML = '<p class="no-rsvp">Belum ada doa dan harapan</p>';
                if (viewAllBtn) viewAllBtn.style.display = 'none';
                return;
            }

            if (rsvpList) rsvpList.innerHTML = data.map(renderRsvpItem).join('');

            // Check total count for "View All" button
            const allData = await supabaseFetch('rsvps?select=id');
            const total = allData ? allData.length : 0;
            if (viewAllBtn) viewAllBtn.style.display = total > 5 ? 'block' : 'none';

        } catch (err) {
            console.error('Gagal load RSVPs:', err);
            if (rsvpList) rsvpList.innerHTML = '<p class="no-rsvp">Gagal memuat data</p>';
        }
    }

    async function loadAllRSVPs() {
        if (allRsvpsList) allRsvpsList.innerHTML = '<p class="no-rsvp">Memuat...</p>';
        try {
            const data = await supabaseFetch('rsvps?select=*&order=created_at.desc');
            if (!data || data.length === 0) {
                if (allRsvpsList) allRsvpsList.innerHTML = '<p class="no-rsvp">Belum ada doa dan harapan</p>';
                return;
            }
            if (allRsvpsList) allRsvpsList.innerHTML = data.map(renderRsvpItem).join('');
        } catch (err) {
            console.error('Gagal load semua RSVPs:', err);
            if (allRsvpsList) allRsvpsList.innerHTML = '<p class="no-rsvp">Gagal memuat data</p>';
        }
    }


    function createConfetti() {
        const colors = ['#000', '#fff'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                top: -10px;
                left: ${Math.random() * 100}vw;
                opacity: 1;
                transform: rotate(${Math.random() * 360}deg);
                pointer-events: none;
                z-index: 9999;
                border: 1px solid black;
            `;

            document.body.appendChild(confetti);

            const animation = confetti.animate([
                { 
                    transform: `translate(0, 0) rotate(0deg)`,
                    opacity: 1
                },
                { 
                    transform: `translate(${(Math.random() - 0.5) * 200}px, ${window.innerHeight}px) rotate(${Math.random() * 720}deg)`,
                    opacity: 0
                }
            ], {
                duration: 2000 + Math.random() * 2000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            animation.onfinish = () => confetti.remove();
        }
    }

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        // Skip animated opening since it has its own logic
        if (section.id !== 'animatedOpening') {
            section.style.opacity = '0';
            observer.observe(section);
        }
    });

    // Copy Account Number and Address Function
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const accountNumber = this.getAttribute('data-account');
            const bankName = this.getAttribute('data-bank');
            const copyType = this.getAttribute('data-copy');
            
            let textToCopy = '';
            let successMessage = '';
            
            if (copyType === 'address') {
                textToCopy = 'Perumahan Rajeg Hill Residence Blok D7 no 4, Tanjakan Mekar (Blok D7 no4 Masjid), KAB. TANGERANG, RAJEG, BANTEN, ID, 15540';
                successMessage = 'Alamat berhasil disalin!';
            } else if (accountNumber) {
                textToCopy = accountNumber;
                successMessage = `Nomor rekening ${bankName} berhasil disalin!`;
            }
            
            if (textToCopy) {
                // Copy to clipboard
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Change button text temporarily
                    const originalHTML = this.innerHTML;
                    this.innerHTML = '<span class="copy-icon">✓</span> Tersalin!';
                    this.classList.add('copied');
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        this.innerHTML = originalHTML;
                        this.classList.remove('copied');
                    }, 2000);
                    
                    // Show notification
                    showNotification(successMessage);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                    showNotification('Gagal menyalin');
                });
            }
        });
    });

    // Show Notification Function
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #22c55e;
            color: white;
            padding: 15px 30px;
            border-radius: 30px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }

    // Add notification animations
    const notifStyle = document.createElement('style');
    notifStyle.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
        
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            to {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
        }
    `;
    document.head.appendChild(notifStyle);

    // Console message
    console.log('%c Selamat Menempuh Hidup Baru! ', 'font-size: 20px; font-weight: bold;');
    console.log('%cZendy & Dilla - 28 Maret 2026', 'font-size: 14px;');
});