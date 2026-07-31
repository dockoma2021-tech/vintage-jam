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
    try {
        await initLanguage();
        await initCatalog(getLanguage());

        setupLanguageSwitcher();
        setupSearch();
        setupSort();
    } catch (error) {
        console.error("Ошибка запуска приложения:", error);
    }
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
        updateSearchPlaceholder(newLanguage);
        updateSortLabels(newLanguage);
    });
}

function updateLanguageButton(button) {
    button.textContent = getLanguage().toUpperCase();
    button.setAttribute(
        "aria-label",
        getLanguage() === "uk" ? "Переключити мову" : "Switch language"
    );
}

function updateSearchPlaceholder(language) {
    const input = document.getElementById("searchInput");
    if (!input) return;

    input.placeholder = language === "uk" ? "Пошук..." : "Search...";
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
        if (labels[option.value]) {
            option.textContent = labels[option.value];
        }
    });
}

startApp();
