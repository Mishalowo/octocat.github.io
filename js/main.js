$(document).ready(function() {
    // ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let currentCategory = 'all';

    // ===== 1. ИНИЦИАЛИЗАЦИЯ =====
    function init() {
        // Инициализация слайдера
        initSlider();
        
        // Загружаем товары только на главной странице
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('index.htm')) {
            loadProducts();
            initCategoryFilter();
        }
        localStorage.removeItem('products');
        localStorage.removeItem('initialProducts');
        
        initAuthSystem();
        updateCartBadge();
        updateAuthLinks();
        bindEventHandlers();
        
        // Проверяем, есть ли товары в localStorage
        if (!localStorage.getItem('products')) {
            loadInitialProducts();
        }
        
        // Инициализируем текущую страницу
        initCurrentPage();
    }

    // ===== 2. ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА =====
    function initSlider() {
        const sliderTrack = $('.slider-track');
        if (!sliderTrack.length) return;

        // Список картинок для слайдера
        const images = [
            'Frame 4.png',
            'Frame 5.png',
            'Frame 6.png',
            'Frame 7.png',
            'Frame 8.png',
            '810ec98b293119811fad6d1426a088d6.jpg'
        ];

        // Создаем дубликаты для бесконечной прокрутки (2 полных набора)
        const allImages = [...images, ...images];

        // Добавляем слайды
        allImages.forEach((image, index) => {
            const slide = $(`
                <div class="slide">
                    <img src="${image}" alt="Донер ${index + 1}">
                </div>
            `);
            sliderTrack.append(slide);
        });

        // Настройка анимации
        const slideWidth = 354; // Ширина слайда с gap
        const totalWidth = slideWidth * images.length;
        
        // Перезапускаем анимацию с правильными значениями
        sliderTrack.css({
            'width': `${slideWidth * allImages.length}px`,
            'animation': `slide ${images.length * 5}s linear infinite`
        });

        // Добавляем стиль для анимации
        const style = $('<style>').text(`
            @keyframes slide {
                0% { transform: translateX(0); }
                100% { transform: translateX(-${totalWidth}px); }
            }
        `);
        $('head').append(style);

        // Обработчики для паузы при наведении
        $('.auto-slider').hover(
            function() {
                $('.slider-track').css('animation-play-state', 'paused');
            },
            function() {
                $('.slider-track').css('animation-play-state', 'running');
            }
        );
    }

    // ===== 3. ЗАГРУЗКА ТОВАРОВ =====
    function loadProducts(category = 'all') {
        currentCategory = category;
        const container = $('#products-container');
        if (!container.length) return;
        
        container.html('<div class="loading-products"><div class="spinner"></div><p>Загружаем меню...</p></div>');
        
        // Получаем все товары
        let products = JSON.parse(localStorage.getItem('products')) || [];
        
        // Если товаров нет, загружаем начальные
        if (products.length === 0) {
            products = JSON.parse(localStorage.getItem('initialProducts')) || [];
            if (products.length > 0) {
                localStorage.setItem('products', JSON.stringify(products));
            }
        }
        
        // Фильтрация по категории
        let filteredProducts = products;
        if (category === 'favorites') {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const favoriteIds = favorites.map(f => f.id);
            filteredProducts = products.filter(p => favoriteIds.includes(p.id));
        } else if (category !== 'all') {
            filteredProducts = products.filter(p => p.category === category);
        }
        
        // Обновляем заголовок
        updateCategoryTitle(category);
        
        // Отображение товаров
        if (filteredProducts.length === 0) {
            const message = category === 'favorites' 
                ? '<div class="no-products"><p>Вы еще ничего не добавили в избранное</p><a href="index.html" class="btn">Посмотреть меню</a></div>'
                : '<div class="no-products"><p>Товары в этой категории скоро появятся!</p></div>';
            container.html(message);
            return;
        }
        
        renderProducts(filteredProducts);
    }

    function renderProducts(products) {
        const container = $('#products-container');
        container.empty();

        
        
        products.forEach(product => {
            // Исправляем путь к изображению
            let imagePath = product.image;
            if (!imagePath || imagePath === 'null') {
                imagePath = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
            } else if (!imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
                // Если это локальный файл, добавляем относительный путь
                if (!imagePath.includes('/')) {
                    imagePath = imagePath;
                }
            }
            
            const isFavorite = checkIfFavorite(product.id);
            const card = $(`
                <div class="product-card" data-id="${product.id}">
                    <div class="product-image">
                        <img src="${imagePath}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                        ${isFavorite ? '<div class="favorite-badge"><i class="fas fa-heart"></i></div>' : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="description">${product.description || 'Вкусный и свежий продукт'}</p>
                        <p class="price">${product.price} ₽</p>
                        <div class="product-actions">
                            <button class="cart-button add-to-cart" 
                                data-id="${product.id}" 
                                data-name="${product.name}" 
                                data-price="${product.price}" 
                                data-image="${imagePath}">
                                В корзину
                            </button>
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${product.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `);
            
            // Обработчик клика на карточку (открытие деталей)
            card.on('click', function(e) {
                if (!$(e.target).closest('.product-actions').length) {
                    showProductDetail(product);
                }
            });
            
            container.append(card);
        });
        
        // Добавляем обработчики для кнопок
        $('.add-to-cart').on('click', addToCart);
        $('.favorite-btn').on('click', toggleFavorite);
        
        // Анимация появления
        $('.product-card').hide().fadeIn(400);
    }

    // ===== 4. ИНИЦИАЛИЗАЦИЯ ТЕКУЩЕЙ СТРАНИЦЫ =====
    function initCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // Устанавливаем активную ссылку в шапке
        $('.up-header .nav-link').removeClass('active');
        
        switch(filename) {
            case 'about.html':
                $('.up-header .nav-link[href*="about"]').addClass('active');
                break;
            case 'contacts.html':
                $('.up-header .nav-link[href*="contacts"]').addClass('active');
                break;
            case 'jobs.html':
                $('.up-header .nav-link[href*="jobs"]').addClass('active');
                initJobApplicationForm();
                break;
            case 'certificates.html':
                $('.up-header .nav-link[href*="certificates"]').addClass('active');
                break;
            case 'donercoins.html':
                $('.up-header .nav-link[href*="donercoins"]').addClass('active');
                initDonercoinsPage();
                break;
            default:
                // Главная страница
                if (filename === 'index.html' || path === '/' || filename === '' || filename === 'index.htm') {
                    $('.up-header .nav-link[href*="jobs"]').addClass('active');
                }
        }
        
        // Инициализируем форму обратной связи
        $('#contact-form').on('submit', function(e) {
            e.preventDefault();
            const name = $('#contact-name').val();
            showNotification(`Спасибо, ${name}! Ваше сообщение отправлено.`, 'success');
            $(this)[0].reset();
        });
    }

    // ===== 5. ФОРМА ЗАЯВКИ НА РАБОТУ =====
    function initJobApplicationForm() {
        $('.apply-btn').on('click', function() {
            const position = $(this).data('position');
            $('#applicant-position').val(position);
            $('.vacancies-list, .benefits-section, .info-card').hide();
            $('#application-form').show();
        });
        
        $('#cancel-application').on('click', function() {
            $('#application-form').hide();
            $('.vacancies-list, .benefits-section, .info-card').show();
            $('#job-application-form')[0].reset();
            $('#application-success').hide();
            $('#job-application-form').show();
        });
        
        $('#job-application-form').on('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: $('#applicant-name').val(),
                email: $('#applicant-email').val(),
                phone: $('#applicant-phone').val(),
                position: $('#applicant-position').val(),
                experience: $('#applicant-experience').val(),
                message: $('#applicant-message').val(),
                date: new Date().toISOString()
            };
            
            // Сохраняем заявку
            let applications = JSON.parse(localStorage.getItem('jobApplications')) || [];
            applications.push(formData);
            localStorage.setItem('jobApplications', JSON.stringify(applications));
            
            // Показываем подтверждение
            $(this).hide();
            $('#application-success').show();
            
            // Отправляем уведомление админу
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.role === 'admin') {
                showNotification('Получена новая заявка на работу!', 'info');
            }
        });
    }

    // ===== 6. СТРАНИЦА ДОНЕРКОИНОВ =====
    function initDonercoinsPage() {
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user) {
            // Показываем коины пользователя
            const coins = user.donercoins || 0;
            $('#coins-count').text(coins);
            $('#login-prompt').hide();
            
            // Загружаем историю
            loadCoinsHistory(user);
        } else {
            // Прячем информацию о коинах
            $('#user-coins-display').hide();
            $('#coins-history').hide();
            
            // Обработчик кнопки входа
            $('#auth-link-page, #auth-footer-page').on('click', function(e) {
                e.preventDefault();
                showAuthModal();
            });
        }
        
        function loadCoinsHistory(user) {
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const userOrders = orders.filter(order => order.email === user.email);
            
            if (userOrders.length > 0) {
                $('#no-history-message').hide();
                $('#history-table').show();
                
                userOrders.forEach(order => {
                    const date = new Date(order.date).toLocaleDateString('ru-RU');
                    const coins = Math.floor(order.total);
                    
                    $('#history-body').append(`
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px;">${date}</td>
                            <td style="padding: 10px;">Заказ #${order.id}</td>
                            <td style="padding: 10px; color: #A64600; font-weight: bold;">+${coins}</td>
                        </tr>
                    `);
                });
            }
        }
    }

    // ===== 7. КОРЗИНА =====
    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity), 0);
        const totalSum = cart.reduce((sum, item) => sum + (item.price * (item.quantity)), 0);
        const badge = $('#cart-badge');
        
        if (badge.length) {
            if (totalItems > 0) {
                badge.removeClass('empty').show();
                badge.find('.cart-count').text(totalItems);
                badge.find('.cart-total-sum').text(totalSum + ' ₽');
            } else {
                badge.addClass('empty').hide();
            }
        }
    }
    
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }
    
    function addToCart(e) {
        e.stopPropagation();
        const button = $(e.currentTarget);
        const id = button.data('id');
        const name = button.data('name');
        const price = parseInt(button.data('price'));
        let image = button.data('image');
        
        // Исправляем путь к изображению
        if (!image || image === 'null') {
            image = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        }
        
        // Анимация кнопки
        button.text('Добавлено!');
        button.css('background-color', '#4CAF50');
        setTimeout(() => {
            button.text('В корзину');
            button.css('background-color', '');
        }, 1500);
        
        // Добавление в корзину
        const existingItem = cart.find(item => item.id == id);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        saveCart();
        showNotification(`${name} добавлен в корзину`, 'success');
    }
    
    function showCartModal() {
        const modalHTML = `
            <div id="cart-modal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-shopping-cart"></i> Корзина</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${generateCartContent()}
                    </div>
                    <div class="modal-footer">
                        <button class="btn continue-shopping">Продолжить покупки</button>
                        ${cart.length > 0 ? '<button class="btn checkout-btn" id="checkout-btn">Оформить заказ</button>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
        
        // Обработчики событий
        $('.close-modal, .continue-shopping, .modal-overlay').on('click', function() {
            $('#cart-modal').fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        // Кнопки управления корзиной
        $('.quantity-btn.plus').on('click', function() {
            const index = $(this).data('index');
            cart[index].quantity = (cart[index].quantity || 1) + 1;
            saveCart();
            updateCartContent();
        });
        
        $('.quantity-btn.minus').on('click', function() {
            const index = $(this).data('index');
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            saveCart();
            updateCartContent();
        });
        
        $('.remove-btn').on('click', function() {
            const index = $(this).data('index');
            cart.splice(index, 1);
            saveCart();
            updateCartContent();
        });
        
        $('#checkout-btn').on('click', showCheckoutForm);
        
        $('.modal-content').on('click', function(e) {
            e.stopPropagation();
        });
        
        $('#cart-modal').fadeIn(300);
    }
    
    function generateCartContent() {
        if (cart.length === 0) {
            return '<div class="empty-cart"><p>Ваша корзина пуста</p></div>';
        }
        
        let html = '<div class="cart-items">';
        let total = 0;
        
        cart.forEach((item, index) => {
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            total += itemTotal;
            
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">${item.price} ₽ × ${quantity} = ${itemTotal} ₽</span>
                    </div>
                    <div class="cart-item-actions">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                        <button class="remove-btn" data-index="${index}">×</button>
                    </div>
                </div>
            `;
        });
        
        html += `</div>
            <div class="cart-total">
                <strong>Итого: ${total} ₽</strong>
            </div>`;
        
        return html;
    }
    
    function updateCartContent() {
        const modal = $('#cart-modal');
        if (modal.length) {
            modal.find('.modal-body').html(generateCartContent());
            
            // Перепривязываем обработчики
            $('.quantity-btn.plus').off('click').on('click', function() {
                const index = $(this).data('index');
                cart[index].quantity = (cart[index].quantity || 1) + 1;
                saveCart();
                updateCartContent();
            });
            
            $('.quantity-btn.minus').off('click').on('click', function() {
                const index = $(this).data('index');
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                saveCart();
                updateCartContent();
            });
            
            $('.remove-btn').off('click').on('click', function() {
                const index = $(this).data('index');
                cart.splice(index, 1);
                saveCart();
                updateCartContent();
            });
            
            // Обновляем кнопку оформления заказа
            if (cart.length === 0) {
                $('.checkout-btn').remove();
            } else if (!$('.checkout-btn').length) {
                $('.modal-footer').append('<button class="btn checkout-btn" id="checkout-btn">Оформить заказ</button>');
                $('#checkout-btn').on('click', showCheckoutForm);
            }
        }
    }

    // ===== 8. ФОРМА ОФОРМЛЕНИЯ ЗАКАЗА =====
    function showCheckoutForm() {
        $('#cart-modal').fadeOut(300, function() {
            $(this).remove();
        });
        
        const formHTML = `
            <div id="checkout-modal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-receipt"></i> Оформление заказа</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="order-form">
                            <div class="form-group">
                                <label for="order-name">Ваше имя *</label>
                                <input type="text" id="order-name" required placeholder="Иван Иванов">
                            </div>
                            
                            <div class="form-group">
                                <label for="order-phone">Телефон *</label>
                                <input type="tel" id="order-phone" required placeholder="8-900-123-45-67">
                            </div>
                            
                            <div class="form-group">
                                <label for="order-address">Адрес доставки *</label>
                                <input type="text" id="order-address" required placeholder="ул. Ленина, 123, кв. 45">
                            </div>
                            
                            <div class="form-group">
                                <label for="order-comment">Комментарий к заказу</label>
                                <textarea id="order-comment" rows="3" placeholder="Особые пожелания..."></textarea>
                            </div>
                            
                            <div class="order-summary">
                                <h4>Ваш заказ:</h4>
                                ${generateOrderSummary()}
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn back-to-cart">← Назад к корзине</button>
                                <button type="submit" class="btn submit-order">Подтвердить заказ</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(formHTML);
        
        // Обработчики
        $('.close-modal, .modal-overlay').on('click', function() {
            $('#checkout-modal').remove();
        });
        
        $('.back-to-cart').on('click', function() {
            $('#checkout-modal').remove();
            showCartModal();
        });
        
        $('#order-form').on('submit', function(e) {
            e.preventDefault();
            processOrder();
        });
        
        $('#checkout-modal').fadeIn(300);
    }
    
    function generateOrderSummary() {
        let html = '<ul class="order-items">';
        let total = 0;
        
        cart.forEach(item => {
            const quantity = item.quantity || 1;
            const itemTotal = item.price * quantity;
            total += itemTotal;
            html += `<li>${item.name} × ${quantity} — ${itemTotal} ₽</li>`;
        });
        
        html += `</ul><p class="order-total"><strong>Итого: ${total} ₽</strong></p>`;
        return html;
    }
    
    function processOrder() {
        const orderData = {
            id: Date.now(),
            name: $('#order-name').val(),
            phone: $('#order-phone').val(),
            address: $('#order-address').val(),
            comment: $('#order-comment').val(),
            cart: cart,
            total: cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0),
            status: 'новый',
            date: new Date().toISOString()
        };
        
        // Сохраняем заказ
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Добавляем донеркоины пользователю
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            user.donercoins = (user.donercoins || 0) + Math.floor(orderData.total);
            localStorage.setItem('user', JSON.stringify(user));
            updateAuthLinks();
        }
        
        // Очищаем корзину
        cart = [];
        saveCart();
        
        // Показываем подтверждение
        $('#checkout-modal').remove();
        
        const confirmationHTML = `
            <div id="confirmation-modal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-check-circle"></i> Заказ оформлен!</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="confirmation-content">
                            <p>Спасибо за ваш заказ, <strong>${orderData.name}</strong>!</p>
                            <p>Номер заказа: <strong>#${orderData.id}</strong></p>
                            <p>Сумма: <strong>${orderData.total} ₽</strong></p>
                            ${user ? `<p>Вы получили <strong>${Math.floor(orderData.total)} донеркоинов</strong>!</p>` : ''}
                            <p>Доставка по адресу: <strong>${orderData.address}</strong></p>
                            <p>Наш оператор свяжется с вами по телефону <strong>${orderData.phone}</strong> для подтверждения.</p>
                            <p class="order-note">Приятного аппетита! 😊</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn close-modal">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(confirmationHTML);
        
        $('.close-modal, .modal-overlay').on('click', function() {
            $('#confirmation-modal').fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        $('#confirmation-modal').fadeIn(300);
    }

    // ===== 9. ИЗБРАННОЕ =====
    function toggleFavorite(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            showAuthModal();
            return;
        }
        
        const button = $(e.currentTarget);
        const id = button.data('id');
        const productCard = button.closest('.product-card');
        const name = productCard.find('h3').text();
        const price = parseInt(productCard.find('.price').text().replace(' ₽', ''));
        const image = productCard.find('img').attr('src');
        
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const existingIndex = favorites.findIndex(item => item.id == id);
        
        if (existingIndex !== -1) {
            // Удаляем из избранного
            favorites.splice(existingIndex, 1);
            button.removeClass('active');
            productCard.find('.favorite-badge').remove();
            showNotification('Удалено из избранного', 'info');
        } else {
            // Добавляем в избранное
            favorites.push({
                id: id,
                name: name,
                price: price,
                image: image,
                addedAt: new Date().toISOString()
            });
            button.addClass('active');
            productCard.find('.product-image').append('<div class="favorite-badge"><i class="fas fa-heart"></i></div>');
            showNotification('Добавлено в избранное', 'success');
        }
        
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Если мы в категории "Избранное", обновляем список
        if (currentCategory === 'favorites') {
            loadProducts('favorites');
        }
    }
    
    function checkIfFavorite(productId) {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.some(item => item.id == productId);
    }

    // ===== 10. ДЕТАЛЬНАЯ КАРТОЧКА ТОВАРА =====
    function showProductDetail(product) {
        // Исправляем путь к изображению
        let imagePath = product.image;
        if (!imagePath || imagePath === 'null') {
            imagePath = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        }
        
        const modalHTML = `
            <div id="product-detail-modal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h2>${product.name}</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="product-detail-content">
                            <div class="product-detail-image">
                                <img src="${imagePath}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                            </div>
                            <div class="product-detail-info">
                                <div class="category">${getCategoryName(product.category)}</div>
                                <div class="price">${product.price} ₽</div>
                                
                                <div class="description">
                                    <h4>Описание</h4>
                                    <p>${product.description || 'Вкусный и свежий продукт, приготовленный по традиционному рецепту'}</p>
                                </div>
                                
                                <div class="composition">
                                    <h4>Состав</h4>
                                    <ul>
                                        ${generateComposition(product)}
                                    </ul>
                                </div>
                                
                                <div class="product-actions">
                                    <button class="cart-button add-to-cart-detail" 
                                        data-id="${product.id}" 
                                        data-name="${product.name}" 
                                        data-price="${product.price}" 
                                        data-image="${imagePath}"
                                        style="width: 100%; margin-bottom: 10px;">
                                        Добавить в корзину
                                    </button>
                                    <button class="favorite-btn-detail ${checkIfFavorite(product.id) ? 'active' : ''}" 
                                        data-id="${product.id}"
                                        style="width: 100%; padding: 10px; background: #f5f5f5; border: none; border-radius: 5px; cursor: pointer;">
                                        <i class="fas fa-heart"></i> 
                                        ${checkIfFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
        
        // Обработчики событий
        $('.close-modal, .modal-overlay').on('click', function() {
            $('#product-detail-modal').fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        // Кнопка добавления в корзину
        $('.add-to-cart-detail').on('click', function(e) {
            e.stopPropagation();
            addToCart(e);
        });
        
        // Кнопка избранного
        $('.favorite-btn-detail').on('click', function(e) {
            e.stopPropagation();
            toggleFavorite(e);
            $(this).toggleClass('active');
            $(this).html(`<i class="fas fa-heart"></i> ${$(this).hasClass('active') ? 'Удалить из избранного' : 'Добавить в избранное'}`);
        });
        
        $('.modal-content').on('click', function(e) {
            e.stopPropagation();
        });
        
        $('#product-detail-modal').fadeIn(300);
    }
    
    function generateComposition(product) {
        const compositions = {
            'doners': ['Куриное мясо', 'Свежие овощи', 'Лаваш', 'Соус', 'Специи'],
            'combo': ['Донер', 'Картофель фри', 'Напиток'],
            'snacks': ['Картофель', 'Специи', 'Масло'],
            'drinks': ['Вода', 'Сахар', 'Натуральные ароматизаторы'],
            'desserts': ['Сыр', 'Сахар', 'Ваниль', 'Ягоды'],
            'sauces': ['Майонез', 'Чеснок', 'Специи', 'Йогурт']
        };
        
        const items = compositions[product.category] || ['Свежие ингредиенты', 'Натуральные продукты', 'Без ГМО'];
        
        return items.map(item => `<li>${item}</li>`).join('');
    }
    
    function getCategoryName(category) {
        const categories = {
            'doners': 'Донеры',
            'combo': 'Комбо',
            'snacks': 'Закуски',
            'drinks': 'Напитки',
            'desserts': 'Десерты',
            'sauces': 'Соусы',
            'kids': 'Детское меню'
        };
        return categories[category] || 'Товар';
    }

    // ===== 11. АВТОРИЗАЦИЯ =====
    function initAuthSystem() {
        // Проверяем авторизацию
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            updateAuthLinks(user);
        }
        
        // Создаем тестового админа если нет пользователей
        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.length === 0) {
            const adminUser = {
                id: 1,
                name: 'Администратор',
                email: 'admin@doner.ru',
                password: 'admin123',
                role: 'admin',
                donercoins: 1000,
                registrationDate: new Date().toISOString()
            };
            users.push(adminUser);
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
    
    function updateAuthLinks(user) {
        const authLink = $('#auth-link');
        const authFooter = $('#auth-footer');
        
        if (user) {
            // Обновляем ссылку в основной шапке
            authLink.text(user.name).css('font-weight', 'bold');
            
            // Обновляем ссылку в футере
            if (authFooter.length) {
                authFooter.text(user.name).css('font-weight', 'bold');
            }
            
            // Обновляем ссылку в нижнем хедере
            const downHeaderAuth = $('.down-header .nav-links').find('a.nav-link').filter(function() {
                return $(this).text().trim() === 'Вход';
            });
            if (downHeaderAuth.length) {
                downHeaderAuth.text(user.name).css('font-weight', 'bold');
            }
            
            // Показываем секцию управления товарами если пользователь админ
            if (user.role === 'admin') {
                $('#admin-section').show();
                initAdminFeatures();
            }
        } else {
            authLink.text('Вход').css('font-weight', 'normal');
            if (authFooter.length) authFooter.text('Вход').css('font-weight', 'normal');
            
            const downHeaderAuth = $('.down-header .nav-links').find('a.nav-link').filter(function() {
                return $(this).text().trim() === 'Вход' || $(this).text().trim() === user?.name;
            });
            if (downHeaderAuth.length) downHeaderAuth.text('Вход').css('font-weight', 'normal');
        }
    }
    
    function showAuthModal() {
        const modalHTML = `
            <div id="auth-modal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-user"></i> Вход</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="auth-form">
                            <div class="form-group">
                                <label for="auth-email">Email</label>
                                <input type="email" id="auth-email" required placeholder="ваш@email.ru">
                            </div>
                            
                            <div class="form-group">
                                <label for="auth-password">Пароль</label>
                                <input type="password" id="auth-password" required placeholder="Ваш пароль">
                            </div>
                            
                            <div class="auth-switch" style="text-align: center; margin: 15px 0;">
                                <a href="#" id="switch-to-register">Нет аккаунта? Зарегистрироваться</a>
                            </div>
                            
                            <button type="submit" class="btn" style="width: 100%;">
                                <i class="fas fa-sign-in-alt"></i> Войти
                            </button>
                        </form>
                        
                        <form id="register-form" style="display: none;">
                            <div class="form-group">
                                <label for="reg-name">Имя</label>
                                <input type="text" id="reg-name" required placeholder="Ваше имя">
                            </div>
                            
                            <div class="form-group">
                                <label for="reg-email">Email</label>
                                <input type="email" id="reg-email" required placeholder="ваш@email.ru">
                            </div>
                            
                            <div class="form-group">
                                <label for="reg-password">Пароль</label>
                                <input type="password" id="reg-password" required placeholder="Минимум 6 символов">
                            </div>
                            
                            <div class="form-group">
                                <label for="reg-confirm">Подтвердите пароль</label>
                                <input type="password" id="reg-confirm" required>
                            </div>
                            
                            <div class="form-group">
                                <label style="display: flex; align-items: center; font-size: 14px;">
                                    <input type="checkbox" id="reg-terms" required style="margin-right: 8px;">
                                    Я согласен с условиями использования
                                </label>
                            </div>
                            
                            <div class="auth-switch" style="text-align: center; margin: 15px 0;">
                                <a href="#" id="switch-to-login">Уже есть аккаунт? Войти</a>
                            </div>
                            
                            <button type="submit" class="btn" style="width: 100%;">
                                <i class="fas fa-user-plus"></i> Зарегистрироваться
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
        
        // Обработчики
        $('.close-modal, .modal-overlay').on('click', function() {
            $('#auth-modal').remove();
        });
        
        $('#switch-to-register').on('click', function(e) {
            e.preventDefault();
            $('#auth-form').hide();
            $('#register-form').show();
        });
        
        $('#switch-to-login').on('click', function(e) {
            e.preventDefault();
            $('#register-form').hide();
            $('#auth-form').show();
        });
        
        $('#auth-form').on('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
        
        $('#register-form').on('submit', function(e) {
            e.preventDefault();
            handleRegister();
        });
        
        $('#auth-modal').fadeIn(300);
    }
    
    function handleLogin() {
        const email = $('#auth-email').val();
        const password = $('#auth-password').val();
        
        if (!email || !password) {
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Убираем пароль из объекта пользователя для безопасности
            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            updateAuthLinks(userWithoutPassword);
            $('#auth-modal').fadeOut(300, function() {
                $(this).remove();
                showNotification(`Добро пожаловать, ${user.name}!`, 'success');
                
                // Обновляем страницу донеркоинов если открыта
                if (window.location.pathname.includes('donercoins.html')) {
                    location.reload();
                }
            });
        } else {
            showNotification('Неверный email или пароль', 'error');
        }
    }
    
    function handleRegister() {
        const name = $('#reg-name').val();
        const email = $('#reg-email').val();
        const password = $('#reg-password').val();
        const confirm = $('#reg-confirm').val();
        const terms = $('#reg-terms').is(':checked');
        
        // Валидация
        if (!name || !email || !password || !confirm) {
            showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (!terms) {
            showNotification('Примите условия использования', 'error');
            return;
        }
        
        if (password !== confirm) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Пароль должен быть не менее 6 символов', 'error');
            return;
        }
        
        // Проверка существующего пользователя
        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.email === email)) {
            showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }
        
        // Сохранение
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            role: 'user',
            donercoins: 100, // Бонус при регистрации
            registrationDate: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        updateAuthLinks(userWithoutPassword);
        $('#auth-modal').fadeOut(300, function() {
            $(this).remove();
            showNotification(`Регистрация успешна! Добро пожаловать, ${name}!`, 'success');
            
            // Обновляем страницу донеркоинов если открыта
            if (window.location.pathname.includes('donercoins.html')) {
                location.reload();
            }
        });
    }

    // ===== 12. УПРАВЛЕНИЕ ТОВАРАМИ (для админа) =====
    function initAdminFeatures() {
        // Добавляем кнопку управления товарами в меню
        if (!$('#admin-panel-link').length) {
            $('.left-menu ul').append('<li><a href="#" id="admin-panel-link"><i class="fas fa-cogs"></i> Управление товарами</a></li>');
            $('#admin-panel-link').on('click', function(e) {
                e.preventDefault();
                showAdminPanel();
            });
        }
    }
    
    function showAdminPanel() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        
        const modalHTML = `
            <div id="admin-panel-modal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
                    <div class="modal-header">
                        <h2><i class="fas fa-cogs"></i> Управление товарами</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="admin-section">
                            <h4><i class="fas fa-hamburger"></i> Товары (${products.length})</h4>
                            <div class="product-list">
                                ${products.map(product => {
                                    let imagePath = product.image;
                                    if (!imagePath || imagePath === 'null') {
                                        imagePath = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                    }
                                    return `
                                        <div class="product-item">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <img src="${imagePath}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'">
                                                <div>
                                                    <strong>${product.name}</strong><br>
                                                    <small>${product.price} ₽ | ${getCategoryName(product.category)}</small>
                                                </div>
                                            </div>
                                            <div class="actions">
                                                <button class="btn btn-small edit-product" data-id="${product.id}">Изменить</button>
                                                <button class="btn btn-small delete-product" data-id="${product.id}">Удалить</button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                            <button class="btn" id="add-product-btn"><i class="fas fa-plus"></i> Добавить товар</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn close-modal">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
        
        $('.close-modal, .modal-overlay').on('click', function() {
            $('#admin-panel-modal').fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        $('#add-product-btn').on('click', showAddProductForm);
        
        $('.edit-product').on('click', function() {
            const productId = $(this).data('id');
            showEditProductForm(productId);
        });
        
        $('.delete-product').on('click', function() {
            const productId = $(this).data('id');
            if (confirm('Удалить этот товар?')) {
                deleteProduct(productId);
            }
        });
        
        $('#admin-panel-modal').fadeIn(300);
    }
    
    function showAddProductForm() {
        const formHTML = `
            <div id="add-product-modal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Добавить товар</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="new-product-form">
                            <div class="form-group">
                                <label for="product-name">Название</label>
                                <input type="text" id="product-name" required>
                            </div>
                            <div class="form-group">
                                <label for="product-price">Цена (₽)</label>
                                <input type="number" id="product-price" required>
                            </div>
                            <div class="form-group">
                                <label for="product-category">Категория</label>
                                <select id="product-category" required>
                                    <option value="doners">Донеры</option>
                                    <option value="combo">Комбо</option>
                                    <option value="snacks">Закуски</option>
                                    <option value="drinks">Напитки</option>
                                    <option value="desserts">Десерты</option>
                                    <option value="sauces">Соусы</option>
                                    <option value="kids">Детское меню</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="product-image">URL изображения</label>
                                <input type="text" id="product-image" placeholder="https://images.unsplash.com/photo-..." value="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                            </div>
                            <div class="form-group">
                                <label for="product-description">Описание</label>
                                <textarea id="product-description" rows="3"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn close-modal">Отмена</button>
                                <button type="submit" class="btn">Добавить</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(formHTML);
        
        $('.close-modal, .modal-overlay').on('click', function() {
            $('#add-product-modal').fadeOut(300, function() {
                $(this).remove();
            });
        });
        
        $('#new-product-form').on('submit', function(e) {
            e.preventDefault();
            addNewProduct();
        });
        
        $('#add-product-modal').fadeIn(300);
    }
    
    function addNewProduct() {
        let imageUrl = $('#product-image').val();
        if (!imageUrl || imageUrl.trim() === '') {
            imageUrl = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        }
        
        const product = {
            id: Date.now(),
            name: $('#product-name').val(),
            price: parseInt($('#product-price').val()),
            category: $('#product-category').val(),
            image: imageUrl,
            description: $('#product-description').val(),
            createdAt: new Date().toISOString()
        };
        
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.push(product);
        localStorage.setItem('products', JSON.stringify(products));
        
        showNotification('Товар успешно добавлен!', 'success');
        $('#add-product-modal').remove();
        $('#admin-panel-modal').remove();
        showAdminPanel();
        
        // Обновляем отображение товаров если мы на главной странице
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            loadProducts(currentCategory);
        }
    }
    
    function showEditProductForm(productId) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id == productId);
        
        if (product) {
            let imagePath = product.image;
            if (!imagePath || imagePath === 'null') {
                imagePath = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
            }
            
            const formHTML = `
                <div id="edit-product-modal" class="modal">
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Редактировать товар</h2>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form id="edit-product-form">
                                <div class="form-group">
                                    <label for="edit-name">Название</label>
                                    <input type="text" id="edit-name" value="${product.name}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-price">Цена (₽)</label>
                                    <input type="number" id="edit-price" value="${product.price}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-category">Категория</label>
                                    <select id="edit-category" required>
                                        <option value="doners" ${product.category === 'doners' ? 'selected' : ''}>Донеры</option>
                                        <option value="combo" ${product.category === 'combo' ? 'selected' : ''}>Комбо</option>
                                        <option value="snacks" ${product.category === 'snacks' ? 'selected' : ''}>Закуски</option>
                                        <option value="drinks" ${product.category === 'drinks' ? 'selected' : ''}>Напитки</option>
                                        <option value="desserts" ${product.category === 'desserts' ? 'selected' : ''}>Десерты</option>
                                        <option value="sauces" ${product.category === 'sauces' ? 'selected' : ''}>Соусы</option>
                                        <option value="kids" ${product.category === 'kids' ? 'selected' : ''}>Детское меню</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="edit-image">URL изображения</label>
                                    <input type="text" id="edit-image" value="${imagePath}">
                                </div>
                                <div class="form-group">
                                    <label for="edit-description">Описание</label>
                                    <textarea id="edit-description" rows="3">${product.description || ''}</textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn btn-danger" id="delete-product">Удалить</button>
                                    <button type="button" class="btn close-modal">Отмена</button>
                                    <button type="submit" class="btn">Сохранить</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            $('body').append(formHTML);
            
            $('.close-modal, .modal-overlay').on('click', function() {
                $('#edit-product-modal').fadeOut(300, function() {
                    $(this).remove();
                });
            });
            
            $('#edit-product-form').on('submit', function(e) {
                e.preventDefault();
                saveProductChanges(productId);
            });
            
            $('#delete-product').on('click', function() {
                if (confirm('Удалить этот товар?')) {
                    deleteProduct(productId);
                }
            });
            
            $('#edit-product-modal').fadeIn(300);
        }
    }
    
    function saveProductChanges(productId) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        
        const index = products.findIndex(p => p.id == productId);
        if (index !== -1) {
            let imageUrl = $('#edit-image').val();
            if (!imageUrl || imageUrl.trim() === '') {
                imageUrl = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
            }
            
            products[index] = {
                ...products[index],
                name: $('#edit-name').val(),
                price: parseInt($('#edit-price').val()),
                category: $('#edit-category').val(),
                image: imageUrl,
                description: $('#edit-description').val(),
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem('products', JSON.stringify(products));
            showNotification('Товар успешно обновлен!', 'success');
            $('#edit-product-modal').remove();
            $('#admin-panel-modal').remove();
            showAdminPanel();
            
            // Обновляем отображение товаров
            if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                loadProducts(currentCategory);
            }
        }
    }
    
    function deleteProduct(productId) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id != productId);
        localStorage.setItem('products', JSON.stringify(products));
        
        showNotification('Товар удален!', 'info');
        $('#edit-product-modal, #admin-panel-modal').remove();
        showAdminPanel();
        
        // Обновляем отображение товаров
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            loadProducts(currentCategory);
        }
    }

    // ===== 13. ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ =====
    function initCategoryFilter() {
        // Обработчики для левого меню
        $('#left-menu a').on('click', function(e) {
            e.preventDefault();
            const category = $(this).data('category') || 'all';
            
            // Пропускаем админ-ссылку
            if ($(this).attr('id') === 'admin-panel-link') return;
            
            // Обновляем активный элемент
            $('#left-menu a').removeClass('active');
            $(this).addClass('active');
            
            // Загружаем товары
            loadProducts(category);
        });
        
        // Обработчики для меню в шапке
        $('.down-header .nav-link').on('click', function(e) {
            e.preventDefault();
            const category = $(this).data('category');
            
            if (category) {
                // Обновляем активный элемент в левом меню
                $('#left-menu a').removeClass('active');
                $(`#left-menu a[data-category="${category}"]`).addClass('active');
                
                // Загружаем товары
                loadProducts(category);
            }
        });
        
        // Обработчики для выпадающего меню
        $('.dropdown-link').on('click', function(e) {
            e.preventDefault();
            const category = $(this).data('category');
            
            if (category) {
                $('#left-menu a').removeClass('active');
                $(`#left-menu a[data-category="${category}"]`).addClass('active');
                loadProducts(category);
            }
        });
        
        // Обработчики для футера
        $('.footer-section a[data-category]').on('click', function(e) {
            e.preventDefault();
            const category = $(this).data('category');
            $('#left-menu a').removeClass('active');
            $(`#left-menu a[data-category="${category}"]`).addClass('active');
            loadProducts(category);
        });
    }
    
    function updateCategoryTitle(category) {
        const titles = {
            'all': 'Все товары',
            'doners': 'Донеры',
            'combo': 'Комбо',
            'snacks': 'Закуски',
            'drinks': 'Напитки',
            'desserts': 'Десерты',
            'sauces': 'Соусы',
            'kids': 'Детское меню',
            'favorites': 'Избранное'
        };
        
        $('#category-title').text(titles[category] || 'Товары');
    }

    // ===== 14. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
    function bindEventHandlers() {
        // Кнопка корзины
        $('#cart-button').on('click', function(e) {
            e.preventDefault();
            showCartModal();
        });
        
        // Кнопка "Позвонить"
        $('.call-button').on('click', function() {
            showNotification('Имитация звонка на номер 8-900-123-45-67', 'info');
        });
        
        // Обработчик для кнопки входа в шапке
        $('#auth-link').on('click', function(e) {
            e.preventDefault();
            showAuthModal();
        });
        
        // Обработчик для кнопки входа в футере
        $('#auth-footer').on('click', function(e) {
            e.preventDefault();
            showAuthModal();
        });
    }
    
    function loadInitialProducts() {
        const initialProducts = [
  {
    "id": 1,
    "name": "Классический донер",
    "price": 250,
    "image": "61641031.jpg.webp",
    "category": "doners",
    "description": "Классический донер с курицей, свежими овощами и фирменным соусом"
  },
  {
    "id": 2,
    "name": "Донер веган",
    "price": 270,
    "image": "69723175.jpg.webp",
    "category": "doners",
    "description": "Веганский донер с овощными котлетами, авокадо и соусом тахини"
  },
  {
    "id": 3,
    "name": "Донер Street",
    "price": 280,
    "image": "89756236.jpg (1).webp",
    "category": "doners",
    "description": "Уличный вариант с острым соусом и маринованными овощами"
  },
  {
    "id": 4,
    "name": "Донер с сосиской",
    "price": 290,
    "image": "Rectangle 3.png",
    "category": "doners",
    "description": "Донер с охотничьими колбасками, сыром и грибами"
  },
  {
    "id": 5,
    "name": "Грибной донер",
    "price": 230,
    "image": "Rectangle 4.png",
    "category": "doners",
    "description": "С шампиньонами, сыром и сливочным соусом"
  },
  {
    "id": 6,
    "name": "Королевский донер",
    "price": 350,
    "image": "Rectangle 5.png",
    "category": "doners",
    "description": "Большой донер с тремя видами мяса и двойной порцией овощей"
  },
  {
    "id": 7,
    "name": "Донер Комбо",
    "price": 450,
    "image": "038186e63d86f1a9fdb250783fcad234.jpg",
    "category": "combo",
    "description": "Донер + картофель фри + напиток на выбор"
  },
  {
    "id": 26,
    "name": "Веган Комбо",
    "price": 480,
    "image": "Vegan.webp",
    "category": "combo",
    "description": "Два веган донера + два напитка"
  },
  {
    "id": 27,
    "name": "Стрит Комбо",
    "price": 520,
    "image": "XXL_height.webp",
    "category": "combo",
    "description": "Донер Street + наггетсы + картофель фри + газировка"
  },
   {
    "id": 30,
    "name": "КомбоXXX",
    "price": 520,
    "image": "maxresdefault (2).jpg",
    "category": "combo",
    "description": "Грибной донер + Донер с сосиской + Классический донер + газировка"
  },
  {
    "id": 9,
    "name": "Картофель фри",
    "price": 150,
    "image": "13310809.jpg",
    "category": "snacks",
    "description": "Хрустящий картофель фри с сырным соусом"
  },
  {
    "id": 10,
    "name": "Луковые кольца",
    "price": 180,
    "image": "i.webp",
    "category": "snacks",
    "description": "Хрустящие луковые кольца в панировке"
  },
  {
    "id": 11,
    "name": "Наггетсы",
    "price": 200,
    "image": "1440x1082.jpg",
    "category": "snacks",
    "description": "Куриные наггетсы (6 шт.) с соусом"
  },
  {
    "id": 28,
    "name": "Сырные палочки",
    "price": 220,
    "image": "100061715487b0.webp",
    "category": "snacks",
    "description": "Хрустящие сырные палочки в панировке (8 шт.)"
  },
  {
    "id": 29,
    "name": "Картофель по-деревенски",
    "price": 170,
    "image": "maxresdefault (1).jpg",
    "category": "snacks",
    "description": "Запеченный картофель с травами и сметанным соусом"
  },
  {
    "id": 12,
    "name": "Кола",
    "price": 120,
    "image": "2093073-1-800Wx800H.webp",
    "category": "drinks",
    "description": "Coca-Cola 0.5л"
  },
  {
    "id": 13,
    "name": "Фанта",
    "price": 120,
    "image": "b40e746b60d8f0506aa4c666b7c77c86---jpeg_1000x_103c0_convert.jpeg",
    "category": "drinks",
    "description": "Fanta 0.5л"
  },
  {
    "id": 14,
    "name": "Спрайт",
    "price": 120,
    "image": "dobryy-sprayt-1l.jpg",
    "category": "drinks",
    "description": "Sprite 0.5л"
  },
  {
    "id": 30,
    "name": "Сок яблочный",
    "price": 110,
    "image": "100040809863b0.webp",
    "category": "drinks",
    "description": "Яблочный сок, 0.33л"
  },
  {
    "id": 31,
    "name": "Морс ягодный",
    "price": 130,
    "image": "12.webp",
    "category": "drinks",
    "description": "Домашний ягодный морс, 0.4л"
  },
  {
    "id": 16,
    "name": "Чизкейк",
    "price": 220,
    "image": "13.webp",
    "category": "desserts",
    "description": "Классический нью-йоркский чизкейк"
  },
  {
    "id": 17,
    "name": "Ягодка",
    "price": 250,
    "image": "1440x1082 (1).jpg",
    "category": "desserts",
    "description": "Нежный чизкейк с ягодным топпингом"
  },
  {
    "id": 18,
    "name": "Тирамису",
    "price": 240,
    "image": "c862b999-d455-438f-bcfb-befefbb9e30c.webp",
    "category": "desserts",
    "description": "Итальянский десерт с кофейным вкусом"
  },
  {
    "id": 19,
    "name": "Чизкейк Орео",
    "price": 260,
    "image": "oreo.webp",
    "category": "desserts",
    "description": "Чизкейк с крошкой печенья Oreo"
  },
  {
    "id": 32,
    "name": "Детский донер",
    "price": 180,
    "image": "ролл цезарь.jpg",
    "category": "kids",
    "description": "Маленький донер с курицей, без острых соусов"
  },
  {
    "id": 33,
    "name": "Детские наггетсы",
    "price": 160,
    "image": "c8ca4f2984d316aa10b44a5d591b3d62.jpeg",
    "category": "kids",
    "description": "Куриные наггетсы (4 шт.) с картофелем фри"
  },
  {
    "id": 34,
    "name": "Мини-пицца",
    "price": 220,
    "image": "picca_s_kukuruzoi_i_vetchinoi-91076.jpg",
    "category": "kids",
    "description": "Маленькая пицца с курицей и кукурузой"
  },
  {
    "id": 35,
    "name": "Панкейки с бананом",
    "price": 190,
    "image": "og_og_1684146580277433899.jpg",
    "category": "kids",
    "description": "Сладкие панкейки с бананом и шоколадным сиропом"
  },
  
  {
    "id": 21,
    "name": "Сырный соус",
    "price": 50,
    "image": "sous-syrnyj-vidnoe-768x512-jpeg.webp",
    "category": "sauces",
    "description": "Сливочный сырный соус"
  },
  {
    "id": 22,
    "name": "Чесночный соус",
    "price": 50,
    "image": "48786261.jpg",
    "category": "sauces",
    "description": "Традиционный чесночный соус"
  },
  {
    "id": 23,
    "name": "Кисло-сладкий соус",
    "price": 50,
    "image": "5cd5cb9995c396fcb702db4cacc468a0.jpg",
    "category": "sauces",
    "description": "Кисло-сладкий соус по-азиатски"
  },
  {
    "id": 24,
    "name": "Острый соус",
    "price": 50,
    "image": "maxresdefault.jpg",
    "category": "sauces",
    "description": "Острый соус с перчиком чили"
  },
  {
    "id": 25,
    "name": "Барбекю соус",
    "price": 50,
    "image": "Barbi.webp",
    "category": "sauces",
    "description": "Копченый соус барбекю"
  }
];
        
        localStorage.setItem('initialProducts', JSON.stringify(initialProducts));
        localStorage.setItem('products', JSON.stringify(initialProducts));
    }
    
    function showNotification(message, type = 'info') {
        // Удаляем старые уведомления
        $('.notification').remove();
        
        const colors = {
            'success': '#4CAF50',
            'error': '#f44336',
            'info': '#2196F3',
            'warning': '#ff9800'
        };
        
        const notificationHTML = `
            <div class="notification ${type}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${colors[type]};
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10001;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            ">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        $('body').append(notificationHTML);
        
        setTimeout(() => {
            $('.notification').fadeOut(300, function() {
                $(this).remove();
            });
        }, 3000);
    }

    // ===== ЗАПУСК ПРИЛОЖЕНИЯ =====
    init();
});