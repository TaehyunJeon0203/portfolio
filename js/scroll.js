window.addEventListener(`wheel`, function(e) {
    e.preventDefault();
}, { passive: false });

let html = document.querySelector("html");
let page = 1;
let lastPage = document.querySelectorAll(".content").length;

html.scrollTo({ top: 0, behavior: 'smooth' });

window.addEventListener(`wheel`, function(e) {
    // 만약 애니메이션이 진행 중이라면 리턴
    if (isAnimated(html)) return;

    // 마우스 휠 방향에 따라 페이지 이동
    if (e.deltaY > 0) {
        if (page == lastPage) {
            return;
            page++;
        }
    } else if (e.deltaY < 0) {
        if (page == 1) {
            return;
            page--;
        }
    }

    // 새로운 페이지의 위치계산 및 애니메이션 설정
    let posTop = (page -1) * this.window.innerHeight;
    html.scrollTo({ top: posTop, behavior: 'smooth' });
});

// 애니메이션이 진행 중인지 확인하는 함수
function isAnimated(element) {
    return getComputedStyle(element).getPropertyValue('scroll-behavior')
};