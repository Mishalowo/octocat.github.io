// Файл: js/image-config.js
// Конфигурация изображений - здесь можно менять все картинки для товаров

const PRODUCT_IMAGES = {
    // Картинки по умолчанию для разных категорий
    DEFAULT: {
        doners: 'default-doner.jpg',
        combo: 'default-combo.jpg',
        snacks: 'default-snack.jpg',
        drinks: 'default-drink.jpg',
        desserts: 'default-dessert.jpg',
        sauces: 'default-sauce.jpg',
        kids: 'default-kids.jpg',
        fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    
    // Специфичные картинки для товаров (можно добавлять по ID или названию)
    SPECIFIC: {
        // По ID товара
        1: '61641031.jpg.webp',
        2: '69723175.jpg.webp',
        3: '89756236.jpg (1).webp',
        4: 'Rectangle 3.png',
        5: 'Rectangle 4.png',
        6: 'Rectangle 5.png',
        
        // По названию товара
        'Классический донер': '61641031.jpg.webp',
        'Донер веган': '69723175.jpg.webp',
        'Донер Street': '89756236.jpg (1).webp',
        'Донер с сосиской': 'Rectangle 3.png',
        'Грибной донер': 'Rectangle 4.png',
        'Королевский донер': 'Rectangle 5.png'
    }
};

// Функция для получения картинки товара
function getProductImage(product) {
    // Пробуем найти по ID
    if (PRODUCT_IMAGES.SPECIFIC[product.id]) {
        return PRODUCT_IMAGES.SPECIFIC[product.id];
    }
    
    // Пробуем найти по названию
    if (PRODUCT_IMAGES.SPECIFIC[product.name]) {
        return PRODUCT_IMAGES.SPECIFIC[product.name];
    }
    
    // Используем картинку из product.image, если она есть
    if (product.image && product.image !== 'null') {
        return product.image;
    }
    
    // Используем картинку по умолчанию для категории
    if (product.category && PRODUCT_IMAGES.DEFAULT[product.category]) {
        return PRODUCT_IMAGES.DEFAULT[product.category];
    }
    
    // Фолбэк картинка
    return PRODUCT_IMAGES.DEFAULT.fallback;
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PRODUCT_IMAGES, getProductImage };
}