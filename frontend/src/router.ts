import { tg } from "./telegram-web-app";

import StartPage from "./pages/start";
import CategoriesPage from "./pages/categories";
import ItemsPage from "./pages/items";
import LotteryPage from "./pages/lottery";
import MapPage from "./pages/map";
import NotSupportedPage from "./pages/not-supported";

import { useCredentialsStore } from "./store/credentials";
import { useLotteryStore } from "./store/lottery";
import { usePuzzleStore } from "./store/puzzle";

export type Page =
    | "start"
    | "categories"
    | "items"
    | "lottery"
    | "map"
    | "not-supported";
type Category = string | undefined;

function isMiniAppSupported(): boolean {
    try {
        const anyTg = tg as any;

        const hasIsVersionAtLeast = typeof anyTg?.isVersionAtLeast === "function";
        const versionOk = hasIsVersionAtLeast
            ? anyTg.isVersionAtLeast("7.10")
            : false;

        const hasMain =
            typeof anyTg?.MainButton?.setParams === "function" &&
            typeof anyTg?.MainButton?.onClick === "function";

        const hasSecondary =
            typeof anyTg?.SecondaryButton?.setParams === "function" &&
            typeof anyTg?.SecondaryButton?.onClick === "function";

        const hasCloudStorage =
            typeof anyTg?.CloudStorage?.getItem === "function" &&
            typeof anyTg?.CloudStorage?.setItem === "function" &&
            typeof anyTg?.CloudStorage?.removeItem === "function";

        return Boolean(versionOk && hasMain && hasSecondary && hasCloudStorage);
    } catch {
        return false;
    }
}

export async function renderPage(page: Page, category?: Category) {
    const pages = {
        start: { pageFn: StartPage, templateId: "start" },
        categories: { pageFn: CategoriesPage, templateId: "categories" },
        items: { pageFn: () => ItemsPage(category!), templateId: "items" },
        lottery: { pageFn: LotteryPage, templateId: "lottery" },
        map: { pageFn: MapPage, templateId: "map" },
        "not-supported": { pageFn: NotSupportedPage, templateId: "not-supported" },
    } as const;

    const { pageFn, templateId } = pages[page];

    const app = document.querySelector("#app") as HTMLElement;
    const pageTemplate = document.querySelector(
        `template#${templateId}`
    ) as HTMLTemplateElement;

    tg.MainButton.hide()
        .disable()
        .offClick(() => { });
    tg.SecondaryButton.hide()
        .disable()
        .offClick(() => { });
    tg.BackButton.offClick(() => { }).hide();

    app.innerHTML = "";
    app.appendChild(pageTemplate.content.cloneNode(true));

    await pageFn();
}

(async () => {
    if (!isMiniAppSupported()) {
        await renderPage("not-supported");
        return;
    }

    await Promise.all([
        usePuzzleStore.persist.rehydrate(),
        useLotteryStore.persist.rehydrate(),
        useCredentialsStore.persist.rehydrate(),
    ]);

    await renderPage("start");
})();
