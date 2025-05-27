// عناصر DOM
const elements = {
    navbar: document.querySelector('.navbar'),
    themeToggle: document.querySelector('.theme-toggle'),
    menuToggle: document.querySelector('.menu-toggle'),
    navLinks: document.querySelector('.nav-links'),
    sections: document.querySelectorAll('section'),
    skillCards: document.querySelectorAll('.skill-card'),
    projectCards: document.querySelectorAll('.project-card'),
    contactForm: document.querySelector('.contact-form'),
    scrollTop: document.querySelector('.scroll-top')
};

// حالة التطبيق
const state = {
    isDarkMode: localStorage.getItem('theme') === 'dark',
    isMenuOpen: false,
    lastScrollY: 0
};

// التحكم في قائمة التواصل الاجتماعي
const socialFloatBtn = document.querySelector('.social-float-btn');
const socialFloatMenu = document.querySelector('.social-float-menu');

// التحكم في لوحة الألوان
const colorPanel = document.querySelector('.color-panel');
const colorPanelToggle = document.querySelector('.color-panel-toggle');
const colorInputs = document.querySelectorAll('.color-option input[type="color"]');
const presetButtons = document.querySelectorAll('.preset-btn');
const resetButton = document.querySelector('.reset-colors');

// الألوان الافتراضية
const defaultColors = {
    primary: '#2563eb',
    secondary: '#3b82f6',
    text: '#1f2937',
    background: '#ffffff'
};

// الألوان الجاهزة
const presetThemes = {
    blue: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff'
    },
    green: {
        primary: '#059669',
        secondary: '#10b981',
        text: '#1f2937',
        background: '#ffffff'
    },
    purple: {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        text: '#1f2937',
        background: '#ffffff'
    },
    orange: {
        primary: '#ea580c',
        secondary: '#f97316',
        text: '#1f2937',
        background: '#ffffff'
    }
};

// تهيئة التطبيق
function init() {
    // تطبيق الوضع المظلم إذا كان مفعلاً
    if (state.isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // إضافة مستمعي الأحداث
    addEventListeners();
    
    // تهيئة AOS
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // تهيئة Swiper للمشاريع
    const projectsSwiper = new Swiper('.projects-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        centeredSlides: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        effect: 'coverflow',
        coverflowEffect: {
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        },
        on: {
            init: function() {
                animateProjectCards();
            },
            slideChange: function() {
                animateProjectCards();
            }
        }
    });
}

