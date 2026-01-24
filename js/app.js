const { jsPDF } = window.jspdf;
const ATTACK_FONT_BASE64 = "AAEAAAALAIAAAwAwT1MvMg8S...";
new Vue({
    el: "#app",
    data: {
        page: "home",
        courseSlide: 0,
        selectedCourse: null,
        bookingDate: "",
        error: "",
        success: "",
        authMode: "login",
        cabinetTab: "profile",
        adminTab: "users",
        filterLevel: "",
        
        // Тестирование
        currentTest: null,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        userAnswers: [],
        showTestModal: false,
        testTimer: null,
        testTimeLeft: 0,
        testResults: null,
        
        diaryMonth: new Date().getMonth(),
        
        auth: {
            login: "",
            password: ""
        },
        
        registerData: {
            email: "",
            login: "",
            password: "",
            confirmPassword: ""
        },
        
        user: null,
        
        users: JSON.parse(localStorage.getItem("users")) || [
            { 
                login: "admin", 
                password: "admin123", 
                email: "admin@learnhub.ru",
                role: "admin", 
                status: "active",
                name: "Администратор",
                registrationDate: "2024-01-01",
                progress: 100,
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
            },
            { 
                login: "student", 
                password: "student123", 
                email: "student@learnhub.ru",
                role: "user", 
                status: "active",
                name: "Иван Иванов",
                registrationDate: "2024-02-15",
                progress: 65,
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
            }
        ],
        
        bookings: JSON.parse(localStorage.getItem("bookings")) || [],
        certificates: JSON.parse(localStorage.getItem("certificates")) || [],
        
        courses: [
            {
                id: 1,
                title: "Веб-разработка с нуля",
                price: 4000,
                teacher: "Иван Петров",
                level: "Начальный",
                description: "HTML, CSS, JavaScript - основы фронтенд разработки",
                duration: "3 месяца",
                format: "Видеоуроки + практика",
                image: "3.jpg",
                discount: 30,
                testId: 1, // ID теста для завершения курса
                minScore: 70, // Минимальный балл для получения сертификата
                completedBy: [] // Массив пользователей, завершивших курс
            },
            {
                id: 2,
                title: "Python для анализа данных",
                price: 5000,
                teacher: "Анна Сидорова",
                level: "Средний",
                description: "Pandas, NumPy, Matplotlib и основы Data Science",
                duration: "4 месяца",
                format: "Интерактивные задания",
                image: "4.jpg",
                discount: 20,
                testId: 4,
                minScore: 75,
                completedBy: []
            },
            {
                id: 3,
                title: "Vue.js для продвинутых",
                price: 5500,
                teacher: "Дмитрий Козлов",
                level: "Продвинутый",
                description: "SPA приложения, Vuex, Vue Router, Composition API",
                duration: "3 месяца",
                format: "Проектная работа",
                image: "5.jpg",
                discount: 15,
                testId: 3,
                minScore: 80,
                completedBy: []
            },
            {
                id: 4,
                title: "Мобильная разработка на Flutter",
                price: 6000,
                teacher: "Алексей Смирнов",
                level: "Средний",
                description: "Создание кроссплатформенных мобильных приложений",
                duration: "4 месяца",
                format: "Практические проекты",
                image: "6.jpg",
                discount: 25,
                testId: null,
                minScore: 70,
                completedBy: []
            },
            {
                id: 5,
                title: "DevOps и CI/CD",
                price: 7000,
                teacher: "Максим Орлов",
                level: "Продвинутый",
                description: "Docker, Kubernetes, Jenkins, GitLab CI",
                duration: "3 месяца",
                format: "Лабораторные работы",
                image: "7.jpg",
                discount: 10,
                testId: null,
                minScore: 80,
                completedBy: []
            },
            {
                id: 6,
                title: "Машинное обучение",
                price: 8000,
                teacher: "Елена Ковалева",
                level: "Продвинутый",
                description: "Нейронные сети, TensorFlow, PyTorch",
                duration: "5 месяцев",
                format: "Исследовательские проекты",
                image: "8.jpg",
                discount: 15,
                testId: null,
                minScore: 85,
                completedBy: []
            }
        ],
        
        newCourse: {
            title: "",
            price: "",
            description: "",
            level: "Начальный",
            teacher: "",
            testId: null,
            minScore: 70
        },
        
        teachers: [
            {
                name: "Иван Петров",
                position: "Senior Frontend Developer в Яндекс",
                experience: "10 лет опыта",
                avatar: "1.jpg",
                skills: ["JavaScript", "Vue.js", "React", "TypeScript"],
                students: 1200
            },
            {
                name: "Анна Сидорова",
                position: "Data Scientist в Тинькофф",
                experience: "8 лет опыта",
                avatar: "2.jpg",
                skills: ["Python", "Pandas", "ML", "SQL"],
                students: 850
            }
        ],
        
        tests: [
            {
                id: 1,
                title: "HTML/CSS основы",
                icon: "fab fa-html5",
                description: "Проверка знаний по HTML5 и CSS3",
                questions: 5,
                time: 10,
                completed: false,
                score: null,
                courseId: 1, // Связь с курсом
                questionsList: [
                    {
                        id: 1,
                        text: "Какой тег используется для создания ссылки?",
                        answers: [
                            { id: 1, text: "<a>", correct: true },
                            { id: 2, text: "<link>" },
                            { id: 3, text: "<href>" },
                            { id: 4, text: "<url>" }
                        ]
                    },
                    {
                        id: 2,
                        text: "Какое свойство CSS изменяет цвет текста?",
                        answers: [
                            { id: 1, text: "background-color" },
                            { id: 2, text: "text-color" },
                            { id: 3, text: "color", correct: true },
                            { id: 4, text: "font-color" }
                        ]
                    },
                    {
                        id: 3,
                        text: "Какой тег используется для создания заголовка первого уровня?",
                        answers: [
                            { id: 1, text: "<h1>", correct: true },
                            { id: 2, text: "<head>" },
                            { id: 3, text: "<header>" },
                            { id: 4, text: "<title>" }
                        ]
                    },
                    {
                        id: 4,
                        text: "Какое свойство CSS используется для изменения фона элемента?",
                        answers: [
                            { id: 1, text: "color" },
                            { id: 2, text: "background-color", correct: true },
                            { id: 3, text: "bg-color" },
                            { id: 4, text: "background" }
                        ]
                    },
                    {
                        id: 5,
                        text: "Как подключить CSS к HTML документу?",
                        answers: [
                            { id: 1, text: "С помощью тега <style>" },
                            { id: 2, text: "С помощью тега <link>" },
                            { id: 3, text: "С помощью атрибута style" },
                            { id: 4, text: "Все варианты верны", correct: true }
                        ]
                    }
                ]
            },
            {
                id: 2,
                title: "JavaScript базовый",
                icon: "fab fa-js-square",
                description: "Основы JavaScript и ES6+",
                questions: 5,
                time: 15,
                completed: false,
                score: null,
                courseId: null,
                questionsList: [
                    {
                        id: 1,
                        text: "Как объявить переменную в JavaScript?",
                        answers: [
                            { id: 1, text: "var x" },
                            { id: 2, text: "let x" },
                            { id: 3, text: "const x" },
                            { id: 4, text: "Все варианты верны", correct: true }
                        ]
                    },
                    {
                        id: 2,
                        text: "Какой оператор используется для строгого сравнения?",
                        answers: [
                            { id: 1, text: "==" },
                            { id: 2, text: "===", correct: true },
                            { id: 3, text: "=" },
                            { id: 4, text: "!=" }
                        ]
                    },
                    {
                        id: 3,
                        text: "Что выведет console.log(typeof null)?",
                        answers: [
                            { id: 1, text: "null" },
                            { id: 2, text: "undefined" },
                            { id: 3, text: "object", correct: true },
                            { id: 4, text: "number" }
                        ]
                    },
                    {
                        id: 4,
                        text: "Как создать массив в JavaScript?",
                        answers: [
                            { id: 1, text: "[]", correct: true },
                            { id: 2, text: "{}" },
                            { id: 3, text: "new Array()", correct: true },
                            { id: 4, text: "array()" }
                        ]
                    },
                    {
                        id: 5,
                        text: "Что такое hoisting в JavaScript?",
                        answers: [
                            { id: 1, text: "Поднятие переменных и функций", correct: true },
                            { id: 2, text: "Анимация элементов" },
                            { id: 3, text: "Оптимизация кода" },
                            { id: 4, text: "Обработка ошибок" }
                        ]
                    }
                ]
            },
            {
                id: 3,
                title: "Vue.js основы",
                icon: "fab fa-vuejs",
                description: "Основы фреймворка Vue.js",
                questions: 4,
                time: 10,
                completed: false,
                score: null,
                courseId: 3,
                questionsList: [
                    {
                        id: 1,
                        text: "Как создать экземпляр Vue?",
                        answers: [
                            { id: 1, text: "new Vue()", correct: true },
                            { id: 2, text: "Vue.create()" },
                            { id: 3, text: "new Vue.app()" },
                            { id: 4, text: "Vue.instance()" }
                        ]
                    },
                    {
                        id: 2,
                        text: "Какой директиве соответствует v-model?",
                        answers: [
                            { id: 1, text: "Двустороннее связывание", correct: true },
                            { id: 2, text: "Условный рендеринг" },
                            { id: 3, text: "Циклы" },
                            { id: 4, text: "События" }
                        ]
                    },
                    {
                        id: 3,
                        text: "Как объявить вычисляемое свойство?",
                        answers: [
                            { id: 1, text: "methods: {}" },
                            { id: 2, text: "computed: {}", correct: true },
                            { id: 3, text: "data() {}" },
                            { id: 4, text: "watch: {}" }
                        ]
                    },
                    {
                        id: 4,
                        text: "Что такое Vue Router?",
                        answers: [
                            { id: 1, text: "Библиотека для маршрутизации", correct: true },
                            { id: 2, text: "Система управления состоянием" },
                            { id: 3, text: "Инструмент для тестирования" },
                            { id: 4, text: "Плагин для анимации" }
                        ]
                    }
                ]
            },
            {
                id: 4,
                title: "Python основы",
                icon: "fab fa-python",
                description: "Основы программирования на Python",
                questions: 5,
                time: 10,
                completed: false,
                score: null,
                courseId: 2,
                questionsList: [
                    {
                        id: 1,
                        text: "Как вывести текст в Python?",
                        answers: [
                            { id: 1, text: "print()", correct: true },
                            { id: 2, text: "echo()" },
                            { id: 3, text: "console.log()" },
                            { id: 4, text: "write()" }
                        ]
                    },
                    {
                        id: 2,
                        text: "Как создать список в Python?",
                        answers: [
                            { id: 1, text: "{}" },
                            { id: 2, text: "[]", correct: true },
                            { id: 3, text: "()" },
                            { id: 4, text: "<>" }
                        ]
                    },
                    {
                        id: 3,
                        text: "Какой оператор используется для целочисленного деления?",
                        answers: [
                            { id: 1, text: "/" },
                            { id: 2, text: "//", correct: true },
                            { id: 3, text: "%" },
                            { id: 4, text: "div" }
                        ]
                    },
                    {
                        id: 4,
                        text: "Как объявить функцию в Python?",
                        answers: [
                            { id: 1, text: "function myFunc()" },
                            { id: 2, text: "def myFunc():", correct: true },
                            { id: 3, text: "func myFunc()" },
                            { id: 4, text: "lambda myFunc()" }
                        ]
                    },
                    {
                        id: 5,
                        text: "Что такое PEP 8?",
                        answers: [
                            { id: 1, text: "Стиль кодирования Python", correct: true },
                            { id: 2, text: "Версия Python" },
                            { id: 3, text: "Библиотека Python" },
                            { id: 4, text: "Инструмент разработки" }
                        ]
                    }
                ]
            }
        ],
        
        // Статистика теперь вычисляется динамически
        userStats: JSON.parse(localStorage.getItem("userStats")) || {},
        
        analytics: {
            totalUsers: 0,
            activeCourses: 0,
            totalBookings: 0,
            totalCertificates: 0
        },
        
        weekdays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        
        calendarDays: [],
        currentMonth: '',
        currentYear: '',
        selectedDay: {},
        selectedDayLessons: [],
        
        diaryEntries: [],
        
        // Новая переменная для отслеживания курса, который завершается тестом
        courseForTest: null
    },
    
    computed: {
        today() {
            return new Date().toISOString().split('T')[0];
        },
        
        featuredCourses() {
            return this.courses.map(course => ({
                ...course,
                shortDescription: course.description.substring(0, 100) + '...'
            }));
        },
        
        filteredCourses() {
            if (!this.filterLevel) return this.courses;
            return this.courses.filter(course => course.level === this.filterLevel);
        },
        
        enrolledCourses() {
            if (!this.user) return [];
            const userBookings = this.bookings.filter(b => b.user === this.user.login);
            return userBookings.map(booking => {
                const course = this.courses.find(c => c.title === booking.course);
                return {
                    ...course,
                    progress: this.getCourseProgress(course.id),
                    isCompleted: this.isCourseCompleted(course.id)
                };
            });
        },
        
        userCertificates() {
            if (!this.user) return [];
            return this.certificates.filter(c => c.user === this.user.login);
        },
        
        userTests() {
            if (!this.user) return [];
            return this.tests.filter(test => test.completed);
        },
        
        currentQuestion() {
            if (!this.currentTest || !this.currentTest.questionsList) return null;
            return this.currentTest.questionsList[this.currentQuestionIndex];
        },
        
        testProgress() {
            if (!this.currentTest) return 0;
            return ((this.currentQuestionIndex + 1) / this.currentTest.questionsList.length) * 100;
        },
        
        formattedTime() {
            const minutes = Math.floor(this.testTimeLeft / 60);
            const seconds = this.testTimeLeft % 60;
            return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        },
        
        // Динамическая статистика пользователя
        stats() {
            if (!this.user) return { totalHours: 0, completedCourses: 0, averageScore: 0 };
            
            // Получаем статистику пользователя или создаем новую
            if (!this.userStats[this.user.login]) {
                this.userStats[this.user.login] = {
                    totalHours: 0,
                    completedCourses: 0,
                    completedTests: 0,
                    totalScore: 0,
                    testCount: 0
                };
            }
            
            const stats = this.userStats[this.user.login];
            const completedTests = this.tests.filter(t => t.completed).length;
            const completedCourses = this.getUserCompletedCourses().length;
            
            return {
                totalHours: stats.totalHours + (completedTests * 2),
                completedCourses: completedCourses,
                averageScore: stats.testCount > 0 ? Math.round(stats.totalScore / stats.testCount) : 0
            };
        },
        
        // Курсы с доступными тестами для завершения
        coursesWithTests() {
            return this.courses.filter(course => course.testId && this.isUserEnrolled(course.id));
        }
    },
    
    mounted() {
        this.updateAnalytics();
        this.generateCalendar();
        this.loadDiaryEntries();
        
        // Автоматический вход для демо
        if (localStorage.getItem('autoLogin')) {
            const demoUser = this.users.find(u => u.login === 'student');
            if (demoUser) {
                this.user = demoUser;
                this.page = 'cabinet';
            }
        }
        
        // Инициализация flatpickr
        if (typeof flatpickr !== 'undefined') {
            flatpickr('.flatpickr', {
                dateFormat: 'Y-m-d',
                minDate: 'today',
                locale: 'ru'
            });
        }
        
        // Загрузка курсов из localStorage
        const savedCourses = localStorage.getItem("courses");
        if (savedCourses) {
            this.courses = JSON.parse(savedCourses);
        }
    },
    
    methods: {

    generateCertificate(certificateData) {
        if (!this.user) {
            alert("Для получения сертификата необходимо войти в систему");
            return;
        }
        
        if (!certificateData) {
            alert("Не выбран курс для генерации сертификата");
            return;
        }
        
        // Если это объект курса из "Мои курсы"
        if (certificateData.title && certificateData.id) {
            const course = certificateData;
            if (!this.isCourseCompleted(course.id)) {
                alert("Вы еще не завершили этот курс!");
                return;
            }
            this.generateCertificateForCourse(course);
        }
        // Если это объект сертификата из "Мои сертификаты"
        else if (certificateData.course) {
            const course = this.courses.find(c => c.title === certificateData.course);
            if (course) {
                this.generateCertificateForCourse(course);
            } else {
                this.generateGenericCertificate(certificateData.course);
            }
        }
    },

        // Проверка, записан ли пользователь на курс
        isUserEnrolled(courseId) {
            if (!this.user) return false;
            const course = this.courses.find(c => c.id === courseId);
            if (!course) return false;
            
            return this.bookings.some(b => 
                b.user === this.user.login && b.course === course.title
            );
        },
        
        // Проверка, завершил ли пользователь курс
        isCourseCompleted(courseId) {
            if (!this.user) return false;
            const course = this.courses.find(c => c.id === courseId);
            if (!course) return false;
            
            return course.completedBy.includes(this.user.login);
        },
        
        // Получение прогресса по курсу
        getCourseProgress(courseId) {
            if (this.isCourseCompleted(courseId)) return 100;
            
            const course = this.courses.find(c => c.id === courseId);
            if (!course) return 0;
            
            // Если есть пройденный тест по курсу
            const courseTest = this.tests.find(t => t.courseId === courseId);
            if (courseTest && courseTest.completed && courseTest.score >= course.minScore) {
                return 100; // Тест пройден успешно - курс завершен
            } else if (courseTest && courseTest.completed) {
                return 80; // Тест пройден, но не набрал нужный балл
            }
            
            // Рандомный прогресс для демо
            return Math.floor(Math.random() * 60) + 20;
        },
        
        // Получение списка завершенных курсов пользователя
        getUserCompletedCourses() {
            if (!this.user) return [];
            return this.courses.filter(course => 
                course.completedBy.includes(this.user.login)
            );
        },
        
        selectCourse(course) {
            this.selectedCourse = course;
            this.bookingDate = this.today;
        },
        
        filterCourses() {
            // Фильтрация уже выполняется в computed свойстве
        },
        
        calculateDiscount(course) {
            if (course.discount) {
                return Math.round(course.price * (1 - course.discount / 100));
            }
            return course.price;
        },
        
        nextSlide() {
            this.courseSlide = (this.courseSlide + 1) % this.featuredCourses.length;
        },
        
        prevSlide() {
            this.courseSlide = this.courseSlide === 0 ? 
                this.featuredCourses.length - 1 : 
                this.courseSlide - 1;
        },
        
        showModal(type) {
            alert(`Открываем модальное окно: ${type}`);
        },
        
        saveUsers() {
            localStorage.setItem("users", JSON.stringify(this.users));
        },
        
        saveBookings() {
            localStorage.setItem("bookings", JSON.stringify(this.bookings));
        },
        
        saveCertificates() {
            localStorage.setItem("certificates", JSON.stringify(this.certificates));
        },
        
        saveUserStats() {
            localStorage.setItem("userStats", JSON.stringify(this.userStats));
        },
        
        saveCourses() {
            localStorage.setItem("courses", JSON.stringify(this.courses));
        },
        
        saveTests() {
            localStorage.setItem("tests", JSON.stringify(this.tests));
        },
        
        login() {
            let u = this.users.find(u => 
                (u.login === this.auth.login || u.email === this.auth.login) && 
                u.password === this.auth.password &&
                u.status !== 'banned'
            );
            
            if (u) {
                this.user = u;
                this.page = "cabinet";
                this.error = "";
                this.success = "Вход выполнен успешно!";
                localStorage.setItem('currentUser', JSON.stringify(u));
                
                // Инициализация статистики для нового пользователя
                if (!this.userStats[u.login]) {
                    this.userStats[u.login] = {
                        totalHours: 0,
                        completedCourses: 0,
                        completedTests: 0,
                        totalScore: 0,
                        testCount: 0
                    };
                    this.saveUserStats();
                }
            } else {
                this.error = "Неверный логин, email или пароль";
                this.success = "";
            }
        },
        
        register() {
            if (this.registerData.password !== this.registerData.confirmPassword) {
                this.error = "Пароли не совпадают";
                return;
            }
            
            if (this.users.find(u => u.login === this.registerData.login)) {
                this.error = "Пользователь с таким логином уже существует";
                return;
            }
            
            if (this.users.find(u => u.email === this.registerData.email)) {
                this.error = "Пользователь с таким email уже существует";
                return;
            }
            
            const newUser = {
                login: this.registerData.login,
                email: this.registerData.email,
                password: this.registerData.password,
                role: "user",
                status: "active",
                name: this.registerData.login,
                registrationDate: new Date().toLocaleDateString(),
                progress: 0,
                avatar: `https://i.pravatar.cc/150?u=${this.registerData.login}`
            };
            
            this.users.push(newUser);
            this.saveUsers();
            
            // Инициализация нулевой статистики для нового пользователя
            this.userStats[newUser.login] = {
                totalHours: 0,
                completedCourses: 0,
                completedTests: 0,
                totalScore: 0,
                testCount: 0
            };
            this.saveUserStats();
            
            this.user = newUser;
            this.page = "cabinet";
            this.error = "";
            this.success = "Регистрация успешна! Добро пожаловать!";
            
            // Очистка формы
            this.registerData = {
                email: "",
                login: "",
                password: "",
                confirmPassword: ""
            };
        },
        
        logout() {
            this.user = null;
            this.page = "home";
            localStorage.removeItem('currentUser');
        },
        
        toggleBan(user) {
            user.status = user.status === 'banned' ? 'active' : 'banned';
            this.saveUsers();
        },
        
        deleteUser(login) {
            if (confirm(`Удалить пользователя ${login}?`)) {
                this.users = this.users.filter(u => u.login !== login);
                this.saveUsers();
            }
        },
        
        addCourse() {
            if (!this.newCourse.title || !this.newCourse.price) {
                alert("Заполните все обязательные поля");
                return;
            }
            
            const newCourse = {
                id: this.courses.length + 1,
                title: this.newCourse.title,
                price: parseInt(this.newCourse.price),
                teacher: this.newCourse.teacher || "Администратор",
                level: this.newCourse.level,
                description: this.newCourse.description || "Новый курс",
                duration: "2 месяца",
                format: "Видеоуроки",
                image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop",
                testId: this.newCourse.testId || null,
                minScore: parseInt(this.newCourse.minScore) || 70,
                completedBy: []
            };
            
            this.courses.push(newCourse);
            this.saveCourses();
            
            this.newCourse = {
                title: "",
                price: "",
                description: "",
                level: "Начальный",
                teacher: "",
                testId: null,
                minScore: 70
            };
            
            alert("Курс успешно добавлен!");
        },
        
        deleteCourse(id) {
            if (confirm("Удалить этот курс?")) {
                this.courses = this.courses.filter(c => c.id !== id);
                this.saveCourses();
            }
        },
        
        editCourse(course) {
            this.newCourse = {
                title: course.title,
                price: course.price,
                description: course.description,
                level: course.level,
                teacher: course.teacher,
                testId: course.testId || null,
                minScore: course.minScore || 70
            };
            
            // Удаляем старый курс
            this.deleteCourse(course.id);
            
            // Показываем сообщение
            alert("Редактирование курса: " + course.title + "\nЗаполните форму выше для редактирования.");
        },
        
        bookCourse() {
            if (!this.user) {
                alert("Необходимо войти в систему!");
                this.page = "auth";
                return;
            }
            
            if (!this.bookingDate) {
                alert("Выберите дату начала обучения!");
                return;
            }
            
            this.bookings.push({
                user: this.user.login,
                course: this.selectedCourse.title,
                date: this.bookingDate,
                status: "active"
            });
            
            this.saveBookings();
            
            this.selectedCourse = null;
            this.bookingDate = "";
            
            alert("Вы успешно записались на курс!");
        },
        
        continueCourse(course) {
            if (this.isCourseCompleted(course.id)) {
                alert("Курс уже завершен! Вы можете скачать сертификат.");
                return;
            }
            
            // Проверяем, есть ли финальный тест для курса
            if (course.testId) {
                const test = this.tests.find(t => t.id === course.testId);
                if (test) {
                    // Проверяем, прошел ли пользователь уже тест
                    if (test.completed && test.score >= course.minScore) {
                        // Тест пройден успешно, предлагаем завершить курс
                        this.completeCourseWithTest(course);
                    } else {
                        // Предлагаем пройти тест
                        if (confirm(`Для завершения курса "${course.title}" необходимо пройти финальный тест. Пройти тест сейчас?`)) {
                            this.startTestForCourse(test, course);
                        }
                    }
                } else {
                    alert("Курс не имеет финального теста. Пожалуйста, обратитесь к администратору.");
                }
            } else {
                alert("Этот курс не имеет финального теста для завершения.");
            }
        },
        
        // Начать тест для завершения курса
        startTestForCourse(test, course) {
            this.courseForTest = course;
            this.startTest(test);
        },
        
        startTest(test) {
            this.currentTest = JSON.parse(JSON.stringify(test)); // Копируем тест
            this.currentQuestionIndex = 0;
            this.selectedAnswer = null;
            this.userAnswers = [];
            this.testResults = null;
            this.showTestModal = true;
            
            // Устанавливаем таймер
            this.testTimeLeft = test.time * 60; // Конвертируем минуты в секунды
            this.startTimer();
        },
        
        startTimer() {
            if (this.testTimer) {
                clearInterval(this.testTimer);
            }
            
            this.testTimer = setInterval(() => {
                this.testTimeLeft--;
                
                if (this.testTimeLeft <= 0) {
                    this.completeTest();
                }
            }, 1000);
        },
        
        selectAnswer(answerId) {
            // Сохраняем ответ для текущего вопроса
            this.userAnswers[this.currentQuestionIndex] = answerId;
            this.selectedAnswer = answerId;
        },
        
        nextQuestion() {
            if (this.currentQuestionIndex < this.currentTest.questionsList.length - 1) {
                this.currentQuestionIndex++;
                this.selectedAnswer = this.userAnswers[this.currentQuestionIndex] || null;
            } else {
                // Если это последний вопрос, завершаем тест
                this.completeTest();
            }
        },
        
        prevQuestion() {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.selectedAnswer = this.userAnswers[this.currentQuestionIndex] || null;
            }
        },
        
        goToQuestion(index) {
            this.currentQuestionIndex = index;
            this.selectedAnswer = this.userAnswers[index] || null;
        },
        
        completeTest() {
            // Останавливаем таймер
            if (this.testTimer) {
                clearInterval(this.testTimer);
                this.testTimer = null;
            }
            
            // Расчет результатов
            let correctAnswers = 0;
            let totalQuestions = this.currentTest.questionsList.length;
            
            this.userAnswers.forEach((answerId, questionIndex) => {
                const question = this.currentTest.questionsList[questionIndex];
                if (question) {
                    // Проверяем правильность ответа
                    const selectedAnswer = question.answers.find(a => a.id === answerId);
                    if (selectedAnswer && selectedAnswer.correct) {
                        correctAnswers++;
                    }
                }
            });
            
            const score = Math.round((correctAnswers / totalQuestions) * 100);
            
            // Сохраняем результаты
            this.testResults = {
                totalQuestions: totalQuestions,
                correctAnswers: correctAnswers,
                score: score,
                percentage: score + '%'
            };
            
            // Обновляем тест в списке
            const testIndex = this.tests.findIndex(t => t.id === this.currentTest.id);
            if (testIndex !== -1) {
                this.tests[testIndex].completed = true;
                this.tests[testIndex].score = score;
                this.saveTests();
            }
            
            // Обновляем статистику пользователя
            if (this.user) {
                if (!this.userStats[this.user.login]) {
                    this.userStats[this.user.login] = {
                        totalHours: 0,
                        completedCourses: 0,
                        completedTests: 0,
                        totalScore: 0,
                        testCount: 0
                    };
                }
                
                this.userStats[this.user.login].completedTests++;
                this.userStats[this.user.login].totalScore += score;
                this.userStats[this.user.login].testCount++;
                this.userStats[this.user.login].totalHours += this.currentTest.time;
                
                this.saveUserStats();
                
                // Обновляем прогресс пользователя
                this.user.progress = Math.min(100, this.user.progress + 10);
                const userIndex = this.users.findIndex(u => u.login === this.user.login);
                if (userIndex !== -1) {
                    this.users[userIndex].progress = this.user.progress;
                    this.saveUsers();
                }
                
                // Проверяем, был ли этот тест для завершения курса
                if (this.courseForTest) {
                    const course = this.courseForTest;
                    if (score >= course.minScore) {
                        // Пользователь прошел тест успешно, предлагаем завершить курс
                        setTimeout(() => {
                            if (confirm(`Поздравляем! Вы успешно прошли финальный тест по курсу "${course.title}" с результатом ${score}%!\n\nХотите завершить курс и получить сертификат?`)) {
                                this.completeCourseWithTest(course);
                            }
                        }, 500);
                    } else {
                        alert(`К сожалению, вы набрали ${score}%, что ниже минимального порога ${course.minScore}% для завершения курса.\n\nПопробуйте пройти тест еще раз после повторения материала.`);
                    }
                    this.courseForTest = null;
                }
            }
            
            // Отправка результатов через AJAX
            if (typeof sendTestResult !== 'undefined') {
                sendTestResult({
                    testId: this.currentTest.id,
                    testName: this.currentTest.title,
                    score: score,
                    user: this.user ? this.user.login : 'guest',
                    date: new Date().toISOString(),
                    correctAnswers: correctAnswers,
                    totalQuestions: totalQuestions
                });
            }
        },
        
        // Завершить курс с помощью теста
        completeCourseWithTest(course) {
            if (!this.user) {
                alert("Необходимо войти в систему!");
                return;
            }
            
            // Проверяем, записан ли пользователь на курс
            if (!this.isUserEnrolled(course.id)) {
                alert("Вы не записаны на этот курс!");
                return;
            }
            
            // Проверяем, не завершен ли уже курс
            if (this.isCourseCompleted(course.id)) {
                alert("Курс уже завершен!");
                return;
            }
            
            // Проверяем, есть ли финальный тест
            if (!course.testId) {
                alert("Этот курс не имеет финального теста для завершения.");
                return;
            }
            
            // Проверяем, пройден ли тест
            const test = this.tests.find(t => t.id === course.testId);
            if (!test || !test.completed || test.score < course.minScore) {
                alert(`Для завершения курса необходимо пройти финальный тест и набрать минимум ${course.minScore}%.\n\nВаш результат: ${test ? test.score + '%' : 'тест не пройден'}`);
                return;
            }
            
            // Добавляем пользователя в список завершивших курс
            const courseIndex = this.courses.findIndex(c => c.id === course.id);
            if (courseIndex !== -1) {
                if (!this.courses[courseIndex].completedBy.includes(this.user.login)) {
                    this.courses[courseIndex].completedBy.push(this.user.login);
                    this.saveCourses();
                    
                    // Обновляем статистику пользователя
                    if (this.userStats[this.user.login]) {
                        this.userStats[this.user.login].completedCourses = this.getUserCompletedCourses().length;
                        this.saveUserStats();
                    }
                    
                    // Создаем сертификат автоматически
                    this.generateCertificateForCourse(course);
                    
                    alert(`Поздравляем! Вы успешно завершили курс "${course.title}"!\n\nСертификат был автоматически сгенерирован и доступен в разделе "Сертификаты".`);
                }
            }
        },
        
        // Автоматическая генерация сертификата при завершении курса
        generateCertificateForCourse(course) {
    if (!this.user) {
        alert("You need to log in to get the certificate");
        return;
    }

    try {
        const pdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4"
        });

        // Data
        const courseTitle = course.title;
        const userName = this.user.name || this.user.login;

        // Current date in English
        const currentDate = new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        // Find test for course
        const test = this.tests.find(t => t.id === course.testId);
        const testScore = test && test.completed ? test.score + "%" : "100%";

        // Background
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, 297, 210, "F");

        pdf.setFillColor(91, 75, 219, 10);
        pdf.rect(10, 10, 277, 190, "F");

        // Decorative lines
        pdf.setDrawColor(91, 75, 219);
        pdf.setLineWidth(0.5);

        pdf.line(20, 20, 40, 20);
        pdf.line(20, 20, 20, 40);
        pdf.line(277, 20, 257, 20);
        pdf.line(277, 20, 277, 40);
        pdf.line(20, 190, 40, 190);
        pdf.line(20, 190, 20, 170);
        pdf.line(277, 190, 257, 190);
        pdf.line(277, 190, 277, 170);

        // Header
        pdf.setFontSize(36);
        pdf.setTextColor(91, 75, 219);
        pdf.setFont("helvetica", "bold");
        pdf.text("CERTIFICATE", 148.5, 50, { align: "center" });

        pdf.setFontSize(14);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        pdf.text("Course Completion", 148.5, 65, { align: "center" });

        // Line
        pdf.setLineWidth(1);
        pdf.line(70, 75, 227, 75);

        // Certificate text
        pdf.setFontSize(16);
        pdf.setTextColor(50, 50, 50);
        pdf.text("This certifies that", 148.5, 95, { align: "center" });

        pdf.setFontSize(24);
        pdf.setTextColor(91, 75, 219);
        pdf.setFont("helvetica", "bold");
        pdf.text(userName.toUpperCase(), 148.5, 115, { align: "center" });

        pdf.setFontSize(16);
        pdf.setTextColor(50, 50, 50);
        pdf.setFont("helvetica", "normal");
        pdf.text("has successfully completed the course", 148.5, 135, { align: "center" });

        /*pdf.setFontSize(20);
        pdf.setTextColor(91, 75, 219);
        pdf.setFont("helvetica", "bold");

        const courseTitleLines = this.splitText(courseTitle, 60);
        let yPos = 155;

        courseTitleLines.forEach(line => {
            pdf.text(line, 148.5, yPos, { align: "center" });
            yPos += 12;
        });*/

        // Test score
        if (test && test.completed) {
            pdf.setFontSize(14);
            pdf.setTextColor(50, 50, 50);
            pdf.setFont("helvetica", "normal");
            pdf.text(`Final test score: ${testScore}`, 148.5, yPos + 10, { align: "center" });
            yPos += 20;
        }

        // Date
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Date: ${currentDate}`, 148.5, 180, { align: "center" });

        // Signature
        const leftMargin = 60;
        const rightMargin = 237;

        pdf.setFontSize(12);
        pdf.setTextColor(50, 50, 50);
        pdf.text("Director of Learn Hub", leftMargin, 190);
        pdf.line(leftMargin, 195, leftMargin + 60, 195);
        pdf.setFontSize(10);
        pdf.text("I. I. Petrov", leftMargin, 200);

        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(10);
        pdf.text("Official Seal", rightMargin, 195, { align: "right" });

        pdf.setDrawColor(91, 75, 219);
        pdf.setLineWidth(0.5);
        pdf.circle(rightMargin - 15, 190, 10);

        // Footer
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text("Learn Hub - Online Education Platform", 148.5, 205, { align: "center" });

        // File name
        const safeCourseName = courseTitle.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `Certificate_${userName}_${safeCourseName}.pdf`;

        pdf.save(fileName);

        // Save certificate
        const newCertificate = {
            id: Date.now(),
            user: this.user.login,
            course: courseTitle,
            date: currentDate,
            pdf: true,
            fileName,
            testScore,
            courseId: course.id
        };

        this.certificates.push(newCertificate);
        this.saveCertificates();
        this.updateAnalytics();

        alert("Certificate successfully generated and downloaded!");

        return newCertificate;

    } catch (error) {
        console.error("Error generating certificate:", error);
        alert("An error occurred while generating the certificate.");
        return null;
    }
},

    // Добавьте этот вспомогательный метод для разбивки текста
    splitText(text, maxLength) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + ' ' + word).length <= maxLength) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines;
    },
        
        closeTestModal() {
            this.showTestModal = false;
            this.currentTest = null;
            this.currentQuestionIndex = 0;
            this.selectedAnswer = null;
            this.userAnswers = [];
            this.testResults = null;
            this.courseForTest = null;
            
            if (this.testTimer) {
                clearInterval(this.testTimer);
                this.testTimer = null;
            }
        },
        
        restartTest() {
            this.currentQuestionIndex = 0;
            this.selectedAnswer = null;
            this.userAnswers = [];
            this.testResults = null;
            this.testTimeLeft = this.currentTest.time * 60;
            this.startTimer();
        },
        
        // Проверить возможность завершения курса
        checkCourseCompletion(course) {
            if (!course.testId) {
                alert("Этот курс не имеет финального теста для завершения.");
                return false;
            }
            
            const test = this.tests.find(t => t.id === course.testId);
            if (!test) {
                alert("Тест для этого курса не найден.");
                return false;
            }
            
            if (!test.completed) {
                alert(`Для завершения курса необходимо пройти финальный тест.\n\nХотите пройти тест сейчас?`);
                this.startTestForCourse(test, course);
                return false;
            }
            
            if (test.score < course.minScore) {
                alert(`Для завершения курса необходимо набрать минимум ${course.minScore}% в финальном тесте.\n\nВаш результат: ${test.score}%\n\nХотите пройти тест еще раз?`);
                this.startTestForCourse(test, course);
                return false;
            }
            
            return true;
        },
        
        // Завершить курс (публичный метод)
        completeCourse(course) {
            if (this.checkCourseCompletion(course)) {
                this.completeCourseWithTest(course);
            }
        },
        
        generateCertificate(booking) {
            if (!this.user) {
                alert("Для получения сертификата необходимо войти в систему");
                return;
            }
            
            // Если booking - это объект бронирования
            if (typeof booking === 'object') {
                const course = this.courses.find(c => c.title === booking.course);
                if (course) {
                    if (!this.isCourseCompleted(course.id)) {
                        alert("Вы еще не завершили этот курс!");
                        return;
                    }
                    this.generateCertificateForCourse(course);
                } else {
                    this.generateGenericCertificate(booking.course);
                }
            } else {
                // Если booking - это название курса
                const course = this.courses.find(c => c.title === booking);
                if (course) {
                    if (!this.isCourseCompleted(course.id)) {
                        alert("Вы еще не завершили этот курс!");
                        return;
                    }
                    this.generateCertificateForCourse(course);
                } else {
                    this.generateGenericCertificate(booking);
                }
            }
        },
        
        // Генерация обычного сертификата
        generateGenericCertificate(courseTitle) {
        if (!this.user) {
            alert("Для получения сертификата необходимо войти в систему");
            return;
        }

        try {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            
            const userName = this.user.name || this.user.login;
            const currentDate = new Date().toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            // Очищаем холст
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, 297, 210, 'F');
            
            // Фон
            pdf.setFillColor(240, 240, 255);
            pdf.rect(15, 15, 267, 180, 'F');
            
            // Заголовок
            pdf.setFontSize(36);
            pdf.setTextColor(91, 75, 219);
            pdf.setFont("helvetica", "bold");
            pdf.text("CERTIFICATE", 148.5, 60, { align: "center" });
            
            // Текст сертификата
            pdf.setFontSize(16);
            pdf.setTextColor(50, 50, 50);
            pdf.setFont("helvetica", "normal");
            pdf.text("This is to certify that", 148.5, 90, { align: "center" });
            
            // Имя пользователя
            pdf.setFontSize(24);
            pdf.setTextColor(91, 75, 219);
            pdf.setFont("helvetica", "bold");
            pdf.text(userName.toUpperCase(), 148.5, 115, { align: "center" });
            
            // Текст о завершении курса
            pdf.setFontSize(16);
            pdf.setTextColor(50, 50, 50);
            pdf.setFont("helvetica", "normal");
            pdf.text("has successfully completed", 148.5, 140, { align: "center" });
            
            // Название курса
            pdf.setFontSize(20);
            pdf.setTextColor(91, 75, 219);
            pdf.setFont("helvetica", "bold");
            
            const courseTitleLines = this.splitText(courseTitle, 60);
            let yPos = 155;
            courseTitleLines.forEach(line => {
                pdf.text(line, 148.5, yPos, { align: "center" });
                yPos += 12;
            });
            
            // Дата
            /*pdf.setFontSize(14);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Completion date: ${currentDate}`, 148.5, 175, { align: "center" });
            */
            // Подпись
            pdf.setFontSize(12);
            pdf.setTextColor(50, 50, 50);
            pdf.text("Director", 148.5, 190, { align: "center" });
            pdf.line(130, 195, 167, 195);
            pdf.setFontSize(10);
            pdf.text("Learn Hub", 148.5, 200, { align: "center" });
            
            const fileName = `Certificate_${userName}_${Date.now()}.pdf`;
            pdf.save(fileName);
            
            // Добавление сертификата в список
            const newCertificate = {
                id: Date.now(),
                user: this.user.login,
                course: courseTitle,
                date: currentDate,
                pdf: true,
                fileName: fileName
            };
            
            this.certificates.push(newCertificate);
            this.saveCertificates();
            
            this.updateAnalytics();
            
            alert("Certificate successfully generated!");
            
        } catch (error) {
            console.error("Error generating certificate:", error);
            alert("An error occurred while generating the certificate");
        }
    },
        
        updateAnalytics() {
            this.analytics = {
                totalUsers: this.users.length,
                activeCourses: this.courses.length,
                totalBookings: this.bookings.length,
                totalCertificates: this.certificates.length
            };
        },
        
        generateCalendar() {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            
            this.currentMonth = this.months[month];
            this.currentYear = year;
            
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            this.calendarDays = [];
            
            for (let i = 0; i < (firstDay.getDay() || 7) - 1; i++) {
                this.calendarDays.push({ date: '', isEmpty: true });
            }
            
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const date = new Date(year, month, day);
                const isToday = day === now.getDate() && month === now.getMonth();
                const hasLesson = Math.random() > 0.7;
                
                this.calendarDays.push({
                    date: day,
                    fullDate: date,
                    isToday,
                    hasLesson,
                    isSelected: false
                });
            }
            
            const today = this.calendarDays.find(day => day.isToday);
            if (today) {
                this.selectDay(today);
            } else if (this.calendarDays.length > 0) {
                this.selectDay(this.calendarDays.find(day => day.date));
            }
        },
        
        selectDay(day) {
            if (!day.date || day.isEmpty) return;
            
            this.calendarDays.forEach(d => d.isSelected = false);
            day.isSelected = true;
            this.selectedDay = day;
            this.generateLessonsForDay(day);
        },
        
        generateLessonsForDay(day) {
            this.selectedDayLessons = [
                {
                    time: '10:00 - 11:30',
                    course: 'Веб-разработка с нуля',
                    topic: 'Основы HTML5. Семантическая верстка',
                    type: 'Видеоурок'
                }
            ].filter(() => Math.random() > 0.3);
        },
        
        prevMonth() {
            alert("Навигация по календарю будет реализована в следующей версии");
        },
        
        nextMonth() {
            alert("Навигация по календарю будет реализована в следующей версии");
        },
        
        loadDiaryEntries() {
            this.diaryEntries = [
                {
                    date: '15',
                    day: 'Понедельник',
                    grades: [
                        { course: 'HTML/CSS', score: 95 },
                        { course: 'JavaScript', score: 88 }
                    ],
                    comment: 'Отличная работа на занятии!'
                }
            ];
        },
        
        getGradeClass(score) {
            if (score >= 90) return 'excellent';
            if (score >= 75) return 'good';
            if (score >= 60) return 'average';
            return 'poor';
        },
        
        joinLesson(lesson) {
            alert(`Присоединяемся к занятию: ${lesson.course} в ${lesson.time}`);
        },
        
        renderChart() {
            const ctx = document.getElementById('progressChart');
            if (!ctx) return;
            
            // Очистка предыдущего графика
            if (ctx.chart) {
                ctx.chart.destroy();
            }
            
            const completedTests = this.tests.filter(t => t.completed).length;
            const totalTests = this.tests.length;
            const progressPercentage = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;
            
            ctx.chart = new Chart(ctx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Пройдено', 'Осталось'],
                    datasets: [{
                        data: [completedTests, totalTests - completedTests],
                        backgroundColor: [
                            'rgba(91, 75, 219, 0.7)',
                            'rgba(226, 232, 240, 0.7)'
                        ],
                        borderColor: [
                            'rgb(91, 75, 219)',
                            'rgb(226, 232, 240)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ${value} тестов`;
                                }
                            }
                        }
                    },
                    cutout: '70%'
                },
                plugins: [{
                    id: 'centerText',
                    beforeDraw: function(chart) {
                        const width = chart.width;
                        const height = chart.height;
                        const ctx = chart.ctx;
                        
                        ctx.restore();
                        ctx.font = "bold 24px 'Segoe UI'";
                        ctx.fillStyle = '#5b4bdb';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(progressPercentage + '%', width / 2, height / 2);
                        
                        ctx.font = "14px 'Segoe UI'";
                        ctx.fillStyle = '#666';
                        ctx.fillText('прогресс', width / 2, height / 2 + 25);
                        
                        ctx.save();
                    }
                }]
            });
        },
        
        renderAdminChart() {
            const ctx = document.getElementById('adminChart');
            if (!ctx) return;
            
            // Очистка предыдущего графика
            if (ctx.chart) {
                ctx.chart.destroy();
            }
            
            ctx.chart = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                    datasets: [{
                        label: 'Новые пользователи',
                        data: [12, 19, 15, 25, 22, this.users.length],
                        borderColor: 'rgb(91, 75, 219)',
                        backgroundColor: 'rgba(91, 75, 219, 0.1)',
                        tension: 0.1,
                        fill: true
                    }, {
                        label: 'Пройдено тестов',
                        data: [8, 12, 10, 18, 20, this.tests.filter(t => t.completed).length],
                        borderColor: 'rgb(58, 141, 222)',
                        backgroundColor: 'rgba(58, 141, 222, 0.1)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
        
        // Получить тест для курса
        getTestForCourse(course) {
            return this.tests.find(t => t.id === course.testId);
        },
        
        // Проверить статус теста для курса
        getTestStatusForCourse(course) {
            const test = this.getTestForCourse(course);
            if (!test) return 'no-test';
            if (!test.completed) return 'not-started';
            if (test.score < course.minScore) return 'failed';
            return 'passed';
        }
    },
    
    watch: {
        'page'(newPage) {
            if (newPage === 'cabinet') {
                this.$nextTick(() => {
                    this.renderChart();
                });
            } else if (newPage === 'admin') {
                this.$nextTick(() => {
                    this.renderAdminChart();
                });
            }
        },
        
        'cabinetTab'(newTab) {
            if (newTab === 'stats') {
                this.$nextTick(() => {
                    this.renderChart();
                });
            }
        },
        
        'adminTab'(newTab) {
            if (newTab === 'analytics') {
                this.$nextTick(() => {
                    this.renderAdminChart();
                });
            }
        }
    }
});