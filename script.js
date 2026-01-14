// Wedding Invitation JavaScript - With RSVP Form

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const coverSection = document.getElementById('coverSection');
    const mainContent = document.getElementById('mainContent');
    const openInvitation = document.getElementById('openInvitation');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');

    // Music State
    let isMusicPlaying = false;

    // Open Invitation
    openInvitation.addEventListener('click', function() {
        // Add animation
        coverSection.style.animation = 'fadeOut 0.8s ease-out forwards';
        
        setTimeout(() => {
            coverSection.classList.remove('active');
            coverSection.style.display = 'none';
            mainContent.classList.add('show');
            
            // Auto play music
            playMusic();
            
            // Start countdown
            startCountdown();
            
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
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
        const weddingDate = new Date('2026-03-28T08:00:00').getTime();
        
        const countdown = setInterval(function() {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            if (distance < 0) {
                clearInterval(countdown);
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        }, 1000);
    }

    // RSVP Form Handling
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSuccess = document.getElementById('rsvpSuccess');
    const rsvpSummary = document.getElementById('rsvpSummary');
    const rsvpList = document.getElementById('rsvpList');
    const btnAnother = document.getElementById('btnAnother');

    // Load existing RSVPs
    loadRSVPs();

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const attendance = document.getElementById('attendance').value;
            const guests = document.getElementById('guests').value;
            const message = document.getElementById('message').value;

            // Get status text
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

            // Create RSVP object
            const rsvp = {
                id: Date.now(),
                name: name,
                attendance: attendance,
                statusText: statusText,
                statusClass: statusClass,
                guests: guests,
                message: message,
                timestamp: new Date().toLocaleString('id-ID')
            };

            // Save to localStorage
            saveRSVP(rsvp);

            // Show summary
            rsvpSummary.innerHTML = `
                <p><strong>Nama:</strong> ${name}</p>
                <p><strong>Status:</strong> ${statusText}</p>
                <p><strong>Jumlah Tamu:</strong> ${guests} orang</p>
                ${message ? `<p><strong>Ucapan:</strong> ${message}</p>` : ''}
                <p><strong>Waktu:</strong> ${rsvp.timestamp}</p>
            `;

            // Hide form, show success
            rsvpForm.style.display = 'none';
            rsvpSuccess.style.display = 'block';

            // Reload RSVP list
            loadRSVPs();

            // Scroll to success message
            rsvpSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Show confetti
            createConfetti();
        });
    }

    if (btnAnother) {
        btnAnother.addEventListener('click', function() {
            rsvpForm.reset();
            rsvpForm.style.display = 'block';
            rsvpSuccess.style.display = 'none';
            rsvpForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function saveRSVP(rsvp) {
        let rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        rsvps.unshift(rsvp);
        localStorage.setItem('wedding_rsvps', JSON.stringify(rsvps));
    }

    function loadRSVPs() {
        let rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        
        if (rsvps.length === 0) {
            rsvpList.innerHTML = '<p class="no-rsvp">Belum ada konfirmasi</p>';
            return;
        }

        rsvpList.innerHTML = rsvps.map(rsvp => `
            <div class="rsvp-item">
                <div class="rsvp-name">${rsvp.name}</div>
                <span class="rsvp-status ${rsvp.statusClass}">${rsvp.statusText}</span>
                <div class="rsvp-guests">👥 ${rsvp.guests} orang</div>
                ${rsvp.message ? `<div class="rsvp-message">"${rsvp.message}"</div>` : ''}
            </div>
        `).join('');
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
        section.style.opacity = '0';
        observer.observe(section);
    });

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: scale(0.95);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Console message
    console.log('%c💑 Selamat Menempuh Hidup Baru! 💑', 'font-size: 20px; font-weight: bold;');
    console.log('%cZendy & Dilla - 28 Maret 2026', 'font-size: 14px;');
});