let products = [];

let categories = [];

let currentLanguage = "uk";

let activeCategory = null;

let currentSort = "new";



export async function initCatalog(language = "uk") {


    currentLanguage = language;


    await loadData();


    renderCategories();


    renderNewArrivals();


    renderCatalog();


    renderSold();

}





async function loadData() {


    const productsResponse =
        await fetch("data/products.json");


    products =
        await productsResponse.json();



    const categoriesResponse =
        await fetch("data/categories.json");


    categories =
        await categoriesResponse.json();


}





function sortProducts(items){


    let sorted =
    [...items];



    switch(currentSort){


        case "new":

            sorted.sort(
                (a,b)=>
                new Date(b.date_added)
                -
                new Date(a.date_added)
            );

            break;



        case "old":

            sorted.sort(
                (a,b)=>
                new Date(a.date_added)
                -
                new Date(b.date_added)
            );

            break;



        case "price_up":

            sorted.sort(
                (a,b)=>
                (a.price.value || 0)
                -
                (b.price.value || 0)
            );

            break;



        case "price_down":

            sorted.sort(
                (a,b)=>
                (b.price.value || 0)
                -
                (a.price.value || 0)
            );

            break;

    }



    return sorted;

}





function isNew(date){


    if(!date) return false;


    const added =
    new Date(date);


    const now =
    new Date();


    const days =
    (now - added)
    /
    (1000 * 60 * 60 * 24);



    return days <= 30;

}





function renderCategories() {


    const container =
        document.getElementById(
            "categories"
        );


    if (!container) return;



    container.innerHTML = "";



    categories.forEach(category => {


        const button =
            document.createElement(
                "button"
            );


        button.className =
            "category-item";


        button.textContent =
            category.title[currentLanguage];



        button.onclick = () => {


            filterByCategory(
                category.id
            );


        };



        container.appendChild(button);


    });


}





function renderCatalog(items = products) {


    const container =
        document.getElementById(
            "catalog"
        );


    if (!container) return;



    container.innerHTML = "";



    sortProducts(items)

        .filter(product =>
            product.publication_status === "published"
        )

        .forEach(product => {


            container.appendChild(
                createProductCard(product)
            );


        });


}





function renderNewArrivals() {


    const container =
        document.getElementById(
            "newArrivals"
        );


    if (!container) return;



    container.innerHTML = "";



    sortProducts(products)

        .filter(product =>
            product.publication_status === "published"
        )

        .filter(product =>
            product.sale_status === "available"
        )

        .slice(0,8)

        .forEach(product => {


            container.appendChild(
                createProductCard(product)
            );


        });


}





function renderSold() {


    const container =
        document.getElementById(
            "soldProducts"
        );


    if (!container) return;



    container.innerHTML = "";



    products

        .filter(product =>
            product.sale_status === "sold"
        )

        .forEach(product => {


            container.appendChild(
                createProductCard(product)
            );


        });


}





function createProductCard(product) {


    const card =
        document.createElement("article");



    card.className =
        "product-card";



    let badge = "";



    if(product.sale_status === "sold"){


        badge = `
        <span class="badge sold">
        SOLD
        </span>`;


    }

    else if(product.sale_status === "reserved"){


        badge = `
        <span class="badge reserved">
        RESERVED
        </span>`;


    }

    else if(isNew(product.date_added)){


        badge = `
        <span class="badge new">
        NEW
        </span>`;

    }





    card.innerHTML = `


        <div class="product-image">


            ${badge}


            <img

            src="${product.media.images[0]}"

            alt="${product.title[currentLanguage]}"

            >


        </div>




        <div class="product-info">


            <div class="product-title">

                ${product.title[currentLanguage]}

            </div>



            <div class="product-category">

                ${product.category}

            </div>



            <div class="product-price">

                ${formatPrice(product)}

            </div>


        </div>


    `;



  card.onclick = () => {


    window.location.href =
    `item.html?id=${product.id}`;


};



return card;


}


function formatPrice(product) {


    if(
        product.price.type === "request"
    ){

        return currentLanguage === "uk"

        ? "Ціна за запитом"

        : "Price on Request";


    }



    return `${product.price.value} ${product.price.currency}`;

}





function filterByCategory(categoryId) {


    activeCategory =
    categoryId;



    const filtered =
        products.filter(product =>

            product.category === categoryId

        );



    renderCatalog(filtered);


}





export function searchProducts(query) {


    query =
    query.toLowerCase().trim();



    if(!query){


        renderCatalog(products);


        return;


    }



    const result =
    products.filter(product => {


        const title =
        product.title[currentLanguage]
        ?.toLowerCase() || "";



        const description =
        product.description[currentLanguage]
        ?.toLowerCase() || "";



        const category =
        product.category
        ?.toLowerCase() || "";



        return (

            title.includes(query)

            ||

            description.includes(query)

            ||

            category.includes(query)

        );


    });



    renderCatalog(result);


}





export function setSort(value){


    currentSort =
    value;


    renderCatalog();


}
