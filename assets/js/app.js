import { 
    initLanguage,
    changeLanguage,
    getLanguage
} from "./i18n.js";

import { 
    initCatalog
} from "./catalog.js";



async function startApp() {


    await initLanguage();


    initCatalog(
        getLanguage()
    );


    setupLanguageSwitcher();

}



function setupLanguageSwitcher() {


    const button =
        document.getElementById(
            "languageSwitcher"
        );


    if (!button) return;



    button.addEventListener(
        "click",
        () => {


            const newLanguage =
                getLanguage() === "uk"
                ? "en"
                : "uk";



            changeLanguage(
                newLanguage
            );



            initCatalog(
                newLanguage
            );


            button.textContent =
                newLanguage.toUpperCase();


        }
    );


}



startApp();
