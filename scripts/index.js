const props = {
    props1 : {
        cardIcon: "assets/svgs/page.svg",
        cardTitle: "SPA friendly",
        cardDesc: "NuekJS is very much SPA friendly and can be used to create stunning single mode appliactions with dynamic content."
    },
    props2 : {
        cardIcon: "assets/svgs/feather.svg",
        cardTitle: "Lightweight",
        cardDesc: "NuekJS is very eaasy to use and integrate in any projects , ranging  from small scale projects like todo apps to rendering large structures of data like an ecommerce store"
    },
    props3 : {
        cardIcon: "assets/svgs/cross.svg",
        cardTitle: "Cross-framework",
        cardDesc: "NuekJS can be integrated to work well with other framneworks and libraries .eg React, Vue, Astro....as long as its not server based🤣 at least for now."
    }
}

const infoCard1 = new NuekComponent('.card-list', './components/InfoCard.nuek',props.props1);
const infoCard2 = new NuekComponent('.card-list', './components/InfoCard.nuek',props.props2);
const infoCard3 = new NuekComponent('.card-list', './components/InfoCard.nuek',props.props3);
const header = new NuekComponent('header','./components/Header.nuek');
const footer = new NuekComponent('footer','./components/Footer.nuek');

function reDirect(path){
    document.location.href = path;
    console.log("How far");
}

document.querySelector('.get-started').addEventListener("click", () => reDirect("./pages/get-started.html"))