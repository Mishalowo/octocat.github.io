let sliderInterval = null;
let isSliderPaused = false;
let sliderDirection = 1; // 1 - вперед, -1 - назад

function startSlider() {
    const app = document.querySelector("#app")?.__vue__;
    if (!app || app.featuredCourses.length === 0) return;
    
    stopSlider();
    
    sliderInterval = setInterval(() => {
        if (isSliderPaused) return;
        
        const totalSlides = app.featuredCourses.length;
        
        // Бесконечный слайдер
        app.courseSlide = (app.courseSlide + sliderDirection + totalSlides) % totalSlides;
        
        // Случайное изменение направления (для разнообразия)
        if (Math.random() > 0.95) {
            sliderDirection = -sliderDirection;
        }
    }, 3000); // Пауза 3 секунды
}

function stopSlider() {
    if (sliderInterval) {
        clearInterval(sliderInterval);
        sliderInterval = null;
    }
}

function pauseSlider() {
    isSliderPaused = true;
}

function resumeSlider() {
    isSliderPaused = false;
}

// Автоматический запуск слайдера
setTimeout(() => {
    const app = document.querySelector("#app")?.__vue__;
    if (app && app.page === 'home') {
        startSlider();
    }
}, 1000);

// Обработчики наведения
document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.querySelector('.courses-slider-section');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', pauseSlider);
        sliderContainer.addEventListener('mouseleave', resumeSlider);
    }
});

// Ручное управление слайдером
window.nextSlide = function() {
    const app = document.querySelector("#app")?.__vue__;
    if (app && app.featuredCourses.length > 0) {
        const totalSlides = app.featuredCourses.length;
        app.courseSlide = (app.courseSlide + 1) % totalSlides;
        sliderDirection = 1; // Устанавливаем направление вперед
        resetInterval();
    }
};

window.prevSlide = function() {
    const app = document.querySelector("#app")?.__vue__;
    if (app && app.featuredCourses.length > 0) {
        const totalSlides = app.featuredCourses.length;
        app.courseSlide = (app.courseSlide - 1 + totalSlides) % totalSlides;
        sliderDirection = -1; // Устанавливаем направление назад
        resetInterval();
    }
};

function resetInterval() {
    stopSlider();
    startSlider();
}

// Остановка слайдера при переключении страниц
if (typeof Vue !== 'undefined') {
    Vue.mixin({
        watch: {
            page(newPage) {
                if (newPage === 'home') {
                    setTimeout(() => {
                        startSlider();
                        // Перепривязываем обработчики наведения
                        const sliderContainer = document.querySelector('.courses-slider-section');
                        if (sliderContainer) {
                            sliderContainer.addEventListener('mouseenter', pauseSlider);
                            sliderContainer.addEventListener('mouseleave', resumeSlider);
                        }
                    }, 500);
                } else {
                    stopSlider();
                }
            }
        },
        
        // Обновляем слайдер при изменении данных
        featuredCourses() {
            if (this.page === 'home') {
                setTimeout(() => {
                    if (sliderInterval) {
                        resetInterval();
                    }
                }, 100);
            }
        }
    });
}

// Пауза при фокусе на окне браузера
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        pauseSlider();
    } else {
        resumeSlider();
    }
});

// Экспортируем функции для использования в консоли
window.sliderControl = {
    start: startSlider,
    stop: stopSlider,
    pause: pauseSlider,
    resume: resumeSlider,
    next: window.nextSlide,
    prev: window.prevSlide
};
window.demoCompleteCourse = function(courseId) {
    const app = document.querySelector("#app")?.__vue__;
    if (app) {
        const course = app.courses.find(c => c.id === courseId);
        if (course) {
            app.completeCourse(course);
        }
    }
};