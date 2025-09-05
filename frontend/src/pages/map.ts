import { renderPage } from "../router";
import { tg } from '../telegram-web-app';

function handleBack() {
    renderPage("start");
}

export default async function MapPage() {
    tg.BackButton.onClick(handleBack).show();
}
