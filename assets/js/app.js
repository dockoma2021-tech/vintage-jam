import { 
    initLanguage,
    changeLanguage,
    getLanguage
} from "./i18n.js";


import { 
    initCatalog,
    searchProducts
} from "./catalog.js";



async function startApp() {


    await initLanguage();


    await initCatalog(
        getLanguage()
    );


    setupLanguageSwitcher();

    setupSearch();


}





function setupSearch(){


    const input =
        document.getElementById(
            "searchInput"
        );


    if(!input) return;



    input.addEventListener(
        "input",
        (event)=>{


            searchProducts(
                event.target.value
            );


        }
    );


}






function setupLanguageSwitcher() {


    const button =
        document.getElementById(
            "languageSwitcher"
        );


    if (!button) return;



    button.textContent =
        getLanguage()
        .toUpperCase();




    button.addEventListener(
        "click",
        async () => {


            const newLanguage =
                getLanguage() === "uk"
                ? "en"
                : "uk";



            changeLanguage(
                newLanguage
            );



            await initCatalog(
                newLanguage
            );



            button.textContent =
                newLanguage.toUpperCase();


        }
    );


}





startApp();
