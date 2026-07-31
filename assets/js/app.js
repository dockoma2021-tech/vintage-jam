import {
    initLanguage,
    changeLanguage,
    getLanguage
} from "./i18n.js";

import {
    initCatalog,
    searchProducts,
    setSort
} from "./catalog.js";

async function startApp() {
    setStartupState("loading");

    try {
        await initLanguage();
        await initCatalog(getLanguage());

        setupLanguageSwitcher();
        setupSearch();
        setupSort();
        setupMobileNavigation();
        await setupContactLink();
        updateStaticLabels(getLanguage());
        setStartupState("ready");
    } catch (error) {
        console.error("Ошибка запуска приложения:", error);
        setStartupState("error", error);
    }
}

function setStartupState(state, error = null) {
    let element = document.getElementById("startupState");

    if (!element) {
        element = document.createElement("section");
        element.id = "startupState";
        element.setAttribute("aria-live", "polite");
        element.style.cssText = "margin:16px;padding:16px;border-radius:14px;background:#f5f5f7;text-align:center";
        document.getElementById("mainContent")?.prepend(element);
    }

    if (state === "ready") {
        element.remove();
        return;
    }

    if (state === "loading") {
        element.textContent = "Завантаження каталогу…";
        return;
    }

    element.replaceChildren();
    const message = document.createElement("p");
    message.textContent = "Не вдалося завантажити каталог. Перевірте з’єднання та спробуйте ще раз.";
    message.style.margin = "0 0 12px";

    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Повторити";
    retry.addEventListener("click", () => window.location.reload());

    element.append(message, retry);
    if (error) element.dataset.error = String(error.message || error);
}

function setupSearch() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    input.addEventListener("input", event => {
        searchProducts(event.target.value);
    });
}

function setupSort() {
    const select = document.getElementById("sortSelect");
    if (!select) return;

    select.addEventListener("change", event => {
        setSort(event.target.value);
    });
}

function setupLanguageSwitcher() {
    const button = document.getElementById("languageSwitcher");
    if (!button) return;

    updateLanguageButton(button);

    button.addEventListener("click", async () => {
        const newLanguage = getLanguage() === "uk" ? "en" : "uk";

        changeLanguage(newLanguage);
        await initCatalog(newLanguage);
        updateLanguageButton(button);
        updateStaticLabels(newLanguage);
    });
}

function setupMobileNavigation() {
    const catalogButton = document.getElementById("mobileCatalogButton");
    const searchButton = document.getElementById("mobileSearchButton");

    catalogButton?.addEventListener("click", () => {
        document.getElementById("catalogSection")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    searchButton?.addEventListener("click", () => {
        const input = document.getElementById("searchInput");
        input?.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => input?.focus(), 300);
    });
}

async function setupContactLink() {
    const contactButton = document.getElementById("mobileContactButton");
    if (!contactButton) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch("data/settings.json", {
            cache: "no-store",
            signal: controller.signal
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const settings = await response.json();
        const telegram = settings?.contacts?.telegram?.trim();
        const phone = settings?.contacts?.phone?.trim();

        if (telegram) {
            contactButton.href = telegram;
            contactButton.target = "_blank";
            contactButton.rel = "noopener noreferrer";
            return;
        }

        if (phone) {
            contactButton.href = `tel:${phone.replace(/[^+\d]/g, "")}`;
        }
    } catch (error) {
        console.warn("Не удалось загрузить контакты:", error);
    } finally {
        window.clearTimeout(timeout);
    }
}

function updateLanguageButton(button) {
    const language = getLanguage();
    button.textContent = language.toUpperCase();
    button.setAttribute(
        "aria-label",
        language === "uk" ? "Переключити мову" : "Switch language"
    );
    document.documentElement.lang = language;
}

function updateStaticLabels(language) {
    const uk = language === "uk";
    const labels = {
        searchPlaceholder: uk ? "Пошук..." : "Search...",
        searchLabel: uk ? "Пошук товарів" : "Search products",
        sortLabel: uk ? "Сортування" : "Sorting",
        categories: uk ? "Категорії" : "Categories",
        arrivals: uk ? "Нові надходження" : "New arrivals",
        catalog: uk ? "Каталог" : "Catalog",
        sold: uk ? "Продано" : "Sold",
        mobileCatalog: uk ? "Каталог" : "Catalog",
        mobileSearch: uk ? "Пошук" : "Search",
        mobileContact: uk ? "Зв’язок" : "Contact"
    };

    const input = document.getElementById("searchInput");
    if (input) {
        input.placeholder = labels.searchPlaceholder;
        input.setAttribute("aria-label", labels.searchLabel);
    }

    document.getElementById("sortSelect")?.setAttribute("aria-label", labels.sortLabel);

    setText("categoriesHeading", labels.categories);
    setText("newArrivalsHeading", labels.arrivals);
    setText("catalogHeading", labels.catalog);
    setText("soldHeading", labels.sold);
    setText("mobileCatalogLabel", labels.mobileCatalog);
    setText("mobileSearchLabel", labels.mobileSearch);
    setText("mobileContactLabel", labels.mobileContact);

    updateSortLabels(language);

    document.getElementById("mobileCatalogButton")?.setAttribute(
        "aria-label",
        uk ? "Перейти до каталогу" : "Go to catalog"
    );
    document.getElementById("mobileSearchButton")?.setAttribute(
        "aria-label",
        uk ? "Відкрити пошук" : "Open search"
    );
    document.getElementById("mobileContactButton")?.setAttribute(
        "aria-label",
        uk ? "Зв’язатися з Vintage Jam" : "Contact Vintage Jam"
    );
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateSortLabels(language) {
    const select = document.getElementById("sortSelect");
    if (!select) return;

    const labels = language === "uk"
        ? {
            new: "Нові спочатку",
            old: "Старі спочатку",
            price_up: "Ціна: від нижчої",
            price_down: "Ціна: від вищої"
        }
        : {
            new: "Newest first",
            old: "Oldest first",
            price_up: "Price: low to high",
            price_down: "Price: high to low"
        };

    Array.from(select.options).forEach(option => {
        if (labels[option.value]) option.textContent = labels[option.value];
    });
}

startApp();
