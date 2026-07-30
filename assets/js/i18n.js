let translations = {};

let currentLanguage = "uk";



export async function loadTranslations(language) {


    currentLanguage = language;


    const response = await fetch(
        "data/translations.json"
    );


    translations =
        await response.json();



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
                &&
                translations[key][currentLanguage]
            ) {


                element.textContent =
                    translations[key][currentLanguage];

            }


        }
    );

}





export function t(key) {


    if (
        translations[key]
        &&
        translations[key][currentLanguage]
    ) {

        return translations[key][currentLanguage];

    }


    return key;

}





export function getLanguage() {

    return currentLanguage;

}
