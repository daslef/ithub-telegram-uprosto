import { renderPage } from "../router";
import { tg } from "../telegram-web-app";

function showSelection() {
    const selection = document.querySelector(".map-select") as HTMLElement | null;
    const map = document.querySelector(".map-page") as HTMLElement | null;

    if (selection) selection.classList.remove("hidden");
    if (map) map.classList.add("hidden");

    tg.BackButton.offClick(() => { })
        .onClick(() => renderPage("start"))
        .show();

    tg.SecondaryButton.hide()
        .disable()
        .offClick(() => { });
}

function showMap(url: string) {
    const selection = document.querySelector(".map-select") as HTMLElement | null;
    const map = document.querySelector(".map-page") as HTMLElement | null;
    const iframe = document.querySelector(
        ".map-iframe"
    ) as HTMLIFrameElement | null;

    if (!map || !iframe) return;

    if (selection) selection.classList.add("hidden");
    map.classList.remove("hidden");
    iframe.src = url;

    tg.BackButton.offClick(() => { })
        .onClick(() => {
            if (iframe) iframe.src = "";
            showSelection();
        })
        .show();

    tg.SecondaryButton.setParams({
        text: "Выбрать другой день",
        color: "#FF9448",
        text_color: "#ffffff",
        is_active: true,
        is_visible: true,
        position: "bottom",
    })
        .onClick(() => {
            if (iframe) iframe.src = "";
            showSelection();
        })
        .show()
        .enable();
}

export default async function MapPage() {
    const btn609 = document.getElementById(
        "btn-map-609"
    ) as HTMLButtonElement | null;
    const btn709 = document.getElementById(
        "btn-map-709"
    ) as HTMLButtonElement | null;

    btn609?.addEventListener(
        "click",
        () => {
            const url = btn609.dataset.url || "";
            if (url) showMap(url);
        },
        { once: false }
    );

    btn709?.addEventListener(
        "click",
        () => {
            const url = btn709.dataset.url || "";
            if (url) showMap(url);
        },
        { once: false }
    );

    showSelection();
}
