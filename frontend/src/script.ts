import StartPage from "./pages/start";
import EndPage from "./pages/end";

function renderPage(page: string) {
    if (app) {
        app.innerHTML = page === 'start' ? StartPage() : EndPage()
    }
}


const tg = (window as any).Telegram.WebApp;

const app = document.querySelector('#app')

renderPage('start')


const fBtn = document.querySelector(".f-btn") as HTMLButtonElement
const sBtn = document.querySelector(".s-btn") as HTMLButtonElement

const mainElement = document.querySelector(".Main") as HTMLDivElement
const testFormElement = document.querySelector(".test-form") as HTMLFormElement

fBtn.addEventListener("click", () => {
    mainElement.style.display = 'none'
    testFormElement.style.display = "block"
});

sBtn.addEventListener("click", () => {
    const title = document.querySelector(".title-inp") as HTMLInputElement;
    const description = document.querySelector(".desc-inp") as HTMLInputElement;
    const text = document.querySelector(".text-inp") as HTMLInputElement;

    const data = {
        title: title.value,
        desc: description.value,
        text: text.value
    }

    tg.sendData(JSON.stringify(data));
    renderPage('end')
});
