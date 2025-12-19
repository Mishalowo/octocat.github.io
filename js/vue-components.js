document.addEventListener('DOMContentLoaded', function() {
    // Vue компонент: Отзывы о товарах
    Vue.component('product-reviews', {
        template: `
            <div class="product-reviews">
                <h3><i class="fas fa-comments"></i> Отзывы покупателей</h3>
                
                <div v-if="reviews.length === 0" class="no-reviews">
                    <p>Пока нет отзывов. Будьте первым!</p>
                </div>
                
                <div v-else class="reviews-list">
                    <div v-for="review in sortedReviews" :key="review.id" class="review-item">
                        <div class="review-header">
                            <span class="review-author">{{ review.author }}</span>
                            <span class="review-date">{{ formatDate(review.date) }}</span>
                        </div>
                        <div class="review-rating">
                            <span v-for="n in 5" :key="n" 
                                :class="['star', n <= review.rating ? 'active' : '']">
                                ★
                            </span>
                        </div>
                        <p class="review-text">{{ review.text }}</p>
                    </div>
                </div>
                
                <div class="add-review">
                    <h4>Оставить отзыв</h4>
                    <div class="form-group">
                        <input type="text" v-model="newReview.author" 
                               placeholder="Ваше имя" 
                               required>
                    </div>
                    <div class="form-group">
                        <div class="stars">
                            <span v-for="n in 5" :key="n" 
                                @click="setRating(n)"
                                :class="['star', n <= newReview.rating ? 'active' : '']">
                                ★
                            </span>
                            <span style="margin-left: 10px; color: #666; font-size: 14px;">
                                {{ newReview.rating }} из 5
                            </span>
                        </div>
                    </div>
                    <div class="form-group">
                        <textarea v-model="newReview.text" 
                                  placeholder="Поделитесь вашим мнением о наших донерах..." 
                                  rows="3" 
                                  required></textarea>
                    </div>
                    <button @click="addReview" class="btn" :disabled="!isReviewValid">
                        <i class="fas fa-paper-plane"></i> Отправить отзыв
                    </button>
                </div>
            </div>
        `,
        data() {
            return {
                reviews: [],
                newReview: {
                    author: '',
                    rating: 5,
                    text: '',
                    date: new Date().toISOString()
                }
            };
        },
        computed: {
            sortedReviews() {
                return [...this.reviews].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
            },
            isReviewValid() {
                return this.newReview.author.trim() && 
                       this.newReview.text.trim() && 
                       this.newReview.rating > 0;
            }
        },
        mounted() {
            this.loadReviews();
        },
        methods: {
            loadReviews() {
                const savedReviews = JSON.parse(localStorage.getItem('productReviews')) || [];
                this.reviews = savedReviews;
            },
            saveReviews() {
                localStorage.setItem('productReviews', JSON.stringify(this.reviews));
            },
            setRating(rating) {
                this.newReview.rating = rating;
            },
            addReview() {
                if (!this.isReviewValid) {
                    alert('Пожалуйста, заполните все поля правильно.');
                    return;
                }
                
                const review = {
                    id: Date.now(),
                    ...this.newReview,
                    date: new Date().toISOString()
                };
                
                this.reviews.unshift(review);
                this.saveReviews();
                
                // Сбрасываем форму
                this.newReview = {
                    author: '',
                    rating: 5,
                    text: '',
                    date: new Date().toISOString()
                };
                
                alert('Спасибо за ваш отзыв!');
            },
            formatDate(dateString) {
                const date = new Date(dateString);
                return date.toLocaleDateString('ru-RU');
            }
        }
    });

    // Инициализация Vue приложения
    if (document.getElementById('product-reviews-app')) {
        new Vue({
            el: '#product-reviews-app'
        });
    }
});