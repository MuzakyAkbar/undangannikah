// Wedding Invitation JavaScript - With Photo Cover

document.addEventListener('DOMContentLoaded', function() {
    // Get guest name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    let guestName = urlParams.get('nama') || urlParams.get('to');
    
    // If no named parameter, check if there's any query string (e.g., ?Akbar%20Keluarga)
    if (!guestName && window.location.search) {
        const queryString = window.location.search.substring(1); // Remove the '?'
        // If query string doesn't contain '=', treat the whole thing as the name
        if (!queryString.includes('=')) {
            guestName = queryString;
        }
    }
    
    const guestNameElement = document.getElementById('guestName');
    
    if (guestName && guestNameElement) {
        // Decode and display the name
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

    // RSVP Form Handling
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSuccess = document.getElementById('rsvpSuccess');
    const rsvpSummary = document.getElementById('rsvpSummary');
    const rsvpList = document.getElementById('rsvpList');
    const btnAnother = document.getElementById('btnAnother');
    const viewAllBtn = document.getElementById('viewAllBtn');
    const allRsvpsModal = document.getElementById('allRsvpsModal');
    const closeModal = document.getElementById('closeModal');
    const allRsvpsList = document.getElementById('allRsvpsList');

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
                timestamp: new Date().toLocaleString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
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

    // View All Button
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            loadAllRSVPs();
            allRsvpsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            allRsvpsModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    if (allRsvpsModal) {
        allRsvpsModal.addEventListener('click', function(e) {
            if (e.target === allRsvpsModal) {
                allRsvpsModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
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
            if(rsvpList) rsvpList.innerHTML = '<p class="no-rsvp">Belum ada doa dan harapan</p>';
            if(viewAllBtn) viewAllBtn.style.display = 'none';
            return;
        }

        // Show only first 5
        const recentRsvps = rsvps.slice(0, 5);
        
        if(rsvpList) {
            rsvpList.innerHTML = recentRsvps.map(rsvp => `
                <div class="rsvp-item">
                    <div class="rsvp-name">${rsvp.name}</div>
                    <span class="rsvp-status ${rsvp.statusClass}">${rsvp.statusText}</span>
                    <div class="rsvp-guests">👥 ${rsvp.guests} orang</div>
                    ${rsvp.message ? `<div class="rsvp-message">"${rsvp.message}"</div>` : ''}
                    <div style="font-size: 12px; color: #999; margin-top: 8px;">${rsvp.timestamp}</div>
                </div>
            `).join('');
        }

        // Show "View All" button if more than 5
        if (viewAllBtn) {
            if (rsvps.length > 5) {
                viewAllBtn.style.display = 'block';
            } else {
                viewAllBtn.style.display = 'none';
            }
        }
    }

    function loadAllRSVPs() {
        let rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        
        if (rsvps.length === 0) {
            if(allRsvpsList) allRsvpsList.innerHTML = '<p class="no-rsvp">Belum ada doa dan harapan</p>';
            return;
        }

        if(allRsvpsList) {
            allRsvpsList.innerHTML = rsvps.map(rsvp => `
                <div class="rsvp-item">
                    <div class="rsvp-name">${rsvp.name}</div>
                    <span class="rsvp-status ${rsvp.statusClass}">${rsvp.statusText}</span>
                    <div class="rsvp-guests">👥 ${rsvp.guests} orang</div>
                    ${rsvp.message ? `<div class="rsvp-message">"${rsvp.message}"</div>` : ''}
                    <div style="font-size: 12px; color: #999; margin-top: 8px;">${rsvp.timestamp}</div>
                </div>
            `).join('');
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
            font-family: 'Kalam', cursive;
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