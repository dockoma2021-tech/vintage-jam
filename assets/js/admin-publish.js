const DRAFT_KEY = "vintageJamAdminDraftV2";
const DRAFT_META_KEY = "vintageJamAdminDraftMetaV2";
const REPOSITORY = "dockoma2021-tech/vintage-jam";
const BRANCH = "main";

const byId = id => document.getElementById(id);
let draftProducts = [];
let selectedProduct = null;
let serverCatalog = [];
let serverLastModified = null;
let versionSafe = false;

function toast(text) {
  const element = byId("adminToast");
  element.textContent = text;
  element.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { element.hidden = true; }, 2800);
}

function localized(value, language = "uk") {
  if (value && typeof value === "object" && !Array.isArray(value)) return value[language] || value.uk || value.en || "";
  return value || "";
}

function readDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) throw new Error("Локальну чернетку не знайдено. Спочатку збережіть товар в admin.html.");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.products)) throw new Error("Локальна чернетка пошкоджена.");
  draftProducts = parsed.products;
  const requestedId = new URLSearchParams(location.search).get("id");
  return requestedId || parsed.selectedId || "";
}

function getDraftSavedAt() {
  try {
    const meta = JSON.parse(localStorage.getItem(DRAFT_META_KEY) || "null");
    return meta?.savedAt ? new Date(meta.savedAt) : null;
  } catch { return null; }
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
  if (product.price?.type === "fixed" && (!Number.isFinite(Number(product.price.value)) || Number(product.price.value) < 0)) errors.push("Невірна ціна");
  return errors;
}

function populateProducts(preferredId) {
  const select = byId("publishProductSelect");
  select.replaceChildren(new Option("Оберіть товар", ""));
  [...draftProducts].sort((a,b)=>String(b.date_added||"").localeCompare(String(a.date_added||""))).forEach(product => {
    select.append(new Option(`${product.id} — ${localized(product.title,"uk") || "Без назви"}`, product.id));
  });
  if (preferredId && draftProducts.some(item => item.id === preferredId)) select.value = preferredId;
  else if (draftProducts.length) select.value = draftProducts[0].id;
  selectProduct(select.value);
}

function selectProduct(id) {
  selectedProduct = draftProducts.find(item => item.id === id) || null;
  renderProduct(); renderFiles(); updateLinks(); updateStatus();
  if (serverCatalog.length) renderVersionCheck();
}

function renderProduct() {
  const box = byId("publishProductSummary");
  if (!selectedProduct) { box.textContent = "Товар не вибрано."; return; }
  const errors = validateProduct(selectedProduct);
  const imageCount = selectedProduct.media?.images?.length || 0;
  box.innerHTML = `<strong>${escapeHtml(localized(selectedProduct.title,"uk") || selectedProduct.id)}</strong><br>${escapeHtml(selectedProduct.id)} · ${escapeHtml(selectedProduct.sale_status || "")} · ${imageCount} фото<br>${errors.length ? `<span style="color:#b42318">Помилки: ${escapeHtml(errors.join("; "))}</span>` : '<span style="color:#067647">Товар пройшов базову перевірку</span>'}`;
}

function renderFiles() {
  const list = byId("publishFileList"); list.replaceChildren();
  if (!selectedProduct) return;
  ["data/products.json", ...(selectedProduct.media?.images || [])].forEach((path,index)=>{
    const row=document.createElement("div"); row.className="publish-file-item";
    const code=document.createElement("code"); code.textContent=path;
    const label=document.createElement("span"); label.textContent=index===0?"каталог":`фото ${index}`;
    row.append(code,label); list.append(row);
  });
}

async function loadServerCatalog() {
  versionSafe = false; updateControls();
  const response = await fetch(`data/products.json?t=${Date.now()}`, { cache:"no-store" });
  if (!response.ok) throw new Error(`products.json: HTTP ${response.status}`);
  serverLastModified = response.headers.get("last-modified");
  const parsed = await response.json();
  if (!Array.isArray(parsed)) throw new Error("Поточний products.json не є масивом");
  serverCatalog = parsed; renderVersionCheck();
}

