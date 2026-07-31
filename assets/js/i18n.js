let translations = {};
let currentLanguage = "uk";

const FALLBACK_TRANSLATIONS = {};

export async function initLanguage() {
    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage === "uk" || savedLanguage === "en") {
        currentLanguage = savedLanguage;
    } else {
        const browserLanguage = navigator.language?.substring(0, 2);
        currentLanguage = browserLanguage === "en" ? "en" : "uk";
    }

    await loadTranslations();
}

async function loadTranslations() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch("data/translations.json", {
            cache: "no-store",
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`translations.json: HTTP ${response.status}`);
        }

        const data = await response.json();
        translations = data && typeof data === "object"
            ? data
            : FALLBACK_TRANSLATIONS;
    } catch (error) {
        console.warn("Translations unavailable; using built-in labels:", error);
        translations = FALLBACK_TRANSLATIONS;
    } finally {
        window.clearTimeout(timeout);
    }
}

export function changeLanguage(language) {
    currentLanguage = language === "en" ? "en" : "uk";
    localStorage.setItem("language", currentLanguage);
    translatePage();
}

export function translatePage() {
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const value = translations[element.dataset.i18n]?.[currentLanguage];
        if (value) element.textContent = value;
    });
}

export function t(key) {
    return translations[key]?.[currentLanguage] || key;
}

export function getLanguage() {
    return currentLanguage;
}
