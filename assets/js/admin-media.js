const DRAFT_KEY = "vintageJamAdminDraftV2";
const form = document.getElementById("productForm");
const fileInput = document.getElementById("productImagesInput");
const dropZone = document.getElementById("mediaDropZone");
const gallery = document.getElementById("preparedImages");
const summary = document.getElementById("mediaSummary");
const progress = document.getElementById("mediaProgress");
const maxSizeSelect = document.getElementById("mediaMaxSize");
const qualitySelect = document.getElementById("mediaQuality");
const clearButton = document.getElementById("clearPreparedImagesButton");
const zipButton = document.getElementById("prepareProductZipButton");
const editorHint = document.getElementById("editorHint");

const mediaByProduct = new Map();
let activeProductId = "";
let processing = false;

function toast(text) {
  const element = document.getElementById("adminToast");
  if (!element) return;
  element.textContent = text;
  element.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { element.hidden = true; }, 3200);
}

function productId() {
  return String(form?.elements?.id?.value || "").trim();
}

function validProductId(id) {
  return /^vj-\d{6}$/.test(id);
}

function getItems(id = productId()) {
  if (!mediaByProduct.has(id)) mediaByProduct.set(id, []);
  return mediaByProduct.get(id);
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function showProgress(text) {
  progress.textContent = text;
  progress.hidden = !text;
}

function generatedPath(id, index) {
  return `images/products/${id}/${String(index + 1).padStart(2, "0")}.webp`;
}

function syncImagePaths() {
  const id = productId();
  if (!validProductId(id)) return;
  const items = getItems(id);
  if (!items.length) return;
  const textarea = form.elements.images;
  textarea.value = items.map((_, index) => generatedPath(id, index)).join("\n");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function revokeItem(item) {
  if (item?.url) URL.revokeObjectURL(item.url);
}

function render() {
  const id = productId();
  gallery.replaceChildren();

  if (!validProductId(id)) {
    summary.textContent = "Спочатку створіть або виберіть товар із правильним ID.";
    zipButton.disabled = true;
    return;
  }

  const items = getItems(id);
  zipButton.disabled = processing || items.length === 0;

  if (!items.length) {
    const existingPaths = String(form.elements.images.value || "").trim();
    summary.textContent = existingPaths
      ? "У товарі вже вказані шляхи до фото. Для нового ZIP виберіть оригінальні файли фотографій."
      : "Підготовлених фотографій немає.";
    return;
  }

  let originalTotal = 0;
  let convertedTotal = 0;

  items.forEach((item, index) => {
    originalTotal += item.originalSize;
    convertedTotal += item.blob.size;

    const card = document.createElement("article");
    card.className = "prepared-image-card";

    const image = document.createElement("img");
    image.src = item.url;
    image.alt = `Фото ${index + 1}`;

    const meta = document.createElement("div");
    meta.className = "prepared-image-meta";
    const name = document.createElement("strong");
    name.textContent = `${String(index + 1).padStart(2, "0")}.webp`;
    const details = document.createElement("span");
    details.textContent = `${item.width} × ${item.height} · ${formatBytes(item.blob.size)}`;
    meta.append(name, details);

    const actions = document.createElement("div");
    actions.className = "prepared-image-actions";

    const up = document.createElement("button");
    up.type = "button";
    up.className = "secondary";
    up.textContent = "←";
    up.title = "Перемістити раніше";
    up.disabled = index === 0;
    up.addEventListener("click", () => moveItem(index, index - 1));

    const down = document.createElement("button");
    down.type = "button";
    down.className = "secondary";
    down.textContent = "→";
    down.title = "Перемістити пізніше";
    down.disabled = index === items.length - 1;
    down.addEventListener("click", () => moveItem(index, index + 1));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "×";
    remove.title = "Видалити фотографію";
    remove.addEventListener("click", () => removeItem(index));

    actions.append(up, down, remove);
    card.append(image, meta, actions);
    gallery.append(card);
  });

  const saved = Math.max(0, originalTotal - convertedTotal);
  summary.textContent = `${items.length} фото · було ${formatBytes(originalTotal)} · стало ${formatBytes(convertedTotal)} · економія ${formatBytes(saved)}`;
  syncImagePaths();
}

function moveItem(from, to) {
  const items = getItems();
  if (to < 0 || to >= items.length) return;
  const [item] = items.splice(from, 1);
  items.splice(to, 0, item);
  render();
}

function removeItem(index) {
  const items = getItems();
  const [removed] = items.splice(index, 1);
  revokeItem(removed);
  if (!items.length) form.elements.images.value = "";
  render();
}

function clearPreparedImages() {
  const id = productId();
  const items = getItems(id);
  items.forEach(revokeItem);
  mediaByProduct.set(id, []);
  form.elements.images.value = "";
  form.elements.images.dispatchEvent(new Event("input", { bubbles: true }));
  render();
  toast("Підготовлені фотографії очищено");
}

async function loadBitmap(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Safari and some HEIC files require the Image fallback below.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Браузер не зміг створити WebP")),
      "image/webp",
      quality
    );
  });
}

