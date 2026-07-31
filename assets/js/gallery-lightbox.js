const MAX_SCALE = 4;
const SWIPE_THRESHOLD = 54;

const state = {
    open: false,
    index: 0,
    scale: 1,
    x: 0,
    y: 0,
    pointers: new Map(),
    startDistance: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    lastTap: 0,
    previousFocus: null
};

const byId = id => document.getElementById(id);

function getSources() {
    return Array.from(document.querySelectorAll("#galleryThumbnails .gallery-thumbnail img"))
        .map(image => image.currentSrc || image.src)
        .filter(Boolean);
}

function getActiveIndex() {
    const buttons = Array.from(document.querySelectorAll("#galleryThumbnails .gallery-thumbnail"));
    const index = buttons.findIndex(button => button.classList.contains("active"));
    return index >= 0 ? index : 0;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function applyTransform() {
    const image = byId("lightboxImage");
    if (!image) return;
    image.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;
    image.classList.toggle("is-zoomed", state.scale > 1);
}

function resetTransform() {
    state.scale = 1;
    state.x = 0;
    state.y = 0;
    applyTransform();
}

function render() {
    const sources = getSources();
    if (!sources.length) return;

    state.index = (state.index + sources.length) % sources.length;
    const image = byId("lightboxImage");
    const counter = byId("lightboxCounter");
    const previous = byId("lightboxPrevious");
    const next = byId("lightboxNext");

    image.src = sources[state.index];
    image.alt = byId("mainProductImage")?.alt || "";
    counter.textContent = `${state.index + 1} / ${sources.length}`;
    previous.hidden = sources.length < 2;
    next.hidden = sources.length < 2;
    resetTransform();
}

function openLightbox() {
    const lightbox = byId("productLightbox");
    if (!lightbox || !getSources().length) return;

    state.previousFocus = document.activeElement;
    state.index = getActiveIndex();
    state.open = true;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    render();
    byId("lightboxClose")?.focus();
}

function closeLightbox() {
    const lightbox = byId("productLightbox");
    if (!lightbox || !state.open) return;

    state.open = false;
    state.pointers.clear();
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    resetTransform();
    state.previousFocus?.focus?.();
}

function changeImage(direction) {
    if (!state.open || getSources().length < 2) return;
    state.index += direction;
    render();
}

function pointerDistance() {
    const points = Array.from(state.pointers.values());
    if (points.length < 2) return 0;
    return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
}

function bindImageGestures() {
    const stage = byId("lightboxStage");
    if (!stage) return;

    stage.addEventListener("pointerdown", event => {
        if (event.target.closest("button")) return;
        stage.setPointerCapture?.(event.pointerId);
        state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (state.pointers.size === 1) {
            state.startX = event.clientX;
            state.startY = event.clientY;
        } else if (state.pointers.size === 2) {
            state.startDistance = pointerDistance();
            state.startScale = state.scale;
        }
    });

    stage.addEventListener("pointermove", event => {
        if (!state.pointers.has(event.pointerId)) return;
        const previous = state.pointers.get(event.pointerId);
        state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (state.pointers.size === 2) {
            const distance = pointerDistance();
            if (state.startDistance > 0) {
                state.scale = clamp(state.startScale * distance / state.startDistance, 1, MAX_SCALE);
                if (state.scale === 1) {
                    state.x = 0;
                    state.y = 0;
                }
                applyTransform();
            }
            return;
        }

        if (state.scale > 1) {
            state.x += event.clientX - previous.x;
            state.y += event.clientY - previous.y;
            applyTransform();
        }
    });

    stage.addEventListener("pointerup", event => {
        const startX = state.startX;
        const startY = state.startY;
        state.pointers.delete(event.pointerId);

        if (state.scale === 1 && state.pointers.size === 0) {
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            if (Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
                changeImage(deltaX < 0 ? 1 : -1);
            }
        }

        if (state.pointers.size < 2) state.startDistance = 0;
    });

    stage.addEventListener("pointercancel", event => {
        state.pointers.delete(event.pointerId);
        if (!state.pointers.size) state.startDistance = 0;
    });

    stage.addEventListener("click", event => {
        if (event.target.closest("button")) return;
        const now = Date.now();
        if (now - state.lastTap < 320) {
            if (state.scale > 1) resetTransform();
            else {
                state.scale = 2.4;
                applyTransform();
            }
            state.lastTap = 0;
        } else {
            state.lastTap = now;
        }
    });

    stage.addEventListener("wheel", event => {
        if (!state.open) return;
        event.preventDefault();
        state.scale = clamp(state.scale + (event.deltaY < 0 ? 0.25 : -0.25), 1, MAX_SCALE);
        if (state.scale === 1) {
            state.x = 0;
            state.y = 0;
        }
        applyTransform();
    }, { passive: false });
}

function initLightbox() {
    const mainImage = byId("mainProductImage");
    const wrapper = document.querySelector(".product-main-image-wrap");

    wrapper?.classList.add("can-open-lightbox");
    wrapper?.addEventListener("click", event => {
        if (event.target.closest(".gallery-arrow")) return;
        openLightbox();
    });

    mainImage?.setAttribute("title", "Open fullscreen gallery");
    byId("lightboxClose")?.addEventListener("click", closeLightbox);
    byId("lightboxPrevious")?.addEventListener("click", () => changeImage(-1));
    byId("lightboxNext")?.addEventListener("click", () => changeImage(1));

    byId("productLightbox")?.addEventListener("click", event => {
        if (event.target === byId("productLightbox")) closeLightbox();
    });

    document.addEventListener("keydown", event => {
        if (!state.open) return;
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") changeImage(-1);
        if (event.key === "ArrowRight") changeImage(1);
        if (event.key === "+" || event.key === "=") {
            state.scale = clamp(state.scale + 0.5, 1, MAX_SCALE);
            applyTransform();
        }
        if (event.key === "-") {
            state.scale = clamp(state.scale - 0.5, 1, MAX_SCALE);
            if (state.scale === 1) {
                state.x = 0;
                state.y = 0;
            }
            applyTransform();
        }
    });

    bindImageGestures();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLightbox, { once: true });
} else {
    initLightbox();
}
