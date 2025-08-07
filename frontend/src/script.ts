import { renderPage } from "./router";

export const app = document.querySelector('#app') as HTMLElement;

(window as any).completed = [];

renderPage('start');
