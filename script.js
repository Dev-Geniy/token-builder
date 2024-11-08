// Функция для открытия модального окна
function showPaymentModal() {
    const paymentModal = document.getElementById("paymentModal");
    paymentModal.classList.remove("hidden"); // Убираем класс, который скрывает окно
}

// Функция для закрытия модального окна
function hidePaymentModal() {
    const paymentModal = document.getElementById("paymentModal");
    paymentModal.classList.add("hidden"); // Добавляем класс для скрытия окна
}

// Функция для копирования адреса Bitcoin
function copyBtcAddress() {
    const btcAddress = document.getElementById("btcPaymentAddress").innerText;
    navigator.clipboard.writeText(btcAddress).then(() => {
        alert("Адрес скопирован в буфер обмена!");
    }).catch(err => {
        console.error("Ошибка копирования: ", err);
    });
}

// Обработчик кнопки "Начать" на главной странице
document.getElementById("start-button").addEventListener("click", function() {
    window.location.href = "https://dev-geniy.github.io/token-builder/builder"; // Перенаправление на страницу конструктора
});

const logoTrack = document.querySelector('.logo-track');
const logos = document.querySelectorAll('.logo-item');

// Дублируем логотипы для создания эффекта
for (let i = 0; i < logos.length; i++) {
    const clonedLogo = logos[i].cloneNode(true);
    logoTrack.appendChild(clonedLogo);
}

// Устанавливаем длительность анимации в зависимости от количества логотипов
const animationDuration = 20; // Время в секундах для полной анимации
logoTrack.style.animationDuration = `${animationDuration}s`; // Устанавливаем длительность анимации
