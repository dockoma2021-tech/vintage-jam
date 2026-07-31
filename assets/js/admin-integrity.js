const DRAFT_KEY = "vintageJamAdminDraftV2";
const form = document.getElementById("productForm");
let originalProduct = null;

function readDraftProducts() {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    return Array.isArray(draft?.products) ? draft.products : [];
  } catch {
    return [];
  }
}

function captureOriginal() {
  const id = String(form?.elements?.id?.value || "").trim();
  originalProduct = id ? structuredClone(readDraftProducts().find(item => item.id === id) || null) : null;
}

function mergePreservedData() {
  if (!originalProduct) return;
  const id = String(form?.elements?.id?.value || "").trim();
  if (!id) return;

  let draft;
  try {
    draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    return;
  }
  if (!Array.isArray(draft?.products)) return;

  const index = draft.products.findIndex(item => item.id === id);
  if (index < 0) return;

  const saved = draft.products[index];
  const merged = {
    ...originalProduct,
    ...saved,
    price: { ...(originalProduct.price || {}), ...(saved.price || {}) },
    media: { ...(originalProduct.media || {}), ...(saved.media || {}) },
    attributes: { ...(originalProduct.attributes || {}), ...(saved.attributes || {}) },
    documents: Array.isArray(saved.documents) && saved.documents.length
      ? saved.documents
      : structuredClone(originalProduct.documents || [])
  };

  if (originalProduct.attributes?.artist && !originalProduct.attributes?.brand) {
    const editedIdentity = saved.attributes?.brand || originalProduct.attributes.artist;
    delete merged.attributes.brand;
    merged.attributes.artist = editedIdentity;
  }

  draft.products[index] = merged;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  originalProduct = structuredClone(merged);
}

form?.addEventListener("submit", () => {
  captureOriginal();
  window.setTimeout(mergePreservedData, 900);
}, true);

document.getElementById("productList")?.addEventListener("click", () => window.setTimeout(captureOriginal, 0));
document.getElementById("newProductButton")?.addEventListener("click", () => { originalProduct = null; });
document.getElementById("duplicateProductButton")?.addEventListener("click", () => window.setTimeout(captureOriginal, 0));
window.setTimeout(captureOriginal, 1200);
