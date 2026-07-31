const DRAFT_KEY = "vintageJamAdminDraftV2";
const DRAFT_META_KEY = "vintageJamAdminDraftMetaV2";
const REPOSITORY = "dockoma2021-tech/vintage-jam";
const BRANCH = "main";

const byId = id => document.getElementById(id);
let draftProducts = [];
let selectedProduct = null;
let serverCatalog = [];
let serverLastModified = null;

function toast(text) {
  const element = byId("adminToast");
  element.textContent = text;
  element.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { element.hidden = true; }, 2800);
}

function localized(value, language = "uk") {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value[language] || value.uk || value.en || "";
  }
  return value || "";
}

function readDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) throw new Error("Локальну чернетку не знайдено. Спочатку збережіть товар в admin.html.");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.products)) throw new Error("Локальна чернетка пошкоджена.");
  draftProducts = parsed.products;
  return parsed.selectedId || "";
}

function getDraftSavedAt() {
  try {
    const meta = JSON.parse(localStorage.getItem(DRAFT_META_KEY) || "null");
    return meta?.savedAt ? new Date(meta.savedAt) : null;
  } catch {
    return null;
  }
}

function validateProduct(product) {
  const errors = [];
  if (!product) return ["Товар не вибрано"];
  if (!/^vj-\d{6}$/.test(product.id || "")) errors.push("Невірний ID");
  if (product.publication_status !== "published") errors.push("Статус публікації має бути published");
  if (!product.category) errors.push("Не вибрана категорія");
  if (!localized(product.title, "uk")) errors.push("Немає назви українською");
  if (!localized(product.title, "en")) errors.push("Немає назви англійською");
  if (!localized(product.description, "uk")) errors.push("Немає опису українською");
  if (!localized(product.description, "en")) errors.push("Немає опису англійською");
  if (!Array.isArray(product.media?.images) || !product.media.images.length) errors.push("Немає фотографій");
  return errors;
}

function populateProducts(preferredId) {
  const select = byId("publishProductSelect");
  select.replaceChildren(new Option("Оберіть товар", ""));
  [...draftProducts]
    .sort((a, b) => String(b.date_added || "").localeCompare(String(a.date_added || "")))
    .forEach(product => {
      const label = `${product.id} — ${localized(product.title, "uk") || "Без назви"}`;
      select.append(new Option(label, product.id));
    });
  if (preferredId && draftProducts.some(item => item.id === preferredId)) select.value = preferredId;
  else if (draftProducts.length) select.value = draftProducts[0].id;
  selectProduct(select.value);
}

function selectProduct(id) {
  selectedProduct = draftProducts.find(item => item.id === id) || null;
  renderProduct();
  renderFiles();
  updateLinks();
  updateStatus();
}

function renderProduct() {
  const box = byId("publishProductSummary");
  if (!selectedProduct) {
    box.textContent = "Товар не вибрано.";
    return;
  }
  const errors = validateProduct(selectedProduct);
  const imageCount = selectedProduct.media?.images?.length || 0;
  box.innerHTML = `<strong>${escapeHtml(localized(selectedProduct.title, "uk") || selectedProduct.id)}</strong><br>${escapeHtml(selectedProduct.id)} · ${escapeHtml(selectedProduct.sale_status || "")} · ${imageCount} фото<br>${errors.length ? `<span style="color:#b42318">Помилки: ${escapeHtml(errors.join("; "))}</span>` : '<span style="color:#067647">Товар пройшов базову перевірку</span>'}`;
}

function renderFiles() {
  const list = byId("publishFileList");
  list.replaceChildren();
  if (!selectedProduct) return;
  const files = ["data/products.json", ...(selectedProduct.media?.images || [])];
  files.forEach((path, index) => {
    const row = document.createElement("div");
    row.className = "publish-file-item";
    const code = document.createElement("code");
    code.textContent = path;
    const label = document.createElement("span");
    label.textContent = index === 0 ? "каталог" : `фото ${index}`;
    row.append(code, label);
    list.append(row);
  });
}