function renderVersionCheck() {
  const box=byId("versionCheck");
  const draftSavedAt=getDraftSavedAt();
  const serverDate=serverLastModified?new Date(serverLastModified):null;
  const duplicateIds=draftProducts.filter((item,index,all)=>all.findIndex(other=>other.id===item.id)!==index);
  const serverHasSelected=selectedProduct&&serverCatalog.some(item=>item.id===selectedProduct.id);
  const newerServer=draftSavedAt&&serverDate&&serverDate>draftSavedAt;
  versionSafe=false;
  if (duplicateIds.length) { box.className="version-check error"; box.textContent="У локальному каталозі є дублікати ID. Публікацію зупинено."; updateControls(); return; }
  if (newerServer) { box.className="version-check error"; box.textContent="Каталог на сайті оновлювався після збереження локальної чернетки. Завантажте актуальний каталог в адмінці перед публікацією."; updateControls(); return; }
  versionSafe=true;
  box.className="version-check ok";
  box.textContent=`Поточний каталог доступний: ${serverCatalog.length} товарів.${serverHasSelected?" Вибраний товар уже існує й буде оновлений.":" Вибраний товар буде доданий."}`;
  updateControls();
}

function canPublish() { return Boolean(selectedProduct) && validateProduct(selectedProduct).length===0 && versionSafe; }
function updateControls() {
  const allowed=canPublish();
  byId("downloadCatalogButton").disabled=!allowed;
  byId("copyCommitButton").disabled=!allowed;
  ["openImagesUpload","openCatalogEdit","openPublishedProduct"].forEach(id=>{
    const link=byId(id); link.setAttribute("aria-disabled", String(!allowed)); link.style.pointerEvents=allowed?"":"none"; link.style.opacity=allowed?"":"0.45";
  });
}
function updateStatus() {
  const badge=byId("publishStatus"); const errors=validateProduct(selectedProduct);
  if (!selectedProduct||errors.length) { badge.className="publish-status error"; badge.textContent=selectedProduct?`Є помилки: ${errors.length}`:"Товар не вибрано"; updateControls(); return; }
  badge.className=versionSafe?"publish-status ok":"publish-status";
  badge.textContent=versionSafe?"Готово до ручної публікації":"Очікується перевірка версії";
  updateControls();
}

function updateLinks() {
  const id=selectedProduct?.id||"";
  byId("openImagesUpload").href=id?`https://github.com/${REPOSITORY}/upload/${BRANCH}/${encodeURI(`images/products/${id}`)}`:"#";
  byId("openCatalogEdit").href=`https://github.com/${REPOSITORY}/edit/${BRANCH}/data/products.json`;
  byId("openPublishedProduct").href=id?new URL(`item.html?id=${encodeURIComponent(id)}`,location.href).href:"index.html";
}

function downloadCatalog() {
  if (!canPublish()) return toast("Спочатку виправте помилки та перевірте актуальність каталогу");
  const blob=new Blob([`${JSON.stringify(draftProducts,null,2)}\n`],{type:"application/json"});
  const link=document.createElement("a"); link.href=URL.createObjectURL(blob); link.download="products.json"; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(link.href),1200);
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const area=document.createElement("textarea"); area.value=text; area.style.position="fixed"; area.style.opacity="0"; document.body.append(area); area.select(); const ok=document.execCommand("copy"); area.remove(); if(!ok) throw new Error("copy failed");
}
async function copyCommit() {
  if (!canPublish()) return toast("Публікація ще заблокована");
  await copyText(`Publish ${selectedProduct.id}: ${localized(selectedProduct.title,"uk") || selectedProduct.id}`); toast("Повідомлення commit скопійовано");
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function bind(){byId("publishProductSelect").addEventListener("change",e=>selectProduct(e.target.value));byId("refreshVersionButton").addEventListener("click",()=>loadServerCatalog().catch(showServerError));byId("downloadCatalogButton").addEventListener("click",downloadCatalog);byId("copyCommitButton").addEventListener("click",()=>copyCommit().catch(()=>toast("Не вдалося скопіювати commit")))}
function showServerError(error){versionSafe=false;const box=byId("versionCheck");box.className="version-check error";box.textContent=`Не вдалося перевірити поточний каталог: ${error.message}`;updateControls();updateStatus()}
try{const preferredId=readDraft();bind();populateProducts(preferredId);updateControls();loadServerCatalog().catch(showServerError)}catch(error){byId("publishStatus").className="publish-status error";byId("publishStatus").textContent="Немає чернетки";byId("publishProductSummary").textContent=error.message;byId("versionCheck").textContent="Поверніться в admin.html, завантажте каталог і збережіть товар.";updateControls()}