// إضافة مستمعي الأحداث
function addEventListeners() {
    // تبديل الوضع المظلم
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // تبديل القائمة
    elements.menuToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
    
    // تتبع التمرير
    window.addEventListener('scroll', handleScroll);
    
    // إرسال النموذج
    elements.contactForm?.addEventListener('submit', handleFormSubmit);
    
    // النقر على روابط التنقل
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            if (state.isMenuOpen) {
                e.preventDefault();
                const href = anchor.getAttribute('href');
                toggleMenu();
                setTimeout(() => {
                    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        });
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (state.isMenuOpen && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.menu-toggle')) {
            toggleMenu();
        }
    });

    // إغلاق القائمة عند تغيير حجم النافذة
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && state.isMenuOpen) {
            toggleMenu();
        }
    });

    // التحكم في قائمة التواصل الاجتماعي
    socialFloatBtn.addEventListener('click', () => {
        socialFloatMenu.classList.toggle('active');
        
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', (e) => {
        if (!socialFloatBtn.contains(e.target) && !socialFloatMenu.contains(e.target)) {
            socialFloatMenu.classList.remove('active');
        }
    });

    // تبديل لوحة الألوان
    colorPanelToggle.addEventListener('click', () => {
        colorPanel.classList.toggle('active');
    });

    // تحديث الألوان
    function updateColors(colors) {
        document.documentElement.style.setProperty('--primary-color', colors.primary);
        document.documentElement.style.setProperty('--secondary-color', colors.secondary);
        document.documentElement.style.setProperty('--text-color', colors.text);
        document.documentElement.style.setProperty('--background-color', colors.background);
        
        // حفظ الألوان في التخزين المحلي
        localStorage.setItem('siteColors', JSON.stringify(colors));
    }

    // استعادة الألوان المحفوظة
    function loadSavedColors() {
        const savedColors = localStorage.getItem('siteColors');
        if (savedColors) {
            const colors = JSON.parse(savedColors);
            updateColors(colors);
            
            // تحديث قيم المدخلات
            colorInputs.forEach(input => {
                const colorType = input.id.replace('-color', '');
                input.value = colors[colorType];
            });
        }
    }

    // تغيير الألوان عند تغيير المدخلات
    colorInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const colorType = e.target.id.replace('-color', '');
            const colors = {
                primary: document.getElementById('primary-color').value,
                secondary: document.getElementById('secondary-color').value,
                text: document.getElementById('text-color').value,
                background: document.getElementById('background-color').value
            };
            updateColors(colors);
        });
    });

    // تطبيق الألوان الجاهزة
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const theme = button.dataset.theme;
            const colors = presetThemes[theme];
            updateColors(colors);
            
            // تحديث قيم المدخلات
            colorInputs.forEach(input => {
                const colorType = input.id.replace('-color', '');
                input.value = colors[colorType];
            });
        });
    });

    // إعادة تعيين الألوان
    resetButton.addEventListener('click', () => {
        updateColors(defaultColors);
        
        // تحديث قيم المدخلات
        colorInputs.forEach(input => {
            const colorType = input.id.replace('-color', '');
            input.value = defaultColors[colorType];
        });
        
        // حذف الألوان المحفوظة
        localStorage.removeItem('siteColors');
    });

    // تحميل الألوان المحفوظة عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', loadSavedColors);
}

// تبديل الوضع المظلم
function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    document.documentElement.setAttribute('data-theme', state.isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
}

// تبديل القائمة
function toggleMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    const navLinks = elements.navLinks;
    const menuToggle = elements.menuToggle;
    
    if (state.isMenuOpen) {
        navLinks.classList.add('active');
        menuToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// معالجة التمرير
function handleScroll() {
    const currentScrollY = window.scrollY;
    
    // إظهار/إخفاء شريط التنقل
    if (currentScrollY > state.lastScrollY) {
        elements.navbar.classList.add('hide');
    } else {
        elements.navbar.classList.remove('hide');
    }
    
    // تحديث الروابط النشطة
    updateActiveLinks();
    
    // إظهار/إخفاء زر العودة للأعلى
    if (currentScrollY > 500) {
        elements.scrollTop?.classList.add('show');
    } else {
        elements.scrollTop?.classList.remove('show');
    }
    
    state.lastScrollY = currentScrollY;
}

// تحديث الروابط النشطة
function updateActiveLinks() {
    const scrollPosition = window.scrollY;
    
    elements.sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.add('active');
        } else {
            document.querySelector(`.nav-links a[href="#${sectionId}"]`)?.classList.remove('active');
        }
    });
}

// التمرير السلس
function handleSmoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // إغلاق القائمة إذا كانت مفتوحة
        if (state.isMenuOpen) {
            toggleMenu();
        }
    }
}

// معالجة إرسال النموذج
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        // هنا يمكنك إضافة كود لإرسال البيانات إلى الخادم
        console.log('Form data:', data);
        
        // إظهار رسالة نجاح
        showNotification('تم إرسال رسالتك بنجاح!', 'success');
        e.target.reset();
    } catch (error) {
        console.error('Error:', error);
        showNotification('حدث خطأ أثناء إرسال الرسالة', 'error');
    }
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // إخفاء الإشعار بعد 3 ثوانٍ
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// دالة لتحريك بطاقات المشاريع
function animateProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        }, index * 100);
    });
}

// إضافة تأثيرات التمرير للمشاريع
const projectCards = document.querySelectorAll('.project-card');
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            projectObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

projectCards.forEach(card => {
    projectObserver.observe(card);
});

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', init); 