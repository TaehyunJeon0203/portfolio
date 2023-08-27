const progressBar = document.getElementsByClassName("home-progress-bar");

const getPercent = () => {
    const birth = new Date(2002, 3, 27);
    const today = new Date();
    const retire = new Date(2037, 2, 27);
    
    const total = retire.getTime() - birth.getTime();
    let position = today.getTime() - birth.getTime();
    let percent = (position / total) * 100;
    
    return percent;
}

const updatePercent = (nowPercent) => {
    progressBar[0].style.width = `${nowPercent}%`;
}

updatePercent(getPercent());
setInterval(updatePercent(getPercent), 10800000);

