export default function StartPage() {
    return `<div class="Main">
        <h1>Тестовое приложение</h1>
        <img src="./src/assets/closeup-shot-sheep.avif" alt="sheep photo" class="main-image">
        <p></p>
        <button class="btn f-btn">Тест отправки данных</button>
    </div>
    <form class="test-form">
        <input type="text" placeholder="Введите заголовок" class="title-inp">
        <input type="text" placeholder="Введите описание" class="desc-inp">
        <input type="text" placeholder="Введите текст" class="text-inp">
        <button class="btn s-btn">Отправить</button>
    </form>`
}