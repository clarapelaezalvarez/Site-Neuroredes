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

    // 6. Language Translation Setup (Google Translate widget integration)
    function initLanguageSelector() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        // 1. Create and append the language selector markup if not already present
        if (!document.querySelector('.lang-selector-container')) {
            const li = document.createElement('li');
            li.className = 'lang-selector-container';
            li.innerHTML = `
                <div class="lang-dropdown">
                    <button class="lang-btn" aria-label="Alterar idioma" id="langBtn">
                        <i class="fas fa-globe"></i> <span class="current-lang">PT</span> <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="lang-dropdown-content" id="langDropdown">
                        <a href="#" data-lang="pt"><img src="https://flagcdn.com/w20/br.png" alt="Português"> PT</a>
                        <a href="#" data-lang="en"><img src="https://flagcdn.com/w20/us.png" alt="English"> EN</a>
                        <a href="#" data-lang="es"><img src="https://flagcdn.com/w20/es.png" alt="Español"> ES</a>
                        <a href="#" data-lang="de"><img src="https://flagcdn.com/w20/de.png" alt="Deutsch"> DE</a>
                        <a href="#" data-lang="zh-CN"><img src="https://flagcdn.com/w20/cn.png" alt="中文"> ZH</a>
                    </div>
                </div>
            `;
            
            // Insert before Fale Conosco button (which is the last item in navLinks)
            const contactItem = navLinks.querySelector('a.btn-nav')?.parentNode;
            if (contactItem) {
                navLinks.insertBefore(li, contactItem);
            } else {
                navLinks.appendChild(li);
            }
        }
        
        // 2. Create the hidden google translate element container
        if (!document.getElementById('google_translate_element')) {
            const div = document.createElement('div');
            div.id = 'google_translate_element';
            div.style.display = 'none';
            document.body.appendChild(div);
        }

        // 3. Inject Google Translate JS SDK if not present
        if (!document.querySelector('script[src*="translate.google.com"]')) {
            // Define the global callback function that google translate calls
            window.googleTranslateElementInit = function() {
                new google.translate.TranslateElement({
                    pageLanguage: 'pt',
                    includedLanguages: 'en,es,de,zh-CN',
                    autoDisplay: false
                }, 'google_translate_element');
                
                // Re-apply language selection UI on load if cookie exists
                setTimeout(() => {
                    const activeLang = getActiveLang();
                    updateLangLabel(activeLang);
                }, 500);
            };
            
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(script);
        }
        
        // 4. Setup Event Listeners
        const selectorLi = document.querySelector('.lang-selector-container');
        if (selectorLi) {
            const dropdown = selectorLi.querySelector('.lang-dropdown');
            const langBtn = selectorLi.querySelector('#langBtn');
            
            // Toggle active state on click (mobile support)
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
            
            // Close dropdown on click outside
            document.addEventListener('click', () => {
                dropdown.classList.remove('active');
            });
            
            // Handle language item clicks
            selectorLi.querySelectorAll('.lang-dropdown-content a').forEach(a => {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const lang = a.getAttribute('data-lang');
                    changeLanguage(lang);
                    dropdown.classList.remove('active');
                });
            });
        }
        
        // Update initial label on page load from cookie
        const initialLang = getActiveLang();
        updateLangLabel(initialLang);
    }

    // Helpers for Translation
    function getActiveLang() {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; googtrans=`);
        if (parts.length === 2) {
            const val = parts.pop().split(';').shift();
            const lang = val.split('/').pop();
            return lang || 'pt';
        }
        return 'pt';
    }

    function updateLangLabel(lang) {
        const labelSpan = document.querySelector('.current-lang');
        if (labelSpan) {
            labelSpan.textContent = lang.toUpperCase().split('-')[0];
        }
    }

    function changeLanguage(lang) {
        // Also store in localStorage as backup
        localStorage.setItem('neuroredes_lang', lang);
        
        if (lang === 'pt') {
            // Properly expire the googtrans cookie for all domains and subdomains
            const domains = [
                window.location.hostname,
                '.' + window.location.hostname,
                window.location.hostname.split('.').slice(-2).join('.')
            ];
            
            domains.forEach(domain => {
                document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
                document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
            });
            
            // Reload page to restore original state completely
            window.location.reload();
            return;
        }
        
        // 1. Set Translate Cookie for other languages
        const cookieVal = `/pt/${lang}`;
        document.cookie = `googtrans=${cookieVal}; path=/`;
        document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname}`;
        document.cookie = `googtrans=${cookieVal}; path=/; domain=.${window.location.hostname}`;
        
        // 2. Trigger Google Translate Widget
        const selectEl = document.querySelector('.goog-te-combo');
        if (selectEl) {
            selectEl.value = lang;
            selectEl.dispatchEvent(new Event('change'));
        } else {
            // If element is not loaded, reload to apply cookie
            window.location.reload();
        }
        
        updateLangLabel(lang);
    }

    initLanguageSelector();

    // 7. Admin Mode Authorization (Neuroredes Staff Only)
    function checkAdminAuth() {
        const hashPassword = (str) => {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = (hash * 33) ^ str.charCodeAt(i);
            }
            return (hash >>> 0).toString(16);
        };
        
        // Target hash for "neuroredes2026"
        const targetHash = "52528c85";
        
        let isAdmin = sessionStorage.getItem('neuroredes_admin') === 'true';
        
        // Check url search query
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('admin')) {
            const adminVal = urlParams.get('admin');
            if (adminVal === 'true' || adminVal === '1') {
                if (!isAdmin) {
                    const pass = prompt("Digite a senha de administrador da Neuroredes:");
                    if (pass && hashPassword(pass) === targetHash) {
                        sessionStorage.setItem('neuroredes_admin', 'true');
                        isAdmin = true;
                        alert("Modo Administrador ativado com sucesso!");
                    } else {
                        alert("Senha incorreta! Acesso ao painel administrativo negado.");
                    }
                }
                
                // Clean the query parameter from the URL bar silently
                const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
            }
        }
        
        // Show administrative buttons if authenticated
        if (isAdmin) {
            const adminTriggers = document.querySelectorAll('.author-panel-trigger-wrapper, .librarian-panel-trigger-wrapper');
            adminTriggers.forEach(el => {
                el.style.setProperty('display', 'flex', 'important');
            });
        }
    }

    checkAdminAuth();
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
