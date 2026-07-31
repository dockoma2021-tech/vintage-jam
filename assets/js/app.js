import { initLanguage, changeLanguage, getLanguage } from "./i18n.js?v=1.2.3";
import { initCatalog, searchProducts, setSort } from "./catalog.js?v=1.2.3";

const STARTUP_TIMEOUT_MS = 12000;

async function withTimeout(promise, milliseconds, label) {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error(`${label}: timeout`)), milliseconds);
    });
    try {
        return await Promise.race([promise, timeout]);
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function startApp() {
    setStartupState("loading");

    try {
        initLanguage();
        await withTimeout(initCatalog(getLanguage()), STARTUP_TIMEOUT_MS, "Catalog startup");

        setupLanguageSwitcher();
        setupSearch();
        setupSort();
        setupMobileNavigation();
        updateStaticLabels(getLanguage());
        setStartupState("ready");

        // Contacts are optional and must never hold the catalog screen.
        setupContactLink().catch(error => console.warn("Contact setup failed:", error));
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
    message.textContent = "Не вдалося завантажити каталог. Натисніть «Повторити».";
    message.style.margin = "0 0 12px";
    const detail = document.createElement("small");
    detail.textContent = error?.message || "Невідома помилка";
    detail.style.cssText = "display:block;margin-bottom:12px;color:#6e6e73";
    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Повторити";
    retry.addEventListener("click", () => {
        const url = new URL(window.location.href);
        url.searchParams.set("reload", Date.now().toString());
        window.location.replace(url);
    });
    element.append(message, detail, retry);
}

function setupSearch() {
    document.getElementById("searchInput")?.addEventListener("input", event => searchProducts(event.target.value));
}

function setupSort() {
    document.getElementById("sortSelect")?.addEventListener("change", event => setSort(event.target.value));
}

function setupLanguageSwitcher() {
    const button = document.getElementById("languageSwitcher");
    if (!button) return;
    updateLanguageButton(button);
    button.addEventListener("click", async () => {
        const newLanguage = getLanguage() === "uk" ? "en" : "uk";
        changeLanguage(newLanguage);
        try {
            await withTimeout(initCatalog(newLanguage), STARTUP_TIMEOUT_MS, "Language catalog refresh");
        } catch (error) {
            setStartupState("error", error);
            return;
        }
        updateLanguageButton(button);
        updateStaticLabels(newLanguage);
    });
}

function setupMobileNavigation() {
    document.getElementById("mobileCatalogButton")?.addEventListener("click", () => {
        document.getElementById("catalogSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    document.getElementById("mobileSearchButton")?.addEventListener("click", () => {
        const input = document.getElementById("searchInput");
        input?.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => input?.focus(), 300);
    });
}

async function setupContactLink() {
    const contactButton = document.getElementById("mobileContactButton");
    if (!contactButton) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    try {
        const response = await fetch(`data/settings.json?v=1.2.3`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const settings = await response.json();
        const telegram = settings?.contacts?.telegram?.trim();
        const phone = settings?.contacts?.phone?.trim();
        if (telegram) {
            contactButton.href = telegram;
            contactButton.target = "_blank";
            contactButton.rel = "noopener noreferrer";
        } else if (phone) {
            contactButton.href = `tel:${phone.replace(/[^+\d]/g, "")}`;
        }
    } finally {
        window.clearTimeout(timeout);
    }
}

function updateLanguageButton(button) {
    const language = getLanguage();
    button.textContent = language.toUpperCase();
    button.setAttribute("aria-label", language === "uk" ? "Переключити мову" : "Switch language");
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
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateSortLabels(language) {
    const select = document.getElementById("sortSelect");
    if (!select) return;
    const labels = language === "uk"
        ? { new: "Нові спочатку", old: "Старі спочатку", price_up: "Ціна: від нижчої", price_down: "Ціна: від вищої" }
        : { new: "Newest first", old: "Oldest first", price_up: "Price: low to high", price_down: "Price: high to low" };
    Array.from(select.options).forEach(option => {
        if (labels[option.value]) option.textContent = labels[option.value];
    });
}

startApp();
