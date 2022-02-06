const navBtn = document.querySelector("#nav-icon");
const nav = document.querySelector("#nav-menu-parent");
const navBg = document.querySelector(".menu-bg");
const droneBtn = document.querySelector(".drone-btn");
const droneMenu = document.querySelector("#drone-sub-parent");
const eqdbBtn = document.querySelector(".eqdb-btn");
const eqdbMenu = document.querySelector("#eqdb-sub-parent");

var isNavOpen = false;

function toggleNav() {
    if (!isNavOpen) {
        nav.classList.add("show-nav-index");
        nav.classList.add("show-nav");
        navBtn.classList.remove("md-inactive");
        isNavOpen = true;
    }
    else {
        droneMenu.classList.remove("show-sub");
        eqdbMenu.classList.remove("show-sub");
        nav.classList.remove("show-nav");
        navBtn.classList.add("md-inactive");
        setTimeout(() => {
            nav.classList.remove("show-nav-index");
            isNavOpen = false;
        }, 400)
    }
}

navBtn.addEventListener("click", () => {
    toggleNav();
});

navBg.addEventListener("click", () => {
    toggleNav();
});

droneBtn.addEventListener("click", () => {
    droneMenu.classList.toggle("show-sub");
});

eqdbBtn.addEventListener("click", () => {
    eqdbMenu.classList.toggle("show-sub");
});