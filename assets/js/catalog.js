const FALLBACK_IMAGE = "assets/images/no-image.webp";
const NEW_PRODUCT_DAYS = 30;

let products = [];
let categories = [];
let currentLanguage = "uk";
let dataLoaded = false;

const catalogState = {
    category: null,
    search: "",
    sort: "new",
    saleStatus: "available"
};

export async function initCatalog(language = "uk") {
    currentLanguage = language;

    if (!dataLoaded) {
        await loadData();
        dataLoaded = true;
    }

    renderCategories();
    renderNewArrivals();
    renderSold();
    updateCatalog();
}

export function searchProducts(query = "") {
    catalogState.search = String(query).trim().toLowerCase();
    updateCatalog();
}

export function setSort(value = "new") {
    const allowedValues = new Set(["new", "old", "price_up", "price_down"]);
    catalogState.sort = allowedValues.has(value) ? value : "new";
    updateCatalog();
}

async function loadData() {
    try {
        const [productsResponse, categoriesResponse] = await Promise.all([
            fetch("data/products.json"),
            fetch("data/categories.json")
        ]);

        if (!productsResponse.ok) {
            throw new Error(`Не удалось загрузить products.json: ${productsResponse.status}`);
        }

        if (!categoriesResponse.ok) {
            throw new Error(`Не удалось загрузить categories.json: ${categoriesResponse.status}`);
        }

        products = await productsResponse.json();
        categories = await categoriesResponse.json();

        if (!Array.isArray(products) || !Array.isArray(categories)) {
            throw new TypeError("Файлы данных должны содержать JSON-массивы.");
        }
    } catch (error) {
        console.error("Ошибка загрузки каталога:", error);
        products = [];
        categories = [];
        renderCatalogError();
        throw error;
    }
}

function updateCatalog() {
    let result = products.filter(product =>
        product.publication_status === "published"
    );

    if (catalogState.saleStatus) {
        result = result.filter(product =>
            product.sale_status === catalogState.saleStatus
        );
    }

    if (catalogState.category) {
        result = result.filter(product =>
            product.category === catalogState.category
        );
    }

    if (catalogState.search) {
        result = result.filter(product =>
            getSearchText(product).includes(catalogState.search)
        );
    }

    renderCatalog(sortProducts(result));
}

function getSearchText(product) {
    const localizedTitle = product.title?.[currentLanguage] || "";
    const localizedShortDescription = product.short_description?.[currentLanguage] || "";
    const localizedDescription = product.description?.[currentLanguage] || "";
    const category = getCategoryTitle(product.category);
    const attributes = Object.values(product.attributes || {})
        .map(value => {
            if (value && typeof value === "object") {
                return value[currentLanguage] || "";
            }
            return value ?? "";
        })
        .join(" ");

    return [
        localizedTitle,
        localizedShortDescription,
        localizedDescription,
        product.category || "",
        category,
        attributes
    ]
        .join(" ")
        .toLowerCase();
}

function sortProducts(items) {
    const sorted = [...items];

    switch (catalogState.sort) {
        case "old":
            return sorted.sort((a, b) =>
                getDateValue(a.date_added) - getDateValue(b.date_added)
            );

        case "price_up":
            return sorted.sort((a, b) =>
                getSortablePrice(a) - getSortablePrice(b)
            );

        case "price_down":
            return sorted.sort((a, b) =>
                getSortablePrice(b) - getSortablePrice(a)
            );

        case "new":
        default:
            return sorted.sort((a, b) =>
                getDateValue(b.date_added) - getDateValue(a.date_added)
            );
    }
}

function getDateValue(date) {
    const value = new Date(date).getTime();
    return Number.isFinite(value) ? value : 0;
}

