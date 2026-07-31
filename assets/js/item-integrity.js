import { getLanguage } from "./i18n.js";

const labels = {
  uk: {
    brand: "Бренд",
    artist: "Автор",
    model: "Модель",
    year: "Рік",
    country: "Країна",
    movement: "Механізм",
    material: "Матеріал",
    dimensions: "Розміри",
    condition: "Стан",
    signature: "Підпис"
  },
  en: {
    brand: "Brand",
    artist: "Artist",
    model: "Model",
    year: "Year",
    country: "Country",
    movement: "Movement",
    material: "Material",
    dimensions: "Dimensions",
    condition: "Condition",
    signature: "Signature"
  }
};

function normalizeKey(text) {
  return String(text || "").trim().toLowerCase().replaceAll(" ", "_");
}

export function localizeAttributeLabels() {
  const language = getLanguage() === "en" ? "en" : "uk";
  document.querySelectorAll("#attributes dt").forEach(term => {
    const key = term.dataset.attributeKey || normalizeKey(term.textContent);
    term.dataset.attributeKey = key;
    if (labels[language][key]) term.textContent = labels[language][key];
  });
}

const attributes = document.getElementById("attributes");
if (attributes) new MutationObserver(localizeAttributeLabels).observe(attributes, { childList: true, subtree: true });
document.getElementById("languageSwitcher")?.addEventListener("click", () => setTimeout(localizeAttributeLabels, 0));
setTimeout(localizeAttributeLabels, 500);
