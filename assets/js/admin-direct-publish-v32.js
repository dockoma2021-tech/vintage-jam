(() => {
  'use strict';
  const DRAFT_KEY='vintageJamAdminDraftV3';
  const KEY_SESSION='vintageJamAdminPublishKey';
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
  card.innerHTML=`<div class="panel-heading"><div><h2>Серверна публікація</h2><p>Введіть пароль публікації. GitHub-токен зберігається тільки на сервері Vercel.</p></div><span id="githubConnectionBadge" class="status-badge">Не підключено</span></div><div class="publish-connect-grid"><input id="adminPublishKey" type="password" autocomplete="current-password" placeholder="Пароль публікації"><button id="testGithub" type="button" class="secondary">Перевірити сервер</button></div><div class="token-note">Пароль зберігається лише до закриття вкладки. ZIP, експорт і ручна заміна файлів не потрібні.</div><div id="publishProgress" class="publish-progress">Готово до підключення.</div>`;
  document.querySelector('.admin-intro')?.after(card);

  const keyInput=byId('adminPublishKey');
  keyInput.value=sessionStorage.getItem(KEY_SESSION)||'';

  const publishButton=document.createElement('button');
  publishButton.type='button';
  publishButton.id='saveAndPublish';
  publishButton.className='publish-main';
  publishButton.textContent='Зберегти й опублікувати';
  document.querySelector('.sticky-actions')?.prepend(publishButton);
  const oldPublish=byId('markPublished'); if(oldPublish) oldPublish.hidden=true;
  const zipButton=byId('buildPackage'); if(zipButton) zipButton.hidden=true;

  document.addEventListener('change',event=>{
    if(event.target?.id==='photoInput'&&event.target.files?.length)capturedFiles=[...event.target.files];
  },true);
  byId('clearPhotos')?.addEventListener('click',()=>{capturedFiles=[];});

  function setProgress(text,type=''){
    const box=byId('publishProgress');
    box.textContent=text;
    box.className=`publish-progress${type?` ${type}`:''}`;
  }

  function getKey(){
    const key=keyInput.value.trim();
    if(!key)throw new Error('Введіть пароль публікації');
    sessionStorage.setItem(KEY_SESSION,key);
    return key;
  }

  async function server(payload){
    const response=await fetch('/api/publish',{
      method:'POST',
      headers:{'Content-Type':'application/json','X-Admin-Key':getKey()},
      body:JSON.stringify(payload)
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data.ok)throw new Error(data.error||`Сервер: ${response.status}`);
    return data;
  }

  function utf8Base64(text){
    const bytes=new TextEncoder().encode(text);
    let binary='';
    for(const byte of bytes)binary+=String.fromCharCode(byte);
    return btoa(binary);
  }

  async function blobBase64(blob){
    const buffer=await blob.arrayBuffer();
    const bytes=new Uint8Array(buffer);
    let binary='';
    const step=0x8000;
    for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,i+step));
    return btoa(binary);
  }

  async function convert(file){
    const source='createImageBitmap' in window?await createImageBitmap(file):await new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>{URL.revokeObjectURL(img.src);resolve(img)};
      img.onerror=reject;
      img.src=URL.createObjectURL(file);
    });
    const max=Number(byId('photoMax')?.value)||1600;
    const quality=Number(byId('photoQuality')?.value)||.82;
    const ratio=Math.min(1,max/Math.max(source.width,source.height));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(source.width*ratio));
    canvas.height=Math.max(1,Math.round(source.height*ratio));
    const ctx=canvas.getContext('2d',{alpha:false});
    ctx.fillStyle='#fff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(source,0,0,canvas.width,canvas.height);
    source.close?.();
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Не вдалося створити WebP')),'image/webp',quality));
  }

  function readDraft(){
    const raw=localStorage.getItem(DRAFT_KEY);
    if(!raw)throw new Error('Локальна чернетка не знайдена');
    const draft=JSON.parse(raw);
    if(!Array.isArray(draft.products))throw new Error('Чернетка пошкоджена');
    return draft;
  }

  function catalogContent(products){
    const data=window.VINTAGE_JAM_DATA||{};
    const payload={version:'3.3.0',generatedAt:new Date().toISOString(),site:data.site,contacts:data.contacts,shipping:data.shipping,payments:data.payments,categories:data.categories,products};
    return `window.VINTAGE_JAM_DATA = ${JSON.stringify(payload,null,2)};\n`;
  }

  async function putText(path,text,message){
    return server({action:'put',path,content:utf8Base64(text),message});
  }

  async function testConnection(){
    try{
      setProgress('Перевіряю Vercel і доступ до GitHub…');
      const result=await server({action:'test'});
      byId('githubConnectionBadge').className='status-badge ok';
      byId('githubConnectionBadge').textContent='Підключено';
      setProgress(`Сервер працює. Репозиторій: ${result.repository}.`,'ok');
    }catch(error){
      byId('githubConnectionBadge').className='status-badge error';
      byId('githubConnectionBadge').textContent='Помилка';
      setProgress(error.message,'error');
    }
  }

  async function publish(){
    publishButton.disabled=true;
    try{
      setProgress('1/5 Зберігаю товар…');
      form.requestSubmit();
      await new Promise(resolve=>setTimeout(resolve,300));
      const draft=readDraft();
      const id=fields.id.value.trim();
      if(!/^vj-\d{6}$/.test(id))throw new Error('Невірний ID товару');
      const product=draft.products.find(item=>item.id===id);
      if(!product)throw new Error('Товар не збережено у чернетку');
      if(product.publication_status==='published'&&(!product.title?.uk||!product.title?.en||!product.description?.uk||!product.description?.en))throw new Error('Для публікації заповніть назву й опис обома мовами');

      await server({action:'test'});

      if(capturedFiles.length){
        for(let i=0;i<capturedFiles.length;i++){
          setProgress(`2/5 Завантажую фотографії: ${i+1}/${capturedFiles.length}`);
          const blob=await convert(capturedFiles[i]);
          await server({
            action:'put',
            path:`images/products/${id}/${String(i+1).padStart(2,'0')}.webp`,
            content:await blobBase64(blob),
            message:`Upload ${id} photo ${i+1}`
          });
        }
      }else{
        setProgress('2/5 Нових фотографій немає — залишаю існуючі.');
      }

      setProgress('3/5 Оновлюю products.json…');
      await putText('data/products.json',`${JSON.stringify(draft.products,null,2)}\n`,`Update ${id} from Admin 3.3`);

      setProgress('4/5 Оновлюю каталог сайту…');
      await putText('data/catalog-data.js',catalogContent(draft.products),`Publish ${id} from Admin 3.3`);

      setProgress('5/5 Готово. GitHub прийняв зміни, Vercel запускає оновлення сайту.','ok');
      capturedFiles=[];
      byId('githubConnectionBadge').className='status-badge ok';
      byId('githubConnectionBadge').textContent='Опубліковано';
    }catch(error){
      setProgress(`Публікація не виконана: ${error.message}`,'error');
    }finally{
      publishButton.disabled=false;
    }
  }

  byId('testGithub').addEventListener('click',testConnection);
  publishButton.addEventListener('click',publish);
})();
