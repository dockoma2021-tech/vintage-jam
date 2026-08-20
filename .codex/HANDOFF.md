# Codex Handoff

## Task

Выполнить ЭТАП 1 стабилизации Vintage Jam: конвертировать правильный Watches hero, объединить конфликтующую hero-логику в один renderer, перевести навигацию на `data-category-id`, отключить старые hotfix-скрипты и проверить desktop/mobile без изменения данных и дизайна.

## Result

Подтверждено, что `watches-category-v71.jpg` — нужный баннер с пятью часами, но с PNG-сигнатурой. Без генерации и изменения композиции он конвертирован в настоящий WebP 1672×941. Embedded Icons WebP вынесен из JavaScript в обычный WebP 480×270.

Создан единый `category-heroes-v72.js`, управляющий hero DOM, изображениями/collage и кликами. Все карточки получают `data-category-id`. Hero CSS вынесен в `category-heroes-v72.css`. Router переведён с DOM-индексов на ID; удалены его hero-handler, динамические стили, таймерный scroll hotfix и monkey patch. Старые v43/v47/v48/v49/v52 отключены в `index.html`, но физически сохранены.

## Changed files

- `.codex/HANDOFF.md`
- `index.html`
- `assets/css/category-heroes-v72.css`
- `assets/js/category-heroes-v72.js`
- `assets/js/navigation-router-v60.js`
- `assets/js/top-category-nav-v40.js`
- `assets/images/categories/watches-category-hero.webp`
- `assets/images/categories/icons-category-hero.webp`

## Checks

- Перед изменениями выполнен `git pull --ff-only origin main`; дерево было чистым.
- `node --check` выполнен для всех подключённых JavaScript-файлов: syntax errors отсутствуют.
- `git diff --check` прошёл.
- Подтверждено отсутствие старых v43/v47/v48/v49/v52 среди активных подключений.
- В новом hero renderer/router отсутствуют base64, Blob URL, fetch hero, dynamic `<style>`, `replaceChildren`, timer hotfix и monkey patch `scrollIntoView`.
- Новые assets имеют сигнатуру `RIFF/WEBP`; Pillow: Watches WEBP 1672×941 RGB, Icons WEBP 480×270 RGB.
- Browser 1440×900, 390×844 и 430×900: страница отображается, horizontal overflow отсутствует.
- Клики Paintings, Icons и Watches формируют правильный URL и активируют соответствующий `data-category-id`.
- Watches загружается обычным локальным WebP (`complete=true`, natural size 1672×941).
- Browser console errors/warnings и error overlay отсутствуют; hero-assets успешно отдаются без 404.
- `python tools/validate_site.py` сообщает только ранее известные отсутствующие `vj-000009/11.webp`–`20.webp`, явно исключённые пользователем из этого этапа.

## Problems found

- Общая проверка проекта остаётся красной только из-за отсутствующих `vj-000009/11.webp`–`20.webp`; проблема существовала до этапа и исключена пользователем.
- Отключённые hero/hotfix-файлы и старые временные assets остаются в репозитории до отдельного этапа удаления.
- `/favicon.ico` может по-прежнему возвращать 404; это вне scope hero-стабилизации.

## Decisions

- Сохранить исходную Watches-композицию с пятью часами и только перекодировать её в настоящий WebP.
- Для Icons использовать существующий корректный visual source, но хранить его обычным asset вместо embedded JavaScript.
- Renderer является единственным владельцем hero DOM и hero-кликов; router владеет catalog view и URL.
- Категории сопоставляются по `data-category-id`; текстовое сопоставление оставлено только как bootstrap fallback для существующих category buttons до назначения dataset.
- Не удалять legacy-файлы и не затрагивать данные товаров, цены, тексты, контакты, header/footer, Vercel config и vj-000009.

## Remaining work

1. После production/Vercel-проверки отдельным этапом удалить отключённые legacy hero/hotfix-файлы и временные assets.
2. Отдельно исправить отсутствующие `vj-000009/11.webp`–`20.webp` или ссылки на них.
3. При необходимости отдельно устранить `/favicon.ico` 404.

## Git

Branch: `main`
Commit SHA: см. commit, содержащий этот handoff; точный SHA указан в итоговом отчёте Codex
Push status: ожидает commit и push после финальной проверки staged diff
