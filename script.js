// ========================
// DOM SELECTORS
// ========================

const timelineSection = document.querySelector(".timeline");
const track = document.querySelector(".timeline-track");
const cards = document.querySelectorAll(".project-card");

const prevButton = document.querySelector(".player-prev");
const nextButton = document.querySelector(".player-next");

const playerBar = document.getElementById("player-bar");
const playerProgress = document.querySelector(".player-bar-progress");
const playerTitle = document.querySelector(".player-title");
const playerSubtitle = document.querySelector(".player-subtitle");

const playerStart = document.querySelector(".player-start");
const playerEnd = document.querySelector(".player-end");

// ========================
// STATE
// ========================

let currentIndex = 0;

// ========================
// PLAYER TEXT
// ========================

function updatePlayerText(card) {
    if (!card) return;

    if (playerTitle) {
        playerTitle.textContent = card.dataset.title || "";
    }

    if (playerSubtitle) {
        playerSubtitle.textContent = card.dataset.subtitle || "";
    }

    if (playerStart) {
        playerStart.textContent = card.dataset.date || "";
    }

    if (playerEnd && cards.length > 0) {
        const lastCard = cards[cards.length - 1];
        playerEnd.textContent = lastCard.dataset.date || "";
    }
}

// ========================
// PLAYER BAR VISIBILITY
// ========================

function updatePlayerBarVisibility() {
    if (!timelineSection || !playerBar) return;

    const rect = timelineSection.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    playerBar.classList.toggle("is-visible", isVisible);
}

// ========================
// NAV BUTTON STATE
// ========================

function updateNavButtons() {
    if (prevButton) {
        prevButton.disabled = currentIndex === 0;
    }

    if (nextButton) {
        nextButton.disabled = currentIndex === cards.length - 1;
    }
}

// ========================
// MOVE TO CARD
// ========================

function goToCard(index) {
    if (!track || cards.length === 0) return;

    const safeIndex = Math.max(0, Math.min(index, cards.length - 1));
    const activeCard = cards[safeIndex];

    if (!activeCard) return;

    currentIndex = safeIndex;

    const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
    let translateX = cardCenter - window.innerWidth / 2;

    const maxTranslate = Math.max(track.scrollWidth - window.innerWidth, 0);
    translateX = Math.max(0, Math.min(translateX, maxTranslate));

    track.style.transform = `translateX(-${translateX}px)`;

    cards.forEach((card, i) => {
        card.classList.toggle("is-active", i === currentIndex);
    });

    updatePlayerText(activeCard);

    if (playerProgress) {
        if (cards.length > 1) {
            playerProgress.style.width = `${(currentIndex / (cards.length - 1)) * 100}%`;
        } else {
            playerProgress.style.width = "100%";
        }
    }

    updateNavButtons();
}

// ========================
// EVENTS
// ========================

if (prevButton) {
    prevButton.addEventListener("click", () => {
        goToCard(currentIndex - 1);
    });
}

if (nextButton) {
    nextButton.addEventListener("click", () => {
        goToCard(currentIndex + 1);
    });
}

window.addEventListener("scroll", updatePlayerBarVisibility);

window.addEventListener("resize", () => {
    goToCard(currentIndex);
    updatePlayerBarVisibility();
});

window.addEventListener("load", () => {
    if (cards.length > 0) {
        goToCard(0);
    }
    updatePlayerBarVisibility();
});

// ========================
// PAGE SECTION SCROLL (snap + timeline card jacking)
// ========================

(() => {
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const sectionEls = Array.from(document.querySelectorAll("main > section"));
    if (sectionEls.length === 0) return;

    const timelineSec = document.getElementById("timeline");

    const SCROLL_LOCK_MS = 850;
    const CARD_LOCK_MS = 500;
    const EDGE_THRESHOLD = 8;
    let isScrolling = false;

    function getCurrentIdx() {
        const viewportMid = window.scrollY + window.innerHeight / 2;
        let bestIdx = 0;
        let bestDist = Infinity;
        sectionEls.forEach((sec, i) => {
            const top = sec.offsetTop;
            const mid = top + sec.offsetHeight / 2;
            const dist = Math.abs(mid - viewportMid);
            if (dist < bestDist) {
                bestDist = dist;
                bestIdx = i;
            }
        });
        return bestIdx;
    }

    function scrollToSection(idx) {
        if (idx < 0 || idx >= sectionEls.length) return;
        isScrolling = true;
        sectionEls[idx].scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => { isScrolling = false; }, SCROLL_LOCK_MS);
    }

    function tryCardMove(goingDown) {
        const lastCardIdx = cards.length - 1;
        if (goingDown && currentIndex < lastCardIdx) {
            isScrolling = true;
            goToCard(currentIndex + 1);
            setTimeout(() => { isScrolling = false; }, CARD_LOCK_MS);
            return true;
        }
        if (!goingDown && currentIndex > 0) {
            isScrolling = true;
            goToCard(currentIndex - 1);
            setTimeout(() => { isScrolling = false; }, CARD_LOCK_MS);
            return true;
        }
        return false;
    }

    function handleDirection(goingDown, preventFn) {
        if (isScrolling) {
            preventFn();
            return;
        }

        const currentIdx = getCurrentIdx();
        const current = sectionEls[currentIdx];

        // Timeline 안: 카드 이동 우선
        if (current === timelineSec) {
            if (tryCardMove(goingDown)) {
                preventFn();
                return;
            }
            // 첫/마지막 카드면 fall through → 섹션 이동
        }

        const rect = current.getBoundingClientRect();
        const isTall = current.offsetHeight > window.innerHeight + EDGE_THRESHOLD;

        if (!isTall) {
            preventFn();
            scrollToSection(currentIdx + (goingDown ? 1 : -1));
            return;
        }

        // 긴 섹션: 끝 도달했을 때만 점프
        if (goingDown) {
            if (rect.bottom <= window.innerHeight + EDGE_THRESHOLD) {
                preventFn();
                scrollToSection(currentIdx + 1);
            }
        } else {
            if (rect.top >= -EDGE_THRESHOLD) {
                preventFn();
                scrollToSection(currentIdx - 1);
            }
        }
    }

    window.addEventListener("wheel", (e) => {
        if (Math.abs(e.deltaY) < 4) return;
        handleDirection(e.deltaY > 0, () => e.preventDefault());
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
        const downKeys = ["ArrowDown", "PageDown", " "];
        const upKeys = ["ArrowUp", "PageUp"];
        if (downKeys.includes(e.key)) {
            handleDirection(true, () => e.preventDefault());
        } else if (upKeys.includes(e.key)) {
            handleDirection(false, () => e.preventDefault());
        }
    });
})();