async function convertFile(file, maxSide, quality) {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name}: це не зображення`);

  const source = await loadBitmap(file);
  const sourceWidth = source.naturalWidth || source.width;
  const sourceHeight = source.naturalHeight || source.height;
  if (!sourceWidth || !sourceHeight) throw new Error(`${file.name}: не вдалося визначити розмір`);

  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  if (typeof source.close === "function") source.close();

  const blob = await canvasToBlob(canvas, quality);
  return {
    blob,
    url: URL.createObjectURL(blob),
    originalName: file.name,
    originalSize: file.size,
    width,
    height
  };
}

async function processFiles(fileList) {
  const id = productId();
  if (!validProductId(id)) {
    toast("Спочатку створіть або виберіть товар із правильним ID");
    return;
  }

  const files = Array.from(fileList || []).filter(file => file.type.startsWith("image/"));
  if (!files.length) {
    toast("Фотографії не вибрані");
    return;
  }

  const maxSide = Number(maxSizeSelect.value) || 1800;
  const quality = Number(qualitySelect.value) || 0.82;
  const items = getItems(id);
  processing = true;
  render();

  const errors = [];
  for (let index = 0; index < files.length; index += 1) {
    showProgress(`Обробка ${index + 1} з ${files.length}: ${files[index].name}`);
    try {
      items.push(await convertFile(files[index], maxSide, quality));
    } catch (error) {
      errors.push(`${files[index].name}: ${error.message}`);
    }
  }

  processing = false;
  showProgress("");
  fileInput.value = "";
  render();

  if (errors.length) {
    console.error(errors);
    toast(`Не оброблено: ${errors.length}. Перевірте формат фото.`);
  } else {
    toast(`Підготовлено ${files.length} фотографій`);
  }
}

function downloadBlob(name, blob) {
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1500);
}

async function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function createProductZip() {
  const id = productId();
  const items = getItems(id);
  if (!validProductId(id)) {
    toast("Невірний ID товару");
    return;
  }
  if (!items.length) {
    toast("Спочатку виберіть фотографії");
    return;
  }
  if (!window.JSZip) {
    toast("ZIP-модуль не завантажився. Перевірте інтернет.");
    return;
  }

  processing = true;
  syncImagePaths();
  form.requestSubmit();
  showProgress("Збереження товару та підготовка архіву…");
  await wait(900);

  let draft;
  try {
    draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  } catch {
    draft = null;
  }
  if (!draft || !Array.isArray(draft.products)) {
    processing = false;
    showProgress("");
    render();
    toast("Не вдалося отримати актуальний каталог. Збережіть товар ще раз.");
    return;
  }

  const product = draft.products.find(item => item.id === id);
  if (!product) {
    processing = false;
    showProgress("");
    render();
    toast("Товар не знайдено в локальній копії");
    return;
  }

  const zip = new JSZip();
  const imageFolder = zip.folder(`images/products/${id}`);
  items.forEach((item, index) => {
    imageFolder.file(`${String(index + 1).padStart(2, "0")}.webp`, item.blob);
  });

  zip.file("data/products.json", `${JSON.stringify(draft.products, null, 2)}\n`);
  zip.file(`${id}-product.json`, `${JSON.stringify(product, null, 2)}\n`);
  zip.file("README.txt", [
    "Vintage Jam — готовий пакет товару",
    "",
    `Товар: ${id}`,
    `Фотографій: ${items.length}`,
    "",
    "Вміст архіву:",
    `1. images/products/${id}/ — готові WebP-фотографії.`,
    "2. data/products.json — актуальний каталог із цим товаром.",
    `3. ${id}-product.json — окрема резервна копія картки товару.`,
    "",
    "Для ручної публікації завантажте папку images і файл data/products.json у корінь репозиторію, зберігаючи структуру папок."
  ].join("\n"));

  const archive = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
    metadata => showProgress(`Створення ZIP: ${Math.round(metadata.percent)}%`)
  );

  downloadBlob(`${id}-vintage-jam-package.zip`, archive);
  processing = false;
  showProgress("");
  render();
  toast("ZIP-пакет товару завантажено");
}

function handleProductChange() {
  const current = productId();
  if (current === activeProductId) return;
  activeProductId = current;
  render();
}

fileInput?.addEventListener("change", event => processFiles(event.target.files));
clearButton?.addEventListener("click", () => {
  if (getItems().length && !confirm("Видалити всі підготовлені фотографії цього товару?")) return;
  clearPreparedImages();
});
zipButton?.addEventListener("click", () => createProductZip().catch(error => {
  processing = false;
  showProgress("");
  render();
  console.error(error);
  toast(`Помилка ZIP: ${error.message}`);
}));

dropZone?.addEventListener("click", () => fileInput.click());
dropZone?.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});
["dragenter", "dragover"].forEach(type => dropZone?.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach(type => dropZone?.addEventListener(type, event => {
  event.preventDefault();
  dropZone.classList.remove("dragover");
}));
dropZone?.addEventListener("drop", event => processFiles(event.dataTransfer.files));

form?.elements?.id?.addEventListener("input", handleProductChange);
document.getElementById("productList")?.addEventListener("click", () => setTimeout(handleProductChange, 0));
document.getElementById("newProductButton")?.addEventListener("click", () => setTimeout(handleProductChange, 0));
document.getElementById("duplicateProductButton")?.addEventListener("click", () => setTimeout(handleProductChange, 0));
new MutationObserver(handleProductChange).observe(editorHint, { childList: true, characterData: true, subtree: true });

activeProductId = productId();
render();
