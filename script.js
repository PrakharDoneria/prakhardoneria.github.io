document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Animate hamburger to X
            const spans = menuToggle.querySelectorAll('span');
            if (navLinks.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const spans = menuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ============================================
    // Scroll Reveal Animations
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================================
    // Scroll-Based Navigation Visibility
    // ============================================
    const nav = document.querySelector('nav');
    const scrollThreshold = 300; // Show nav after scrolling 300px
    let lastScrollY = 0;
    let ticking = false;

    function updateNavVisibility() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > scrollThreshold) {
            nav.classList.add('nav-visible');
            nav.classList.add('nav-scrolled');
        } else {
            nav.classList.remove('nav-visible');
            nav.classList.remove('nav-scrolled');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavVisibility);
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    updateNavVisibility();

    // ============================================
    // Load Dynamic Stats
    // ============================================
    async function loadStats() {
        const statsIds = {
            'projects-count': 'data/projects.json',
            'certs-count': 'data/certifications.json',
            'education-count': 'data/education.json',
            'skills-count': 'data/skills.json'
        };

        for (const [id, url] of Object.entries(statsIds)) {
            const element = document.getElementById(id);
            if (!element) continue;

            try {
                const response = await fetch(url);
                const data = await response.json();

                let count = data.length;
                if (id === 'skills-count') {
                    count = [...new Set(data.map(s => s.Name))].length;
                }

                // Animate number counting
                animateValue(element, 0, count, 1000);
            } catch (e) {
                element.textContent = '--';
            }
        }
    }

    function animateValue(element, start, end, duration) {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * (end - start) + start);

            element.textContent = value + '+';

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ============================================
    // Hero Media with Caching
    // ============================================
    async function setupHeroMedia() {
        const videoEl = document.getElementById('hero-video');
        const imgEl = document.getElementById('hero-img');

        if (!videoEl || !imgEl) return;

        const cacheName = 'portfolio-media-v1';

        async function getMedia(url) {
            if ('caches' in window) {
                try {
                    const cache = await caches.open(cacheName);
                    let response = await cache.match(url);

                    if (!response) {
                        response = await fetch(url);
                        cache.put(url, response.clone());
                    }

                    const blob = await response.blob();
                    return URL.createObjectURL(blob);
                } catch (e) {
                    return url;
                }
            }
            return url;
        }

        // Load image first
        try {
            const imgUrl = await getMedia('assets/webmedia/background.jpg');
            imgEl.src = imgUrl;
        } catch (e) { }

        // Load video in background
        try {
            const videoUrl = await getMedia('assets/webmedia/background.mp4');
            videoEl.src = videoUrl;
            videoEl.playbackRate = 0.7;
            videoEl.oncanplaythrough = () => {
                videoEl.classList.add('ready');
            };
        } catch (e) { }
    }

    // ============================================
    // Set Current Year
    // ============================================
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ============================================
    // Mobile Swipe Cards (Tinder-style)
    // ============================================
    function initSwipeCards() {
        // Only initialize on mobile
        if (window.innerWidth > 768) return;

        const swipeContainers = document.querySelectorAll('.swipe-container');

        swipeContainers.forEach(container => {
            const cards = container.querySelectorAll('.card');
            if (cards.length === 0) return;

            let currentIndex = 0;
            let startX = 0;
            let currentX = 0;
            let isDragging = false;

            // Update card states
            function updateCardStack() {
                cards.forEach((card, index) => {
                    card.classList.remove('swipe-active', 'swipe-next', 'swipe-third', 'swiping-left', 'swiping-right');
                    card.style.transform = '';

                    if (index === currentIndex) {
                        card.classList.add('swipe-active');
                    } else if (index === currentIndex + 1) {
                        card.classList.add('swipe-next');
                    } else if (index === currentIndex + 2) {
                        card.classList.add('swipe-third');
                    }
                });

                // Update counter dots
                const counter = container.parentElement.querySelector('.swipe-counter');
                if (counter) {
                    const dots = counter.querySelectorAll('.swipe-counter-dot');
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('active', index === currentIndex);
                    });
                }

                // Update nav buttons
                const nav = container.parentElement.querySelector('.swipe-nav');
                if (nav) {
                    const prevBtn = nav.querySelector('.swipe-prev');
                    const nextBtn = nav.querySelector('.swipe-next-btn');
                    if (prevBtn) prevBtn.disabled = currentIndex === 0;
                    if (nextBtn) nextBtn.disabled = currentIndex >= cards.length - 1;
                }
            }

            // Swipe to next card
            function swipeNext(direction = 'left') {
                if (currentIndex >= cards.length - 1) return;

                const currentCard = cards[currentIndex];
                currentCard.classList.add(direction === 'left' ? 'swiping-left' : 'swiping-right');

                setTimeout(() => {
                    currentIndex++;
                    updateCardStack();
                }, 400);
            }

            // Swipe to previous card
            function swipePrev() {
                if (currentIndex <= 0) return;
                currentIndex--;
                updateCardStack();
            }

            // Touch events for active card
            function handleTouchStart(e) {
                if (!e.target.closest('.swipe-active')) return;
                isDragging = true;
                startX = e.touches[0].clientX;
                currentX = startX;
            }

            function handleTouchMove(e) {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                const diffX = currentX - startX;
                const activeCard = container.querySelector('.swipe-active');

                if (activeCard) {
                    const rotation = diffX * 0.05;
                    activeCard.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
                    activeCard.style.transition = 'none';
                }
            }

            function handleTouchEnd() {
                if (!isDragging) return;
                isDragging = false;

                const diffX = currentX - startX;
                const threshold = 80;
                const activeCard = container.querySelector('.swipe-active');

                if (activeCard) {
                    activeCard.style.transition = '';

                    if (Math.abs(diffX) > threshold) {
                        if (diffX < 0) {
                            swipeNext('left');
                        } else {
                            swipePrev();
                        }
                    } else {
                        activeCard.style.transform = '';
                    }
                }
            }

            container.addEventListener('touchstart', handleTouchStart, { passive: true });
            container.addEventListener('touchmove', handleTouchMove, { passive: true });
            container.addEventListener('touchend', handleTouchEnd);

            // Navigation button events
            const nav = container.parentElement.querySelector('.swipe-nav');
            if (nav) {
                const prevBtn = nav.querySelector('.swipe-prev');
                const nextBtn = nav.querySelector('.swipe-next-btn');

                if (prevBtn) prevBtn.addEventListener('click', swipePrev);
                if (nextBtn) nextBtn.addEventListener('click', () => swipeNext('left'));
            }

            // Initialize
            updateCardStack();
        });
    }

    // Initialize swipe cards after content is loaded
    function setupSwipeableContent() {
        if (window.innerWidth > 768) return;

        // Convert card grids to swipe containers on mobile
        document.querySelectorAll('.card-grid').forEach(grid => {
            const cards = grid.querySelectorAll('.card');
            if (cards.length < 2) return;

            // Wrap in swipe container
            grid.classList.add('swipe-container');

            // Add swipe hint
            const hint = document.createElement('div');
            hint.className = 'swipe-hint mobile-only';
            hint.innerHTML = `
                <div class="swipe-hint-icon"><span></span><span></span><span></span></div>
                <span>Swipe to see more</span>
            `;
            grid.parentElement.insertBefore(hint, grid);

            // Add counter dots
            const counter = document.createElement('div');
            counter.className = 'swipe-counter mobile-only';
            counter.innerHTML = Array.from(cards).map((_, i) =>
                `<div class="swipe-counter-dot ${i === 0 ? 'active' : ''}"></div>`
            ).join('');
            grid.parentElement.appendChild(counter);

            // Add navigation buttons
            const nav = document.createElement('div');
            nav.className = 'swipe-nav mobile-only';
            nav.innerHTML = `
                <button class="swipe-nav-btn swipe-prev" disabled>←</button>
                <button class="swipe-nav-btn swipe-next-btn">→</button>
            `;
            grid.parentElement.appendChild(nav);
        });

        // Initialize swipe functionality
        initSwipeCards();
    }

    // ============================================
    // Initialize
    // ============================================
    loadStats();
    setupHeroMedia();

    // Setup swipe cards after a short delay to ensure DOM is ready
    setTimeout(setupSwipeableContent, 100);

    // Re-initialize on resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth <= 768) {
                initSwipeCards();
            }
        }, 250);
    });
});
