import { getLanguage } from "./i18n.js";

const copy = {
    uk: {
        title: "Доставка та умови покупки",
        intro: "Надсилаємо колекційні та вінтажні предмети з Одеси по Україні й за кордон.",
        locationTitle: "Відправлення з Одеси",
        locationText: "Усі товари відправляються з Одеси, Україна.",
        carriersTitle: "Способи доставки",
        carriersText: "Нова пошта, Укрпошта та доступні міжнародні поштові служби.",
        calculationTitle: "Вартість і строки",
        calculationText: "Розраховуються окремо залежно від країни, габаритів і обраної служби.",
        packingTitle: "Надійне пакування",
        packingText: "Крихкі та колекційні предмети пакуються з урахуванням їхніх особливостей.",
        photoTitle: "Саме цей предмет",
        photoText: "Ви отримаєте саме той предмет, який показаний на фотографіях.",
        note: "Деталі доставки та остаточна вартість узгоджуються до оплати."
    },
    en: {
        title: "Shipping and purchase terms",
        intro: "We ship collectible and vintage items from Odesa across Ukraine and internationally.",
        locationTitle: "Shipping from Odesa",
        locationText: "All items are dispatched from Odesa, Ukraine.",
        carriersTitle: "Delivery services",
        carriersText: "Nova Poshta, Ukrposhta and available international postal services.",
        calculationTitle: "Cost and delivery time",
        calculationText: "Calculated separately based on destination, parcel size and selected carrier.",
        packingTitle: "Secure packaging",
        packingText: "Fragile and collectible items are packed according to their specific requirements.",
        photoTitle: "The exact item shown",
        photoText: "You will receive the exact item shown in the photographs.",
        note: "Shipping details and the final delivery cost are confirmed before payment."
    }
};

function renderShippingSection(section, settings) {
    const lang = getLanguage();
    const text = copy[lang] || copy.uk;
    const shipping = settings?.shipping;

    if (shipping?.enabled === false) {
        section.hidden = true;
        return;
    }

    const fields = {
        "[data-shipping-title]": text.title,
        "[data-shipping-intro]": text.intro,
        "[data-shipping-location-title]": text.locationTitle,
        "[data-shipping-location-text]": text.locationText,
        "[data-shipping-carriers-title]": text.carriersTitle,
        "[data-shipping-carriers-text]": text.carriersText,
        "[data-shipping-calculation-title]": text.calculationTitle,
        "[data-shipping-calculation-text]": text.calculationText,
        "[data-shipping-packing-title]": text.packingTitle,
        "[data-shipping-packing-text]": text.packingText,
        "[data-shipping-photo-title]": text.photoTitle,
        "[data-shipping-photo-text]": text.photoText,
        "[data-shipping-note]": text.note
    };

    Object.entries(fields).forEach(([selector, value]) => {
        const element = section.querySelector(selector);
        if (element) element.textContent = value;
    });

    section.hidden = false;
}

async function initShippingInfo() {
    const sections = document.querySelectorAll("[data-shipping-section]");
    if (!sections.length) return;

    try {
        const response = await fetch("data/settings.json");
        if (!response.ok) throw new Error(`settings.json: ${response.status}`);
        const settings = await response.json();

        const renderAll = () => sections.forEach(section => renderShippingSection(section, settings));
        renderAll();

        document.getElementById("languageSwitcher")?.addEventListener("click", () => {
            window.setTimeout(renderAll, 0);
        });
    } catch (error) {
        console.error("Shipping information error:", error);
        sections.forEach(section => { section.hidden = true; });
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initShippingInfo, { once: true });
} else {
    initShippingInfo();
}
