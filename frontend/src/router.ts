import StartPage from "./pages/start";
import CategoriesPage from "./pages/categories";
import ItemsPage from "./pages/items";

import { app } from "./script";

export type Page = 'start' | 'categories' | 'items'
type Category = string | undefined

export async function renderPage(page: Page, category?: Category) {
    const pages = {
        'start': StartPage,
        'categories': CategoriesPage,
        'items': () => ItemsPage(category!),
    }
    app.innerHTML = ''
    app.appendChild(await pages[page]())
}


