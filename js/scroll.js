// 스크롤 방지를 위한 이벤트 리스너
window.addEventListener('wheel', function(e) {
    e.preventDefault();
}, { passive: false });

// HTML 요소 선택
let html = document.querySelector("html");

// 페이지 및 애니메이션 상태 초기화
let page = 1;
let lastPage = document.querySelectorAll(".content").length;
let isScrolling = false;

// 초기 스크롤 위치 설정
html.scrollTo({ top: 0, behavior: 'smooth' });

// 휠 및 터치 이벤트에 대한 공통 핸들러
function handleScroll(e) {
    // 만약 애니메이션이 진행 중이라면 리턴
    if (isAnimated()) return;

    // 이벤트의 형식에 따라 방향 결정
    let delta;
    if (e.deltaY) {
        delta = e.deltaY;
    } else if (e.touches && e.touches.length > 0) {
        delta = startY - e.touches[0].clientY;
        startY = e.touches[0].clientY;
    }

    // 마우스 휠이 내려갈 때
    if (delta > 0) {
        if (page == lastPage) {
            return;
        }
        page++;
    } 
    // 마우스 휠이 올라갈 때
    else if (delta < 0) {
        if (page == 1) {
            return;
        }
        page--;
    }

    // 새로운 페이지의 위치 계산 및 애니메이션 설정
    let posTop = (page - 1) * window.innerHeight;
    html.scrollTo({ top: posTop, behavior: 'smooth' });

    // 애니메이션 종료 감지를 위한 콜백 등록
    waitForAnimationCompletion();
}

// 터치 시작 위치 저장
let startY = 0;

// 터치 시작 이벤트 리스너 등록
window.addEventListener('touchstart', function(e) {
    startY = e.touches[0].clientY;
});

// 터치 이벤트 리스너 등록
window.addEventListener('touchmove', function(e) {
    // 스크롤 방지
    e.preventDefault();
    // 휠 및 터치 이벤트를 공통 핸들러로 전달
    handleScroll(e);
}, { passive: false });

// 애니메이션이 진행 중인지 확인하는 함수
function isAnimated() {
    return isScrolling;
}

// 애니메이션 종료 감지를 위한 함수
function waitForAnimationCompletion() {
    isScrolling = true;

    function onAnimationEnd() {
        isScrolling = false;
        window.removeEventListener('scroll', onAnimationEnd);
    }

    window.addEventListener('scroll', onAnimationEnd);
}
