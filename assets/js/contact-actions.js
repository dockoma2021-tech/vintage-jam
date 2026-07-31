import { getLanguage } from "./i18n.js";

const copy = {
    uk: {
        title: "Зв’язатися щодо товару",
        subtitle: "Оберіть зручний спосіб зв’язку",
        telegram: "Telegram",
        viber: "Viber",
        whatsapp: "WhatsApp",
        phone: "Зателефонувати",
        email: "Email",
        share: "Поділитися товаром",
        copy: "Скопіювати посилання",
        copied: "Посилання скопійовано",
        close: "Закрити",
        availableMessage: title => `Добрий день! Мене цікавить товар: ${title}.`,
        soldMessage: title => `Добрий день! Товар «${title}» уже продано. Чи є у вас схожі предмети?`
    },
    en: {
        title: "Contact about this item",
        subtitle: "Choose a convenient contact method",
        telegram: "Telegram",
        viber: "Viber",
        whatsapp: "WhatsApp",
        phone: "Call",
        email: "Email",
        share: "Share item",
        copy: "Copy link",
        copied: "Link copied",
        close: "Close",
        availableMessage: title => `Hello! I am interested in this item: ${title}.`,
        soldMessage: title => `Hello! The item “${title}” has been sold. Do you have anything similar?`
    }
};

let product;
let settings;
let lastFocusedElement;

const byId = id => document.getElementById(id);
const localized = value => {
    const lang = getLanguage();
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value[lang] ?? value.uk ?? value.en ?? "";
    }
    return value ?? "";
};

async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
}

function normalizePhone(phone = "") {
    return phone.replace(/[^\d+]/g, "");
}

function buildMessage() {
    const lang = getLanguage();
    const title = localized(product?.title);
    const text = product?.sale_status === "sold"
        ? copy[lang].soldMessage(title)
        : copy[lang].availableMessage(title);
    return `${text}\nID: ${product?.id}\n${window.location.href}`;
}

function setActionLink(id, href, visible = true) {
    const element = byId(id);
    if (!element) return;
    element.hidden = !visible;
    if (visible) element.href = href;
}

function renderContactSheet() {
    if (!product || !settings) return;

    const lang = getLanguage();
    const text = copy[lang];
    const message = buildMessage();
    const encodedMessage = encodeURIComponent(message);
    const encodedSubject = encodeURIComponent(`${localized(product.title)} — Vintage Jam`);
    const contacts = settings.contacts || {};

    byId("contactSheetTitle").textContent = text.title;
    byId("contactSheetSubtitle").textContent = text.subtitle;
    byId("contactTelegramText").textContent = text.telegram;
    byId("contactViberText").textContent = text.viber;
    byId("contactWhatsappText").textContent = text.whatsapp;
    byId("contactPhoneText").textContent = text.phone;
    byId("contactEmailText").textContent = text.email;
    byId("shareProductText").textContent = text.share;
    byId("copyProductLinkText").textContent = text.copy;
    byId("contactSheetClose").setAttribute("aria-label", text.close);

    setActionLink("contactTelegram", contacts.telegram ? `${contacts.telegram}${contacts.telegram.includes("?") ? "&" : "?"}text=${encodedMessage}` : "", Boolean(contacts.telegram));
    setActionLink("contactViber", contacts.viber ? `${contacts.viber}${contacts.viber.includes("?") ? "&" : "?"}text=${encodedMessage}` : "", Boolean(contacts.viber));
    setActionLink("contactWhatsapp", contacts.whatsapp ? `${contacts.whatsapp}${contacts.whatsapp.includes("?") ? "&" : "?"}text=${encodedMessage}` : "", Boolean(contacts.whatsapp));
    setActionLink("contactPhone", contacts.phone ? `tel:${normalizePhone(contacts.phone)}` : "", Boolean(contacts.phone));
    setActionLink("contactEmail", contacts.email ? `mailto:${contacts.email}?subject=${encodedSubject}&body=${encodedMessage}` : "", Boolean(contacts.email));

    const hasDirectContacts = ["contactTelegram", "contactViber", "contactWhatsapp", "contactPhone", "contactEmail"]
        .some(id => !byId(id)?.hidden);
    byId("contactMethods").hidden = !hasDirectContacts;
}

function openSheet() {
    const sheet = byId("contactSheet");
    if (!sheet) return;
    lastFocusedElement = document.activeElement;
    renderContactSheet();
    sheet.hidden = false;
    document.body.classList.add("contact-sheet-open");
    byId("contactSheetClose")?.focus();
}

function closeSheet() {
    const sheet = byId("contactSheet");
    if (!sheet || sheet.hidden) return;
    sheet.hidden = true;
    document.body.classList.remove("contact-sheet-open");
    lastFocusedElement?.focus?.();
}

async function shareProduct() {
    const lang = getLanguage();
    const shareData = {
        title: `${localized(product.title)} — Vintage Jam`,
        text: buildMessage(),
        url: window.location.href
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (error) {
            if (error.name === "AbortError") return;
        }
    }

    await copyLink(copy[lang].copied);
}

async function copyLink(successText) {
    try {
        await navigator.clipboard.writeText(window.location.href);
    } catch {
        const input = document.createElement("textarea");
        input.value = window.location.href;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
    }

    const toast = byId("contactToast");
    toast.textContent = successText;
    toast.hidden = false;
    window.clearTimeout(Number(toast.dataset.timeout));
    toast.dataset.timeout = String(window.setTimeout(() => { toast.hidden = true; }, 2200));
}

function bindEvents() {
    byId("contactButton")?.addEventListener("click", openSheet);
    byId("contactSheetClose")?.addEventListener("click", closeSheet);
    byId("contactSheetBackdrop")?.addEventListener("click", closeSheet);
    byId("shareProduct")?.addEventListener("click", shareProduct);
    byId("copyProductLink")?.addEventListener("click", () => copyLink(copy[getLanguage()].copied));
    byId("languageSwitcher")?.addEventListener("click", () => window.setTimeout(renderContactSheet));

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !byId("contactSheet")?.hidden) closeSheet();
    });
}

async function init() {
    try {
        const id = new URLSearchParams(window.location.search).get("id");
        const [products, loadedSettings] = await Promise.all([
            fetchJson("data/products.json"),
            fetchJson("data/settings.json")
        ]);
        product = products.find(item => item.id === id && item.publication_status === "published");
        settings = loadedSettings;
        if (!product) return;

        const button = byId("contactButton");
        button.hidden = false;
        button.removeAttribute("href");
        button.removeAttribute("target");
        button.removeAttribute("rel");
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openSheet();
            }
        });

        bindEvents();
        renderContactSheet();
    } catch (error) {
        console.error("Contact actions error:", error);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