async function loadServerCatalog() {
  const response = await fetch(`data/products.json?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`products.json: HTTP ${response.status}`);
  serverLastModified = response.headers.get("last-modified");
  const parsed = await response.json();
  if (!Array.isArray(parsed)) throw new Error("Поточний products.json не є масивом");
  serverCatalog = parsed;
  renderVersionCheck();
}

function renderVersionCheck() {
  const box = byId("versionCheck");
  const draftSavedAt = getDraftSavedAt();
  const serverDate = serverLastModified ? new Date(serverLastModified) : null;
  const duplicateIds = draftProducts.filter((item, index, all) => all.findIndex(other => other.id === item.id) !== index);
  const serverHasSelected = selectedProduct && serverCatalog.some(item => item.id === selectedProduct.id);
  const newerServer = draftSavedAt && serverDate && serverDate > draftSavedAt;

  if (duplicateIds.length) {
    box.className = "version-check error";
    box.textContent = "У локальному каталозі є дублікати ID. Публікацію зупинено.";
    return;
  }
  if (newerServer) {
    box.className = "version-check error";
    box.textContent = "Каталог на сайті оновлювався після збереження локальної чернетки. Завантажте актуальний каталог в адмінці перед публікацією.";
    return;
  }
  box.className = "version-check ok";
  box.textContent = `Поточний каталог доступний: ${serverCatalog.length} товарів.${serverHasSelected ? " Вибраний товар уже існує й буде оновлений." : " Вибраний товар буде доданий."}`;
}

function updateStatus() {
  const badge = byId("publishStatus");
  const errors = validateProduct(selectedProduct);
  if (!selectedProduct || errors.length) {
    badge.className = "publish-status error";
    badge.textContent = selectedProduct ? `Є помилки: ${errors.length}` : "Товар не вибрано";
    return;
  }
  badge.className = "publish-status ok";
  badge.textContent = "Готово до ручної публікації";
}

function updateLinks() {
  const id = selectedProduct?.id || "";
  const encodedFolder = encodeURI(`images/products/${id}`);
  byId("openImagesUpload").href = id ? `https://github.com/${REPOSITORY}/upload/${BRANCH}/${encodedFolder}` : "#";
  byId("openCatalogEdit").href = `https://github.com/${REPOSITORY}/edit/${BRANCH}/data/products.json`;
  byId("openPublishedProduct").href = id ? new URL(`item.html?id=${encodeURIComponent(id)}`, window.location.href).href : "index.html";
}

function downloadCatalog() {
  if (!draftProducts.length) return toast("Немає локального каталогу");
  const blob = new Blob([`${JSON.stringify(draftProducts, null, 2)}\n`], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "products.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1200);
}

async function copyCommit() {
  if (!selectedProduct) return toast("Оберіть товар");
  const title = localized(selectedProduct.title, "uk") || selectedProduct.id;
  const message = `Publish ${selectedProduct.id}: ${title}`;
  await navigator.clipboard.writeText(message);
  toast("Повідомлення commit скопійовано");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

function bind() {
  byId("publishProductSelect").addEventListener("change", event => selectProduct(event.target.value));
  byId("refreshVersionButton").addEventListener("click", () => loadServerCatalog().catch(showServerError));
  byId("downloadCatalogButton").addEventListener("click", downloadCatalog);
  byId("copyCommitButton").addEventListener("click", () => copyCommit().catch(() => toast("Не вдалося скопіювати commit")));
}

function showServerError(error) {
  const box = byId("versionCheck");
  box.className = "version-check error";
  box.textContent = `Не вдалося перевірити поточний каталог: ${error.message}`;
}

try {
  const preferredId = readDraft();
  bind();
  populateProducts(preferredId);
  loadServerCatalog().catch(showServerError);
} catch (error) {
  byId("publishStatus").className = "publish-status error";
  byId("publishStatus").textContent = "Немає чернетки";
  byId("publishProductSummary").textContent = error.message;
  byId("versionCheck").textContent = "Поверніться в admin.html, завантажте каталог і збережіть товар.";
}
