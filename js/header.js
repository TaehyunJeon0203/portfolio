const header = document.getElementById("header");

window.addEventListener('scroll', () => {
    if (window.scrollY > 1) {
        header.classList.replace('header-fixed', 'header-scrolling');
    } else {
        header.classList.replace('header-scrolling', 'header-fixed');
    }
});

window.addEventListener("scroll", (e) => {
    console.log("y", window.scrollY);
  });