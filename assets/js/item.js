import { getLanguage } from "./i18n.js";


let product = null;



async function loadItem() {


    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");



    if (!id) return;



    const response =
        await fetch(
            "data/products.json"
        );


    const products =
        await response.json();



    product =
        products.find(
            item => item.id === id
        );



    if (!product) {


        document.body.innerHTML =
        "Product not found";


        return;

    }



    renderProduct();

}





function renderProduct() {


    const lang =
        getLanguage();



    renderGallery();


    renderTitle(lang);


    renderDescription(lang);


    renderPrice(lang);


    renderAttributes(lang);


    renderMedia();


    renderContacts();

}





function renderGallery() {


    const container =
        document.getElementById(
            "gallery"
        );


    if (!container) return;



    container.innerHTML = "";



    product.media.images.forEach(
        image => {


            const img =
                document.createElement(
                    "img"
                );


            img.src = image;


            container.appendChild(img);


        }
    );

}





function renderTitle(lang) {


    document.getElementById(
        "productTitle"
    )
    .textContent =
    product.title[lang];


}





function renderDescription(lang) {


    document.getElementById(
        "productDescription"
    )
    .textContent =
    product.description[lang];

}





function renderPrice(lang) {


    const price =
        document.getElementById(
            "productPrice"
        );



    if (
        product.price.type === "request"
    ) {


        price.textContent =
        lang === "uk"
        ? "Ціна за запитом"
        : "Price on Request";


        return;

    }



    price.textContent =
    `${product.price.value} ${product.price.currency}`;

}





function renderAttributes(lang) {


    const container =
        document.getElementById(
            "attributes"
        );



    if (!container) return;



    container.innerHTML = "";



    Object.entries(
        product.attributes
    )
    .forEach(([key,value]) => {


        const item =
        document.createElement(
            "div"
        );



        if (
            typeof value === "object"
        ) {

            value =
            value[lang];

        }



        item.textContent =
        `${key}: ${value}`;



        container.appendChild(item);


    });


}





function renderMedia() {


    const container =
        document.getElementById(
            "media"
        );


    if (!container) return;



    container.innerHTML = "";



    if(product.media.youtube){


        container.innerHTML += `

        <a href="${product.media.youtube}"
        target="_blank">

        ▶️ Відеоогляд

        </a>

        `;

    }



    if(product.media.shorts){


        container.innerHTML += `

        <a href="${product.media.shorts}"
        target="_blank">

        🎬 Shorts

        </a>

        `;

    }

}





function renderContacts() {


    const button =
        document.getElementById(
            "contactButton"
        );


    if (!button) return;



    button.href =
    "https://t.me/your_username";

}





loadItem();
