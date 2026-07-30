import { loadTranslations } from "./i18n.js";
import { initCatalog } from "./catalog.js";


let currentLanguage = "uk";



async function startApp() {


    await loadTranslations(currentLanguage);


    initCatalog(currentLanguage);


    setupLanguageSwitcher();


}



function setupLanguageSwitcher() {


    const button = document.getElementById(
        "languageSwitcher"
    );


    if (!button) return;



    button.addEventListener(
        "click",
        () => {


            currentLanguage =
                currentLanguage === "uk"
                ? "en"
                : "uk";



            loadTranslations(
                currentLanguage
            );


            initCatalog(
                currentLanguage
            );


            button.textContent =
                currentLanguage.toUpperCase();


        }
    );

}



startApp();
