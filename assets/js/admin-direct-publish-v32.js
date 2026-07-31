(() => {
  'use strict';
  const OWNER='dockoma2021-tech', REPO='vintage-jam', BRANCH='main';
  const DRAFT_KEY='vintageJamAdminDraftV3';
  const TOKEN_SESSION='vintageJamGithubTokenSession';
  const TOKEN_LOCAL='vintageJamGithubTokenRemembered';
  const byId=id=>document.getElementById(id);
  const form=byId('productForm');
  if(!form)return;
  const fields=form.elements;
  let capturedFiles=[];

  const style=document.createElement('style');
  style.textContent=`.publish-connect{display:grid;gap:12px}.publish-connect-grid{display:grid;grid-template-columns:1fr auto;gap:10px}.publish-connect input{width:100%;border:1px solid var(--line);border-radius:11px;padding:12px}.publish-progress{white-space:pre-wrap;padding:12px;border-radius:12px;background:#f5f5f7;color:#1d1d1f}.publish-progress.ok{background:#ecfdf3;color:#067647}.publish-progress.error{background:#fff3f2;color:#b42318}.publish-main{background:#34c759!important}.token-note{font-size:13px;color:var(--muted)}@media(max-width:600px){.publish-connect-grid{grid-template-columns:1fr}.publish-connect-grid button{width:100%}}`;
  document.head.append(style);

  const card=document.createElement('section');
  card.className='admin-card publish-connect';
  card.innerHTML=`<div class="panel-heading"><div><h2>Пряма публікація</h2><p>Один раз підключіть GitHub, далі використовуйте одну кнопку.</p></div><span id="githubConnectionBadge" class="status-badge">Не підключено</span></div><div class="publish-connect-grid"><input id="githubToken" type="password" autocomplete="off" placeholder="GitHub fine-grained token"><button id="testGithub" type="button" class="secondary">Перевірити підключення</button></div><label class="token-note"><input id="rememberGithub" type="checkbox"> Запам’ятати токен на цьому пристрої</label><div class="token-note">Доступ має бути лише до репозиторію <b>${OWNER}/${REPO}</b> з правом <b>Contents: Read and write</b>. Токен не додається у файли сайту.</div><div id="publishProgress" class="publish-progress">Готово до налаштування.</div>`;
  document.querySelector('.admin-intro')?.after(card);

  const tokenInput=byId('githubToken');
  const remembered=localStorage.getItem(TOKEN_LOCAL)||'';
  const session=sessionStorage.getItem(TOKEN_SESSION)||'';
  tokenInput.value=session||remembered;
  byId('rememberGithub').checked=Boolean(remembered);
  if(tokenInput.value) byId('githubConnectionBadge').textContent='Токен збережено';

  const publishButton=document.createElement('button');
  publishButton.type='button';
  publishButton.id='saveAndPublish';
  publishButton.className='publish-main';
  publishButton.textContent='Зберегти й опублікувати';
  document.querySelector('.sticky-actions')?.prepend(publishButton);
  const oldPublish=byId('markPublished'); if(oldPublish) oldPublish.hidden=true;
  const zipButton=byId('buildPackage'); if(zipButton) zipButton.hidden=true;

  document.addEventListener('change',event=>{
    if(event.target?.id==='photoInput' && event.target.files?.length) capturedFiles=[...event.target.files];
  },true);
  byId('clearPhotos')?.addEventListener('click',()=>{capturedFiles=[];});

  function setProgress(text,type=''){
    const box=byId('publishProgress'); box.textContent=text; box.className=`publish-progress${type?` ${type}`:''}`;
  }
  function saveToken(){
    const token=tokenInput.value.trim();
    if(!token) throw new Error('Вставте GitHub token');
    sessionStorage.setItem(TOKEN_SESSION,token);
    if(byId('rememberGithub').checked) localStorage.setItem(TOKEN_LOCAL,token); else localStorage.removeItem(TOKEN_LOCAL);
    return token;
  }
  async function api(path,options={}){
    const token=saveToken();
    const response=await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${path}`,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...(options.headers||{})}});
    if(response.status===404 && options.allow404)return null;
    const data=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(data.message||`GitHub: ${response.status}`);
    return data;
  }
  function utf8Base64(text){
    const bytes=new TextEncoder().encode(text); let binary=''; for(const byte of bytes)binary+=String.fromCharCode(byte); return btoa(binary);
  }
  async function blobBase64(blob){
    const buffer=await blob.arrayBuffer(); const bytes=new Uint8Array(buffer); let binary=''; const step=0x8000; for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step)); return btoa(binary);
  }
  async function putFile(path,content,message,isBinary=false){
    const current=await api(`/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${BRANCH}`,{allow404:true});
    const body={message,content:isBinary?await blobBase64(content):utf8Base64(content),branch:BRANCH};
    if(current?.sha) body.sha=current.sha;
    return api(`/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  }
  async function convert(file){
    const source='createImageBitmap' in window?await createImageBitmap(file):await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{URL.revokeObjectURL(img.src);resolve(img)};img.onerror=reject;img.src=URL.createObjectURL(file)});
    const max=Number(byId('photoMax')?.value)||1600, quality=Number(byId('photoQuality')?.value)||.82;
    const ratio=Math.min(1,max/Math.max(source.width,source.height));
    const canvas=document.createElement('canvas'); canvas.width=Math.max(1,Math.round(source.width*ratio)); canvas.height=Math.max(1,Math.round(source.height*ratio));
    const ctx=canvas.getContext('2d',{alpha:false}); ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(source,0,0,canvas.width,canvas.height); source.close?.();
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Не вдалося створити WebP')),'image/webp',quality));
  }
  function readDraft(){
    const raw=localStorage.getItem(DRAFT_KEY); if(!raw) throw new Error('Локальна чернетка не знайдена');
    const draft=JSON.parse(raw); if(!Array.isArray(draft.products)) throw new Error('Чернетка пошкоджена'); return draft;
  }
  function catalogContent(products){
    const data=window.VINTAGE_JAM_DATA||{};
    const payload={version:'3.2.0',generatedAt:new Date().toISOString(),site:data.site,contacts:data.contacts,shipping:data.shipping,payments:data.payments,categories:data.categories,products};
    return `window.VINTAGE_JAM_DATA = ${JSON.stringify(payload,null,2)};\n`;
  }
  async function testConnection(){
    try{ setProgress('Перевіряю доступ до GitHub…'); const repo=await api(''); byId('githubConnectionBadge').className='status-badge ok'; byId('githubConnectionBadge').textContent='Підключено'; setProgress(`Підключено: ${repo.full_name}. Можна публікувати.`,'ok'); }
    catch(error){ byId('githubConnectionBadge').className='status-badge error'; byId('githubConnectionBadge').textContent='Помилка'; setProgress(error.message,'error'); }
  }
  async function publish(){
    publishButton.disabled=true;
    try{
      setProgress('1/5 Зберігаю товар локально…'); form.requestSubmit(); await new Promise(resolve=>setTimeout(resolve,250));
      const draft=readDraft(); const id=fields.id.value.trim(); if(!/^vj-\d{6}$/.test(id)) throw new Error('Невірний ID товару');
      const product=draft.products.find(item=>item.id===id); if(!product) throw new Error('Товар не потрапив у чернетку');
      if(product.publication_status==='published' && (!product.title?.uk||!product.title?.en||!product.description?.uk||!product.description?.en)) throw new Error('Для публікації заповніть назву й опис обома мовами');
      await testConnection();
      if(capturedFiles.length){
        setProgress(`2/5 Завантажую фотографії: 0/${capturedFiles.length}`);
        for(let i=0;i<capturedFiles.length;i++){
          const blob=await convert(capturedFiles[i]); const path=`images/products/${id}/${String(i+1).padStart(2,'0')}.webp`;
          await putFile(path,blob,`Upload ${id} photo ${i+1}`,true);
          setProgress(`2/5 Завантажую фотографії: ${i+1}/${capturedFiles.length}`);
        }
      } else setProgress('2/5 Нових фотографій немає — залишаю існуючі.');
      setProgress('3/5 Оновлюю products.json…');
      await putFile('data/products.json',`${JSON.stringify(draft.products,null,2)}\n`,`Update catalog from Admin 3.2`);
      setProgress('4/5 Оновлюю catalog-data.js…');
      await putFile('data/catalog-data.js',catalogContent(draft.products),`Publish ${id} from Admin 3.2`);
      setProgress('5/5 GitHub прийняв зміни. Pages deployment запущено. Зазвичай сайт оновлюється протягом кількох хвилин.','ok');
      capturedFiles=[];
      byId('githubConnectionBadge').className='status-badge ok'; byId('githubConnectionBadge').textContent='Опубліковано';
    }catch(error){ setProgress(`Публікація не виконана: ${error.message}`,'error'); }
    finally{ publishButton.disabled=false; }
  }
  byId('testGithub').addEventListener('click',testConnection);
  publishButton.addEventListener('click',publish);
})();
