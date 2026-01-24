$(function(){
    console.log("Ajax подключен");
    
    // Демонстрация AJAX запроса
    function loadCoursesFromServer() {
        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'GET',
            success: function(data) {
                console.log('Данные загружены с сервера:', data.slice(0, 3));
            },
            error: function(error) {
                console.error('Ошибка загрузки данных:', error);
            }
        });
    }
    
    // Имитация загрузки данных при инициализации
    setTimeout(loadCoursesFromServer, 2000);
    
    // Пример отправки формы через AJAX
    window.sendTestResult = function(testData) {
        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'POST',
            data: JSON.stringify(testData),
            contentType: 'application/json',
            success: function(response) {
                console.log('Результат теста отправлен:', response);
                alert('Результат теста сохранен!');
            },
            error: function(error) {
                console.error('Ошибка отправки:', error);
            }
        });
    };
    
    // Отправка данных о завершении курса
    window.sendCourseCompletion = function(courseData) {
        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/posts',
            method: 'POST',
            data: JSON.stringify(courseData),
            contentType: 'application/json',
            success: function(response) {
                console.log('Курс завершен:', response);
            },
            error: function(error) {
                console.error('Ошибка отправки:', error);
            }
        });
    };
});