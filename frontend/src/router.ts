import StartPage from "./pages/start";
import CategoriesPage from "./pages/categories";
import ItemsPage from "./pages/items";

export type Page = 'start' | 'categories' | 'items'
type Category = string | undefined

export async function renderPage(page: Page, category?: Category) {
    const pages = {
        'start': {
            pageFn: StartPage,
            templateId: "start"
        },
        'categories': {
            pageFn: CategoriesPage,
            templateId: "categories"
        },
        'items': {
            pageFn: () => ItemsPage(category!),
            templateId: "items"
        },
    }

    const { pageFn, templateId } = pages[page]

    const app = document.querySelector('#app') as HTMLElement;
    const pageTemplate = document.querySelector(`template#${templateId}`) as HTMLTemplateElement

    app.innerHTML = ''
    app.appendChild(pageTemplate.content.cloneNode(true))

    await pageFn()
}

await renderPage("categories");

