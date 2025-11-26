// Home Page JavaScript
class HomePageAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupTypingAnimation();
        this.setupCounters();
        this.setupCarousel();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
        this.createGradientDefs();
    }

    createGradientDefs() {
        // Create SVG gradient definitions
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'gradient';
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '0%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#2d8f47;stop-opacity:1');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:#4CAF50;stop-opacity:1');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
        document.body.appendChild(svg);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Trigger counter animation for visible counters
                    if (entry.target.classList.contains('counter')) {
                        this.animateCounter(entry.target);
                    }
                    
                    // Trigger impact meter animation
                    if (entry.target.classList.contains('impact-meter')) {
                        this.animateImpactMeter(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe elements
        document.querySelectorAll('.reveal-animation, .counter, .impact-meter').forEach(el => {
            observer.observe(el);
        });
    }

    setupTypingAnimation() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;

        const words = typingElement.dataset.words.split(',');
        let currentWordIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;

        const typeSpeed = 100;
        const deleteSpeed = 50;
        const delayBetweenWords = 2000;

        const type = () => {
            const currentWord = words[currentWordIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, currentCharIndex - 1);
                currentCharIndex--;
            } else {
                typingElement.textContent = currentWord.substring(0, currentCharIndex + 1);
                currentCharIndex++;
            }

            let speed = isDeleting ? deleteSpeed : typeSpeed;

            if (!isDeleting && currentCharIndex === currentWord.length) {
                speed = delayBetweenWords;
                isDeleting = true;
            } else if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                currentWordIndex = (currentWordIndex + 1) % words.length;
            }

            setTimeout(type, speed);
        };

        type();
    }

    setupCounters() {
        // Counter animation will be triggered by intersection observer
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current >= target) {
                element.textContent = target.toLocaleString();
            } else {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            }
        };

        updateCounter();
    }

    animateImpactMeter(element) {
        const percentage = element.dataset.percentage;
        const circle = element.querySelector('circle:last-child');
        const circumference = 2 * Math.PI * 45; // radius = 45
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 2s ease-in-out';
            circle.style.strokeDashoffset = offset;
        }, 100);
    }

    setupCarousel() {
        const track = document.querySelector('.testimonial-track');
        const cards = document.querySelectorAll('.testimonial-card');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const dots = document.querySelectorAll('.dot');
        
        if (!track || !cards.length) return;

        let currentSlide = 0;
        const maxSlides = cards.length;

        const updateCarousel = () => {
            // Update cards
            cards.forEach((card, index) => {
                card.classList.toggle('active', index === currentSlide);
            });

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });

            // Update track position
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % maxSlides;
            updateCarousel();
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + maxSlides) % maxSlides;
            updateCarousel();
        };

        const goToSlide = (index) => {
            currentSlide = index;
            updateCarousel();
        };

        // Event listeners
        nextBtn?.addEventListener('click', nextSlide);
        prevBtn?.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Auto-play
        setInterval(nextSlide, 5000);

        // Initialize
        updateCarousel();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (!toggle || !navMenu) return;

        toggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            toggle.classList.toggle('active');
        });

        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                toggle.classList.remove('active');
            });
        });
    }
}

// Particle System
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.canvas = this.createCanvas();
        this.ctx = this.canvas.getContext('2d');
        this.init();
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';
        document.body.appendChild(canvas);
        return canvas;
    }

    init() {
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(45, 143, 71, ${particle.opacity})`;
            this.ctx.fill();
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Enhanced Button Interactions
class ButtonEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupButtonParticles();
        this.setupHoverEffects();
    }

    setupButtonParticles() {
        document.querySelectorAll('.primary-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createClickParticles(e);
            });
        });
    }

    createClickParticles(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = 'white';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const angle = (360 / 12) * i;
            const velocity = 100;
            
            particle.style.animation = `
                particle-burst-${i} 0.6s ease-out forwards
            `;
            
            // Create unique keyframe animation
            const keyframes = `
                @keyframes particle-burst-${i} {
                    to {
                        transform: translate(
                            ${Math.cos(angle * Math.PI / 180) * velocity}px,
                            ${Math.sin(angle * Math.PI / 180) * velocity}px
                        ) scale(0);
                        opacity: 0;
                    }
                }
            `;
            
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);
            
            e.currentTarget.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
                style.remove();
            }, 600);
        }
    }

    setupHoverEffects() {
        document.querySelectorAll('.feature-card, .impact-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomePageAnimations();
    new ParticleSystem();
    new ButtonEnhancements();
    
    // Add some additional CSS for dynamic effects
    const additionalStyles = document.createElement('style');
    additionalStyles.textContent = `
        .feature-card::after,
        .impact-card::after {
            content: '';
            position: absolute;
            top: var(--mouse-y, 50%);
            left: var(--mouse-x, 50%);
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(45, 143, 71, 0.1), transparent);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        
        .feature-card:hover::after,
        .impact-card:hover::after {
            opacity: 1;
        }
        
        @media (max-width: 768px) {
            .nav-menu.active {
                display: flex;
                flex-direction: column;
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                padding: 2rem;
                box-shadow: var(--shadow-medium);
                gap: 1rem;
            }
            
            .mobile-menu-toggle.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .mobile-menu-toggle.active span:nth-child(2) {
                opacity: 0;
            }
            
            .mobile-menu-toggle.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }
        }
    `;
    document.head.appendChild(additionalStyles);
});
