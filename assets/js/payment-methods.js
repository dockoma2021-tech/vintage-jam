const copy = {
    uk: {
        title: "Способи оплати",
        description: "Доступний спосіб оплати узгоджується перед оформленням покупки.",
        note: "Реквізити для оплати надаються особисто після підтвердження замовлення."
    },
    en: {
        title: "Payment methods",
        description: "The available payment method is agreed before the purchase is finalized.",
        note: "Payment details are provided privately after the order is confirmed."
    }
};

const logoText = {
    privat24: "P24",
    paypal: "PayPal",
    payoneer: "Payoneer",
    skrill: "Skrill",
    usdt: "₮"
};

function currentLanguage() {
    return document.documentElement.lang === "en" ? "en" : "uk";
}

async function loadPayments() {
    try {
        const response = await fetch("data/settings.json");
        if (!response.ok) throw new Error(`settings.json: ${response.status}`);
        const settings = await response.json();
        return Array.isArray(settings.payments)
            ? settings.payments.filter(method => method.enabled !== false)
            : [];
    } catch (error) {
        console.error("Payment methods error:", error);
        return [];
    }
}

function renderSection(section, payments) {
    const lang = currentLanguage();
    section.querySelector("[data-payment-title]").textContent = copy[lang].title;
    section.querySelector("[data-payment-description]").textContent = copy[lang].description;
    section.querySelector("[data-payment-note]").textContent = copy[lang].note;

    const container = section.querySelector("[data-payment-list]");
    container.innerHTML = "";

    payments.forEach(method => {
        const item = document.createElement("div");
        item.className = "payment-method";

        const logo = document.createElement("span");
        logo.className = `payment-logo ${method.id}`;
        logo.setAttribute("aria-hidden", "true");
        logo.textContent = logoText[method.id] || method.label;

        const name = document.createElement("span");
        name.className = "payment-name";
        name.textContent = method.label;

        item.append(logo, name);
        container.appendChild(item);
    });

    section.hidden = payments.length === 0;
}

async function initPaymentMethods() {
    const sections = Array.from(document.querySelectorAll("[data-payment-section]"));
    if (!sections.length) return;

    const payments = await loadPayments();
    const renderAll = () => sections.forEach(section => renderSection(section, payments));
    renderAll();

    new MutationObserver(renderAll).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"]
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPaymentMethods, { once: true });
} else {
    initPaymentMethods();
}
