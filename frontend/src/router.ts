import StartPage from "./pages/start";
import CategoriesPage from "./pages/categories";
import ItemsPage from "./pages/items";
import EndPage from "./pages/end";

import { app } from "./script";

export type Page = 'start' | 'categories' | 'items' | 'end'
type Category = string | undefined

export function renderPage(page: Page, category?: Category) {
    const pages = {
        'start': StartPage,
        'categories': CategoriesPage,
        'items': () => ItemsPage(category!),
        'end': EndPage
    }
    app.innerHTML = ''
    app.appendChild(pages[page]())
}


