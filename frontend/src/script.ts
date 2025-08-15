import { renderPage } from "./router";

export const app = document.querySelector('#app') as HTMLElement;

await renderPage('start');
