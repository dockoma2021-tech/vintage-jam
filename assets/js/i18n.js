let translations = {};

let currentLanguage = "uk";



export async function initLanguage() {


    const savedLanguage =
        localStorage.getItem(
            "language"
        );


    if (savedLanguage) {


        currentLanguage =
            savedLanguage;


    } else {


        const browserLanguage =
            navigator.language
            .substring(0,2);



        currentLanguage =
            browserLanguage === "en"
            ? "en"
            : "uk";


    }



    await loadTranslations();


}





async function loadTranslations() {


    const response =
        await fetch(
            "data/translations.json"
        );


    translations =
        await response.json();


}





export function changeLanguage(language) {


    currentLanguage =
        language;


    localStorage.setItem(
        "language",
        language
    );


    translatePage();

}





export function translatePage() {


    const elements =
        document.querySelectorAll(
            "[data-i18n]"
        );



    elements.forEach(
        element => {


            const key =
                element.dataset.i18n;



            if (
                translations[key]
            ) {


                element.textContent =
                translations[key][currentLanguage];


            }


        }
    );


}





export function t(key) {


    return translations[key]
    ? translations[key][currentLanguage]
    : key;


}





export function getLanguage() {


    return currentLanguage;


}
