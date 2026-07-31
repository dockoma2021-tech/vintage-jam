const SWIPE_THRESHOLD = 48;
const IMAGE_CHANGE_DURATION = 160;

function getGalleryButtons() {
    return Array.from(document.querySelectorAll("#galleryThumbnails .gallery-thumbnail"));
}

function getActiveIndex(buttons = getGalleryButtons()) {
    const index = buttons.findIndex(button => button.classList.contains("active"));
    return index >= 0 ? index : 0;
}

function updateGalleryInterface() {
    const buttons = getGalleryButtons();
    const previous = document.getElementById("galleryPrevious");
    const next = document.getElementById("galleryNext");
    const counter = document.getElementById("galleryCounter");
    const hasMultipleImages = buttons.length > 1;

    if (previous) previous.hidden = !hasMultipleImages;
    if (next) next.hidden = !hasMultipleImages;

    if (counter) {
        counter.hidden = !hasMultipleImages;
        counter.textContent = hasMultipleImages
            ? `${getActiveIndex(buttons) + 1} / ${buttons.length}`
            : "";
    }

    const activeButton = buttons[getActiveIndex(buttons)];
    activeButton?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
    });
}

function animateMainImage() {
    const image = document.getElementById("mainProductImage");
    if (!image || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    image.classList.add("is-changing");
    window.setTimeout(() => image.classList.remove("is-changing"), IMAGE_CHANGE_DURATION);
}

function changeImage(direction) {
    const buttons = getGalleryButtons();
    if (buttons.length < 2) return;

    const currentIndex = getActiveIndex(buttons);
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;

    animateMainImage();
    buttons[nextIndex].click();
    window.requestAnimationFrame(updateGalleryInterface);
}

function bindControls() {
    document.getElementById("galleryPrevious")?.addEventListener("click", event => {
        event.stopPropagation();
        changeImage(-1);
    });

    document.getElementById("galleryNext")?.addEventListener("click", event => {
        event.stopPropagation();
        changeImage(1);
    });
}

function observeThumbnails() {
    const thumbnails = document.getElementById("galleryThumbnails");
    if (!thumbnails) return;

    thumbnails.addEventListener("click", event => {
        if (!event.target.closest(".gallery-thumbnail")) return;
        window.requestAnimationFrame(updateGalleryInterface);
    });

    const observer = new MutationObserver(() => {
        window.requestAnimationFrame(updateGalleryInterface);
    });

    observer.observe(thumbnails, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
    });
}

function bindSwipeAndKeyboard() {
    const wrapper = document.querySelector(".product-main-image-wrap");
    if (!wrapper) return;

    let startX = 0;
    let startY = 0;
    let pointerId = null;

    wrapper.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse" || event.target.closest(".gallery-arrow")) return;
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
    });

    wrapper.addEventListener("pointerup", event => {
        if (event.pointerId !== pointerId) return;

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        pointerId = null;

        if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) <= Math.abs(deltaY)) return;
        changeImage(deltaX < 0 ? 1 : -1);
    });

    wrapper.addEventListener("pointercancel", () => {
        pointerId = null;
    });

    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-roledescription", "carousel");
    wrapper.setAttribute("aria-label", "Product image gallery");

    wrapper.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            changeImage(-1);
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            changeImage(1);
        }
    });
}

function initGalleryControls() {
    bindControls();
    bindSwipeAndKeyboard();
    observeThumbnails();
    updateGalleryInterface();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGalleryControls, { once: true });
} else {
    initGalleryControls();
}
