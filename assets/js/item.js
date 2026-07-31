import { changeLanguage, getLanguage, initLanguage } from "./i18n.js";

const FALLBACK_IMAGE = "assets/images/no-image.webp";

const copy = {
    uk: {
        loading: "Завантаження товару…",
        notFound: "Товар не знайдено.",
        loadError: "Не вдалося завантажити товар. Спробуйте оновити сторінку.",
        back: "← До каталогу",
        catalog: "Каталог",
        search: "Пошук",
        description: "Опис",
        attributes: "Характеристики",
        story: "Історія предмета",
        contact: "Зв’язатися",
        video: "▶ Відеоогляд",
        shorts: "🎬 Shorts",
        requestPrice: "Ціна за запитом",
        available: "В наявності",
        reserved: "Зарезервовано",
        sold: "Продано",
        category: "Категорія",
        attr: {
            brand: "Бренд",
            model: "Модель",
            year: "Рік",
            country: "Країна",
            movement: "Механізм"
        }
    },
    en: {
        loading: "Loading product…",
        notFound: "Product not found.",
        loadError: "Could not load the product. Please refresh the page.",
        back: "← Back to catalog",
        catalog: "Catalog",
        search: "Search",
        description: "Description",
        attributes: "Specifications",
        story: "Item story",
        contact: "Contact us",
        video: "▶ Video review",
        shorts: "🎬 Shorts",
        requestPrice: "Price on request",
        available: "Available",
        reserved: "Reserved",
        sold: "Sold",
        category: "Category",
        attr: {
            brand: "Brand",
            model: "Model",
            year: "Year",
            country: "Country",
            movement: "Movement"
        }
    }
};

let product = null;
let settings = null;
let categories = [];
let activeImageIndex = 0;

const byId = id => document.getElementById(id);
const localized = (value, lang) => {
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

async function init() {
    await initLanguage();
    bindLanguageSwitcher();

    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) {
        showState(copy[getLanguage()].notFound);
        return;
    }

    try {
        const [products, loadedSettings, loadedCategories] = await Promise.all([
            fetchJson("data/products.json"),
            fetchJson("data/settings.json"),
            fetchJson("data/categories.json")
        ]);

        product = products.find(item => item.id === id && item.publication_status === "published");
        settings = loadedSettings;
        categories = loadedCategories;

        if (!product) {
            showState(copy[getLanguage()].notFound);
            return;
        }

        renderProduct();
    } catch (error) {
        console.error("Product page error:", error);
        showState(copy[getLanguage()].loadError);
    }
}

function bindLanguageSwitcher() {
    const switcher = byId("languageSwitcher");
    if (!switcher) return;

    updateLanguageButton();
    switcher.addEventListener("click", () => {
        changeLanguage(getLanguage() === "uk" ? "en" : "uk");
        updateLanguageButton();
        if (product) renderProduct();
        else showState(copy[getLanguage()].notFound);
    });
}

function updateLanguageButton() {
    const switcher = byId("languageSwitcher");
    if (switcher) switcher.textContent = getLanguage() === "uk" ? "UA" : "EN";
    document.documentElement.lang = getLanguage();
}

function renderProduct() {
    const lang = getLanguage();
    const text = copy[lang];

    byId("backLink").textContent = text.back;
    byId("stateBackLink").textContent = text.back;
    byId("mobileCatalogText").textContent = text.catalog;
    byId("mobileSearchText").textContent = text.search;
    byId("descriptionHeading").textContent = text.description;
    byId("attributesHeading").textContent = text.attributes;
    byId("storyHeading").textContent = text.story;
    byId("contactButtonText").textContent = text.contact;

    const title = localized(product.title, lang);
    byId("productTitle").textContent = title;
    byId("productShortDescription").textContent = localized(product.short_description, lang);
    byId("productDescription").textContent = localized(product.description, lang);
    document.title = `${title} — Vintage Jam`;

    renderCategory(lang);
    renderPrice(lang);
    renderStatus(lang);
    renderGallery(lang);
    renderAttributes(lang);
    renderStory(lang);
    renderMedia(lang);
    renderContact(lang);

    byId("productState").hidden = true;
    byId("productPage").hidden = false;
}

