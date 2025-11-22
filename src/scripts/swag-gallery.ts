// Gallery management for Swag page
// Handles card galleries and showcase slider interactions

export function initCardGalleries() {
    const galleries = document.querySelectorAll("[data-card-gallery]");

    galleries.forEach((gallery) => {
        const track = gallery.querySelector("[data-gallery-track]") as HTMLElement | null;
        const slides = Array.from(track?.children ?? []);

        if (!track || slides.length <= 1) {
            gallery.classList.add("swag-card-gallery--static");
            return;
        }

        const prev = gallery.querySelector("[data-gallery-prev]") as HTMLButtonElement | null;
        const next = gallery.querySelector("[data-gallery-next]") as HTMLButtonElement | null;
        const dots = Array.from(
            gallery.querySelectorAll("[data-gallery-dot]")
        ) as HTMLButtonElement[];
        const viewport = gallery.querySelector("[data-gallery-viewport]") as HTMLElement | null;
        const badge = gallery.querySelector("[data-gallery-badge]") as HTMLElement | null;
        const totalSlides = slides.length;
        let current = 0;

        const normalize = (value: number): number => {
            const total = slides.length;
            return ((value % total) + total) % total;
        };

        const update = () => {
            const slideWidth = viewport?.getBoundingClientRect().width ?? 0;
            track.style.transform = `translate3d(-${current * slideWidth}px, 0, 0)`;

            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle(
                    "swag-card-gallery__dot--active",
                    dotIndex === current
                );
            });

            if (badge) {
                badge.textContent = `${String(current + 1).padStart(2, "0")} / ${String(
                    totalSlides
                ).padStart(2, "0")}`;
            }
        };

        const goTo = (nextIndex: number) => {
            current = normalize(nextIndex);
            update();
        };

        prev?.addEventListener("click", () => goTo(current - 1));
        next?.addEventListener("click", () => goTo(current + 1));
        dots.forEach((dot, dotIndex) => {
            dot.addEventListener("click", () => goTo(dotIndex));
        });

        let pointerDown = false;
        let startX = 0;

        const handlePointerDown = (event: PointerEvent) => {
            pointerDown = true;
            startX = event.clientX;
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (!pointerDown) return;
            const delta = event.clientX - startX;
            if (Math.abs(delta) > 30) {
                goTo(delta < 0 ? current + 1 : current - 1);
            }
            pointerDown = false;
        };

        viewport?.addEventListener("pointerdown", handlePointerDown);
        viewport?.addEventListener("pointerup", handlePointerUp);
        viewport?.addEventListener("pointerleave", () => {
            pointerDown = false;
        });
        window.addEventListener("pointerup", handlePointerUp);

        const handleResize = () => {
            track.style.transition = "none";
            update();
            requestAnimationFrame(() => {
                track.style.transition =
                    "transform 420ms cubic-bezier(0.25, 0.8, 0.25, 1)";
            });
        };

        window.addEventListener("resize", handleResize);

        update();
    });
}

export function initShowcaseSlider() {
    const slider = document.querySelector("[data-showcase-slider]") as HTMLElement | null;
    if (!slider) return;

    const track = slider.querySelector("[data-showcase-track]") as HTMLElement | null;
    const slides = Array.from(track?.children ?? []);
    if (!track || slides.length <= 1) return;

    const prevBtn = slider.querySelector("[data-showcase-prev]") as HTMLButtonElement | null;
    const nextBtn = slider.querySelector("[data-showcase-next]") as HTMLButtonElement | null;
    const dots = Array.from(slider.querySelectorAll("[data-showcase-dot]")) as HTMLButtonElement[];
    const viewport = slider.querySelector(".swag-showcase__viewport") as HTMLElement | null;

    let index = 0;
    let autoPlayId: number | undefined;
    const AUTO_PLAY_INTERVAL = 6500;

    const normalize = (value: number): number => {
        const total = slides.length;
        return ((value % total) + total) % total;
    };

    const render = () => {
        track.setAttribute("data-current", String(index));
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle(
                "swag-showcase__dot--active",
                dotIndex === index
            );
        });
    };

    const goTo = (nextIndex: number) => {
        index = normalize(nextIndex);
        render();
    };

    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayId = window.setInterval(() => {
            goTo(index + 1);
        }, AUTO_PLAY_INTERVAL);
    };

    const stopAutoPlay = () => {
        if (typeof autoPlayId === "number") {
            window.clearInterval(autoPlayId);
            autoPlayId = undefined;
        }
    };

    prevBtn?.addEventListener("click", () => {
        goTo(index - 1);
        startAutoPlay();
    });
    nextBtn?.addEventListener("click", () => {
        goTo(index + 1);
        startAutoPlay();
    });
    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => {
            goTo(dotIndex);
            startAutoPlay();
        });
    });

    let isPointerDown = false;
    let startX = 0;

    const handlePointerDown = (event: PointerEvent) => {
        isPointerDown = true;
        startX = event.clientX;
    };

    const handlePointerUp = (event: PointerEvent) => {
        if (!isPointerDown) return;
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 40) {
            goTo(delta < 0 ? index + 1 : index - 1);
        }
        isPointerDown = false;
    };

    viewport?.addEventListener("pointerdown", (event) => {
        stopAutoPlay();
        handlePointerDown(event);
    });
    viewport?.addEventListener("pointerup", (event) => {
        handlePointerUp(event);
        startAutoPlay();
    });
    viewport?.addEventListener("pointerleave", () => {
        isPointerDown = false;
        startAutoPlay();
    });
    window.addEventListener("pointerup", (event) => {
        handlePointerUp(event);
        startAutoPlay();
    });

    slider.addEventListener("mouseenter", stopAutoPlay);
    slider.addEventListener("mouseleave", startAutoPlay);
    slider.addEventListener("focusin", stopAutoPlay);
    slider.addEventListener("focusout", startAutoPlay);

    render();
    startAutoPlay();
}

// Initialize all gallery components
export function init() {
    if (typeof window === "undefined") return;
    initShowcaseSlider();
    initCardGalleries();
}