// ========================
// PRETEXT REFLOW (Hero description)
// ========================

(() => {
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const wrap = document.querySelector(".pretext-wrap");
    if (!wrap) return;

    const source = wrap.querySelector(".pretext-source");
    const canvas = wrap.querySelector(".pretext-canvas");
    if (!source || !canvas) return;

    function applyFallback(reason) {
        if (reason) console.warn("[pretext] fallback:", reason);
        wrap.classList.add("pretext-fallback");
    }

    const pretext = window.__pretext;
    if (!pretext) {
        applyFallback("pretext bundle not loaded");
        return;
    }

    const {
        prepareWithSegments,
        layoutNextLineRange,
        materializeLineRange,
    } = pretext;

    if (!prepareWithSegments || !layoutNextLineRange || !materializeLineRange) {
        applyFallback("pretext API missing");
        return;
    }

    const text = source.textContent.replace(/\s+/g, " ").trim();
    const computed = getComputedStyle(source);
    const fontSize = parseFloat(computed.fontSize);
    const lineHeight = parseFloat(computed.lineHeight) || fontSize * 1.8;
    const fontFamily = computed.fontFamily;
    const fontWeight = computed.fontWeight || "400";
    const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const textColor = "#b5b5b5";

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    let prepared = prepareWithSegments(text, fontStr);
    let canvasW = 0;
    let canvasH = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    const obstacleR = 36;

    function resize() {
        const rect = wrap.getBoundingClientRect();
        canvasW = rect.width;
        canvasH = rect.height;
        canvas.width = Math.max(1, Math.round(canvasW * dpr));
        canvas.height = Math.max(1, Math.round(canvasH * dpr));
        canvas.style.width = canvasW + "px";
        canvas.style.height = canvasH + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = fontStr;
        ctx.textBaseline = "top";
    }

    wrap.addEventListener("mousemove", (e) => {
        const rect = wrap.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    wrap.addEventListener("mouseleave", () => {
        mouseX = -9999;
        mouseY = -9999;
    });

    function cursorEq(a, b) {
        return a && b
            && a.segmentIndex === b.segmentIndex
            && a.graphemeIndex === b.graphemeIndex;
    }

    function render() {
        ctx.clearRect(0, 0, canvasW, canvasH);
        ctx.font = fontStr;
        ctx.fillStyle = textColor;
        ctx.textBaseline = "top";

        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let y = 0;
        const maxLines = 50;
        let safety = 0;

        const drawSegment = (startCursor, width, offsetX) => {
            if (width <= 20) return null;
            const range = layoutNextLineRange(prepared, startCursor, width);
            if (!range) return null;
            const line = materializeLineRange(prepared, range);
            if (line && line.text) ctx.fillText(line.text, offsetX, y);
            const nextC =
                range.end ||
                range.endCursor ||
                range.next ||
                range.nextCursor;
            if (!nextC || cursorEq(nextC, startCursor)) return null;
            return nextC;
        };

        while (y < canvasH && safety < maxLines) {
            const lineMid = y + lineHeight / 2;
            const dy = Math.abs(lineMid - mouseY);
            const inObstacle = dy < obstacleR;

            if (inObstacle) {
                // 원형 공식: 거리(dy)에 따라 갭 폭이 곡선으로 변함
                const halfGap = Math.sqrt(obstacleR * obstacleR - dy * dy) + 4;
                const leftW = Math.max(0, mouseX - halfGap);
                const rightX = mouseX + halfGap;
                const rightW = Math.max(0, canvasW - rightX);

                const afterLeft = drawSegment(cursor, leftW, 0);
                if (afterLeft) cursor = afterLeft;

                const afterRight = drawSegment(cursor, rightW, rightX);
                if (afterRight) cursor = afterRight;

                if (!afterLeft && !afterRight) break;
            } else {
                const next = drawSegment(cursor, canvasW, 0);
                if (!next) break;
                cursor = next;
            }

            y += lineHeight;
            safety++;
        }

        // obstacle (mint glow dot)
        if (mouseX > -1000) {
            ctx.shadowColor = "rgba(46, 230, 166, 0.6)";
            ctx.shadowBlur = 16;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#2ee6a6";
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", () => {
        resize();
        prepared = prepareWithSegments(text, fontStr);
    });
    render();
})();