function renderCategory(lang) {
    const category = categories.find(item => item.id === product.category);
    byId("productCategory").textContent = category
        ? localized(category.title, lang)
        : `${copy[lang].category}: ${product.category}`;
}

function renderPrice(lang) {
    const element = byId("productPrice");
    if (product.price?.type === "request") {
        element.textContent = copy[lang].requestPrice;
        return;
    }

    const value = Number(product.price?.value);
    const currency = product.price?.currency || "UAH";
    element.textContent = Number.isFinite(value)
        ? new Intl.NumberFormat(lang === "uk" ? "uk-UA" : "en-US", {
            style: "currency",
            currency,
            maximumFractionDigits: 0
        }).format(value)
        : copy[lang].requestPrice;
}

function renderStatus(lang) {
    const status = product.sale_status || "available";
    const element = byId("productStatus");
    element.className = `product-status ${status}`;
    element.textContent = copy[lang][status] || status;
    element.hidden = false;
}

function renderGallery(lang) {
    const images = Array.isArray(product.media?.images) && product.media.images.length
        ? product.media.images
        : [FALLBACK_IMAGE];

    activeImageIndex = Math.min(activeImageIndex, images.length - 1);
    const mainImage = byId("mainProductImage");
    mainImage.src = images[activeImageIndex];
    mainImage.alt = localized(product.title, lang);
    mainImage.onerror = () => {
        mainImage.onerror = null;
        mainImage.src = FALLBACK_IMAGE;
    };

    const thumbnails = byId("galleryThumbnails");
    thumbnails.innerHTML = "";
    thumbnails.hidden = images.length < 2;

    images.forEach((src, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `gallery-thumbnail${index === activeImageIndex ? " active" : ""}`;
        button.setAttribute("aria-label", `${lang === "uk" ? "Зображення" : "Image"} ${index + 1}`);

        const image = document.createElement("img");
        image.src = src;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        image.onerror = () => {
            image.onerror = null;
            image.src = FALLBACK_IMAGE;
        };

        button.appendChild(image);
        button.addEventListener("click", () => {
            activeImageIndex = index;
            renderGallery(getLanguage());
        });
        thumbnails.appendChild(button);
    });
}

function renderAttributes(lang) {
    const container = byId("attributes");
    const entries = Object.entries(product.attributes || {});
    container.innerHTML = "";
    byId("attributesSection").hidden = entries.length === 0;

    entries.forEach(([key, value]) => {
        const term = document.createElement("dt");
        term.textContent = copy[lang].attr[key] || key.replaceAll("_", " ");

        const description = document.createElement("dd");
        description.textContent = localized(value, lang);

        container.append(term, description);
    });
}

function renderStory(lang) {
    const story = localized(product.story, lang).trim();
    byId("storySection").hidden = !story;
    byId("productStory").textContent = story;
}

function renderMedia(lang) {
    const container = byId("productMedia");
    container.innerHTML = "";

    const links = [
        [product.media?.youtube, copy[lang].video],
        [product.media?.shorts, copy[lang].shorts]
    ].filter(([url]) => Boolean(url));

    container.hidden = links.length === 0;
    links.forEach(([url, label]) => {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "product-media-link";
        link.textContent = label;
        container.appendChild(link);
    });
}

function renderContact(lang) {
    const button = byId("contactButton");
    const telegram = settings?.contacts?.telegram;
    const phone = settings?.contacts?.phone;
    const title = localized(product.title, lang);
    const message = encodeURIComponent(`${title} (${product.id})`);

    if (telegram) {
        button.href = `${telegram}?text=${message}`;
    } else if (phone) {
        button.href = `tel:${phone}`;
    } else {
        button.hidden = true;
    }
}

function showState(message) {
    byId("productPage").hidden = true;
    byId("productState").hidden = false;
    byId("productStateMessage").textContent = message;
    byId("stateBackLink").textContent = copy[getLanguage()].back;
}

init();
