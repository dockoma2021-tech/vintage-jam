const SWIPE_THRESHOLD = 48;

function getGalleryButtons() {
    return Array.from(document.querySelectorAll("#galleryThumbnails .gallery-thumbnail"));
}

function changeImage(direction) {
    const buttons = getGalleryButtons();
    if (buttons.length < 2) return;

    const activeIndex = buttons.findIndex(button => button.classList.contains("active"));
    const currentIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;

    buttons[nextIndex].click();
    buttons[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
    });
}

function initSwipeGallery() {
    const wrapper = document.querySelector(".product-main-image-wrap");
    if (!wrapper) return;

    wrapper.style.touchAction = "pan-y";

    let startX = 0;
    let startY = 0;
    let pointerId = null;

    wrapper.addEventListener("pointerdown", event => {
        if (event.pointerType === "mouse") return;
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSwipeGallery, { once: true });
} else {
    initSwipeGallery();
}
