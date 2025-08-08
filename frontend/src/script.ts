import { renderPage } from "./router";

export const app = document.querySelector('#app') as HTMLElement;

(window as any).completed = ["category_1", "category_2", "category_3", "category_5", "category_7", "category_8", "category_9"];

renderPage('start');