function getSortablePrice(product) {
    if (product.price?.type !== "fixed") {
        return Number.POSITIVE_INFINITY;
    }

    const value = Number(product.price.value);
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function renderCategories() {
    const container = document.getElementById("categories");
    if (!container) return;

    container.replaceChildren();

    container.appendChild(createCategoryButton(
        null,
        currentLanguage === "uk" ? "Всі" : "All"
    ));

    categories.forEach(category => {
        container.appendChild(createCategoryButton(
            category.id,
            category.title?.[currentLanguage] || category.id
        ));
    });
}

function createCategoryButton(categoryId, label) {
    const button = document.createElement("button");
    const isActive = catalogState.category === categoryId;

    button.type = "button";
    button.className = `category-item${isActive ? " active" : ""}`;
    button.textContent = label;
    button.setAttribute("aria-pressed", String(isActive));

    button.addEventListener("click", () => {
        catalogState.category = categoryId;
        renderCategories();
        updateCatalog();
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return button;
}

function renderCatalog(items) {
    const container = document.getElementById("catalog");
    if (!container) return;

    container.replaceChildren();

    if (items.length === 0) {
        container.appendChild(createEmptyState());
        return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach(product => fragment.appendChild(createProductCard(product)));
    container.appendChild(fragment);
}

function renderNewArrivals() {
    const container = document.getElementById("newArrivals");
    if (!container) return;

    const items = products
        .filter(product =>
            product.publication_status === "published" &&
            product.sale_status === "available"
        )
        .sort((a, b) => getDateValue(b.date_added) - getDateValue(a.date_added))
        .slice(0, 8);

    renderProductList(container, items);
}

function renderSold() {
    const container = document.getElementById("soldProducts");
    if (!container) return;

    const items = products
        .filter(product =>
            product.publication_status === "published" &&
            product.sale_status === "sold"
        )
        .sort((a, b) => getDateValue(b.date_added) - getDateValue(a.date_added));

    renderProductList(container, items);

    const section = container.closest("section");
    if (section) {
        section.hidden = items.length === 0;
    }
}

function renderProductList(container, items) {
    container.replaceChildren();

    const fragment = document.createDocumentFragment();
    items.forEach(product => fragment.appendChild(createProductCard(product)));
    container.appendChild(fragment);
}

function createProductCard(product) {
    const card = document.createElement("article");
    const link = document.createElement("a");
    const imageWrapper = document.createElement("div");
    const image = document.createElement("img");
    const info = document.createElement("div");
    const title = document.createElement("div");
    const category = document.createElement("div");
    const price = document.createElement("div");
    const productTitle = product.title?.[currentLanguage] || product.id;

    card.className = "product-card";
    link.className = "product-card-link";
    link.href = `item.html?id=${encodeURIComponent(product.id)}`;
    link.setAttribute("aria-label", productTitle);

    imageWrapper.className = "product-image";
    image.src = getMainImage(product);
    image.alt = productTitle;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
        image.src = FALLBACK_IMAGE;
    }, { once: true });

    const badge = createBadge(product);
    if (badge) imageWrapper.appendChild(badge);
    imageWrapper.appendChild(image);

    info.className = "product-info";
    title.className = "product-title";
    title.textContent = productTitle;
    category.className = "product-category";
    category.textContent = getCategoryTitle(product.category);
    price.className = "product-price";
    price.textContent = formatPrice(product);

    info.append(title, category, price);
    link.append(imageWrapper, info);
    card.appendChild(link);

    return card;
}

function createBadge(product) {
    let text = "";
    let modifier = "";

    if (product.sale_status === "sold") {
        text = currentLanguage === "uk" ? "ПРОДАНО" : "SOLD";
        modifier = "sold";
    } else if (product.sale_status === "reserved") {
        text = currentLanguage === "uk" ? "РЕЗЕРВ" : "RESERVED";
        modifier = "reserved";
    } else if (isNew(product.date_added)) {
        text = currentLanguage === "uk" ? "НОВИНКА" : "NEW";
        modifier = "new";
    }

    if (!text) return null;

    const badge = document.createElement("span");
    badge.className = `badge ${modifier}`;
    badge.textContent = text;
    return badge;
}

function isNew(date) {
    const added = getDateValue(date);
    if (!added) return false;

    const ageInDays = (Date.now() - added) / 86400000;
    return ageInDays >= 0 && ageInDays <= NEW_PRODUCT_DAYS;
}

function getMainImage(product) {
    const firstImage = product.media?.images?.[0];
    return typeof firstImage === "string" && firstImage.trim()
        ? firstImage
        : FALLBACK_IMAGE;
}

function getCategoryTitle(categoryId) {
    const category = categories.find(item => item.id === categoryId);
    return category?.title?.[currentLanguage] || categoryId || "";
}

function formatPrice(product) {
    if (product.price?.type !== "fixed") {
        return currentLanguage === "uk"
            ? "Ціна за запитом"
            : "Price on Request";
    }

    const value = Number(product.price.value);
    const currency = product.price.currency || "UAH";

    if (!Number.isFinite(value)) {
        return currentLanguage === "uk"
            ? "Ціна за запитом"
            : "Price on Request";
    }

    try {
        return new Intl.NumberFormat(
            currentLanguage === "uk" ? "uk-UA" : "en-US",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 0
            }
        ).format(value);
    } catch {
        return `${value} ${currency}`;
    }
}

function createEmptyState() {
    const message = document.createElement("p");
    message.className = "catalog-empty";
    message.textContent = currentLanguage === "uk"
        ? "Нічого не знайдено"
        : "Nothing found";
    return message;
}

function renderCatalogError() {
    const container = document.getElementById("catalog");
    if (!container) return;

    const message = document.createElement("p");
    message.className = "catalog-empty catalog-error";
    message.textContent = currentLanguage === "uk"
        ? "Не вдалося завантажити каталог. Оновіть сторінку пізніше."
        : "The catalog could not be loaded. Please try again later.";

    container.replaceChildren(message);
}
