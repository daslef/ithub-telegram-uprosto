import StartPage from "./pages/start";
import EndPage from "./pages/end";
import FormPage from "./pages/form";

import { app } from "./script";

type Page = 'start' | 'form' | 'end'
type Category =  string | undefined

export function renderPage(page: Page, category?: Category) {
    const pages = {
        'start': StartPage,
        'form': () => FormPage(category!),
        'end': EndPage
    }
    app.innerHTML = ''
    app.appendChild(pages[page]())
}


