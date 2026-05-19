/* Interactive Script for Neuroredes Website
   Features: Interactive Canvas Network, Mobile Navbar, Sticky Header, Scroll Animations
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header and Active Link Track
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        // Sticky class
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active link tracking
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}` || 
                (currentSectionId === '' && link.getAttribute('href') === '#home')) {
                link.classList.add('active');
            }
        });
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-links');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
        
        // Close menu when link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }

    // 3. Scroll Reveal Animation (Intersection Observer)
    const fadeSections = document.querySelectorAll('.fade-in-section');
    if (fadeSections.length > 0) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        fadeSections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // 4. Interactive HTML5 Canvas Network Background
    const canvas = document.getElementById('canvas-network');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;
        
        const particles = [];
        const maxParticles = window.innerWidth < 768 ? 40 : 90;
        const connectionDistance = 120;
        const mouse = { x: null, y: null, radius: 180 };
        
        // Brand Colors
        const colors = [
            'rgba(44, 93, 164, ',   /* Royal Blue #2C5DA4 */
            'rgba(36, 168, 207, '    /* Sky Cyan #24A8CF */
        ];

        // Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 2.5 + 1.5;
                this.colorBase = colors[Math.floor(Math.random() * colors.length)];
                this.opacity = Math.random() * 0.5 + 0.3;
            }
            
            update() {
                // Border collision
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
                
                // Move
                this.x += this.vx;
                this.y += this.vy;
                
                // Mouse interaction (push away gently)
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.x += Math.cos(angle) * force * 1.2;
                        this.y += Math.sin(angle) * force * 1.2;
                    }
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.colorBase + this.opacity + ')';
                ctx.fill();
            }
        }
        
        // Initialize particles
        function init() {
            particles.length = 0;
            for (let i = 0; i < maxParticles; i++) {
                particles.push(new Particle());
            }
        }
        
        // Resize Handler
        window.addEventListener('resize', () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            init();
        });
        
        // Mouse Move Track
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        
        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });
        
        // Animation Loop
        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < connectionDistance) {
                        // Opacity decreases with distance
                        const alpha = (1 - (dist / connectionDistance)) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        // Create a gradient line between logo colors
                        const grad = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        grad.addColorStop(0, `rgba(44, 93, 164, ${alpha})`);
                        grad.addColorStop(1, `rgba(36, 168, 207, ${alpha})`);
                        
                        ctx.strokeStyle = grad;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            
            // Update & Draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            // Draw mouse glowing node if hover
            if (mouse.x !== null && mouse.y !== null) {
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(36, 168, 207, 0.8)';
                ctx.fill();
                
                // Draw ripple circle
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(36, 168, 207, 0.1)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            
            requestAnimationFrame(animate);
        }
        
        init();
        animate();
    }

    // 5. Contact Form Handler (Simulated Submit with Elegance)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Button loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            // Simulate API request
            setTimeout(() => {
                // Success message or toast
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Mensagem Enviada!';
                submitBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)'; // emerald
                
                // Reset form
                contactForm.reset();
                
                // Restore button after delay
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = ''; // reset to CSS default
                }, 3000);
            }, 1500);
        });
    }
});

// Flip-card helper for touch devices (toggles flipped class on click)
const bookCards = document.querySelectorAll('.book-card');
bookCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // Only toggle if they didn't click the download button
        if (!e.target.closest('.book-download-btn')) {
            card.classList.toggle('flipped');
        }
    });
});
