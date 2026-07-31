const STORAGE_KEY = "vintageJamFavorites";
const FALLBACK_IMAGE = "assets/images/no-image.webp";

let favorites = loadFavorites();
let favoritesMode = false;
let products = [];
let categories = [];

function loadFavorites() {
    try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return new Set(Array.isArray(value) ? value.filter(Boolean) : []);
    } catch {
        return new Set();
    }
}

function saveFavorites() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
}

function getLanguage() {
    return document.documentElement.lang === "en" ? "en" : "uk";
}

function getProductId(card) {
    const href = card.querySelector(".product-card-link")?.getAttribute("href") || "";
    return new URL(href, window.location.href).searchParams.get("id");
}

function decorateCards(root = document) {
    root.querySelectorAll(".product-card").forEach(card => {
        const id = getProductId(card);
        const imageWrap = card.querySelector(".product-image");
        if (!id || !imageWrap || imageWrap.querySelector(".favorite-button")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = `favorite-button${favorites.has(id) ? " active" : ""}`;
        button.textContent = favorites.has(id) ? "♥" : "♡";
        updateButtonLabel(button, favorites.has(id));
        button.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(id);
        });
        imageWrap.appendChild(button);
    });
}

function updateButtonLabel(button, active) {
    const lang = getLanguage();
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active
        ? (lang === "uk" ? "Видалити з обраного" : "Remove from favorites")
        : (lang === "uk" ? "Додати до обраного" : "Add to favorites"));
}

function toggleFavorite(id) {
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    saveFavorites();
    updateInterface();
    if (favoritesMode) renderFavorites();
}

function updateInterface() {
    document.querySelectorAll(".product-card").forEach(card => {
        const id = getProductId(card);
        const button = card.querySelector(".favorite-button");
        if (!id || !button) return;
        const active = favorites.has(id);
        button.classList.toggle("active", active);
        button.textContent = active ? "♥" : "♡";
        updateButtonLabel(button, active);
    });

    const count = document.getElementById("favoritesCount");
    if (count) {
        count.textContent = String(favorites.size);
        count.hidden = favorites.size === 0;
    }
}

function createFavoriteCard(product) {
    const lang = getLanguage();
    const card = document.createElement("article");
    card.className = "product-card";
    const title = product.title?.[lang] || product.id;
    const category = categories.find(item => item.id === product.category)?.title?.[lang] || product.category || "";
    const image = product.media?.images?.[0] || FALLBACK_IMAGE;
    const status = product.sale_status || "available";
    const statusText = status === "sold" ? (lang === "uk" ? "ПРОДАНО" : "SOLD") : status === "reserved" ? (lang === "uk" ? "РЕЗЕРВ" : "RESERVED") : "";
    const price = product.price?.type === "fixed" && Number.isFinite(Number(product.price.value))
        ? new Intl.NumberFormat(lang === "uk" ? "uk-UA" : "en-US", {style:"currency", currency: product.price.currency || "UAH", maximumFractionDigits:0}).format(Number(product.price.value))
        : (lang === "uk" ? "Ціна за запитом" : "Price on request");

    card.innerHTML = `<a class="product-card-link" href="item.html?id=${encodeURIComponent(product.id)}" aria-label="${escapeHtml(title)}"><div class="product-image">${statusText ? `<span class="badge ${status}">${statusText}</span>` : ""}<img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async"></div><div class="product-info"><div class="product-title">${escapeHtml(title)}</div><div class="product-category">${escapeHtml(category)}</div><div class="product-price">${escapeHtml(price)}</div></div></a>`;
    card.querySelector("img")?.addEventListener("error", event => { event.currentTarget.src = FALLBACK_IMAGE; }, {once:true});
    return card;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
}

function renderFavorites() {
    const catalog = document.getElementById("catalog");
    const heading = document.getElementById("catalogHeading");
    if (!catalog || !heading) return;
    const lang = getLanguage();
    heading.textContent = lang === "uk" ? "Обране" : "Favorites";
    catalog.replaceChildren();

    const items = products.filter(product => product.publication_status === "published" && favorites.has(product.id));
    if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "favorites-empty";
        empty.textContent = lang === "uk" ? "Ви ще не додали жодного товару до обраного." : "You have not added any items to favorites yet.";
        catalog.appendChild(empty);
        return;
    }

    items.forEach(product => catalog.appendChild(createFavoriteCard(product)));
    decorateCards(catalog);
    updateInterface();
}

function setFavoritesMode(enabled) {
    favoritesMode = enabled;
    document.body.classList.toggle("favorites-active", enabled);
    const button = document.getElementById("favoritesToggle");
    button?.classList.toggle("active", enabled);
    button?.setAttribute("aria-pressed", String(enabled));

    if (enabled) {
        renderFavorites();
        document.getElementById("catalogSection")?.scrollIntoView({behavior:"smooth", block:"start"});
    } else {
        window.location.reload();
    }
}

async function initFavorites() {
    try {
        [products, categories] = await Promise.all([
            fetch("data/products.json").then(response => response.json()),
            fetch("data/categories.json").then(response => response.json())
        ]);
    } catch (error) {
        console.error("Favorites data error:", error);
    }

    document.getElementById("favoritesToggle")?.addEventListener("click", () => setFavoritesMode(!favoritesMode));

    const observer = new MutationObserver(() => {
        if (!favoritesMode) decorateCards();
        updateInterface();
    });
    ["catalog", "newArrivals", "soldProducts"].forEach(id => {
        const node = document.getElementById(id);
        if (node) observer.observe(node, {childList:true, subtree:true});
    });

    const languageObserver = new MutationObserver(() => {
        if (favoritesMode) renderFavorites();
        updateInterface();
        const label = document.getElementById("favoritesLabel");
        if (label) label.textContent = getLanguage() === "uk" ? "Обране" : "Favorites";
    });
    languageObserver.observe(document.documentElement, {attributes:true, attributeFilter:["lang"]});

    decorateCards();
    updateInterface();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFavorites, {once:true});
else initFavorites();
