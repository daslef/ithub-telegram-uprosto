const tg = (window as any).Telegram.WebApp;

const fBtn = document.getElementsByClassName("f-btn")[0]
const sBtn = document.getElementsByClassName("s-btn")[0]

const mainElement = document.querySelector(".Main") as HTMLDivElement
const testFormElement = document.querySelector(".test-form") as HTMLFormElement

fBtn.addEventListener("click", () => {
    mainElement.style.display = 'none'
    testFormElement.style.display = "block"
});

sBtn.addEventListener("click", () => {
    const title = document.querySelector(".title-inp") as HTMLInputElement;
    const description = document.querySelector("desc-inp") as HTMLInputElement;
    const text = document.querySelector("text-inp") as HTMLInputElement;

    const data = {
        title: title.value,
        desc: description.value,
        text: text.value
    }

    tg.sendData(JSON.stringify(data));
});
