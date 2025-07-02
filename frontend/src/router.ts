import StartPage from "./pages/start";
import EndPage from "./pages/end";
import FormPage from "./pages/form";

import { app } from "./script";

export function renderPage(page: 'start' | 'form' | 'end') {
    const pages = {
        'start': StartPage,
        'form': FormPage,
        'end': EndPage
    }
    app.innerHTML = ''
    app.appendChild(pages[page]())
}


