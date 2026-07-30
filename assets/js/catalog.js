let products = [];

let categories = [];

let currentLanguage = "uk";



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



    items
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



    products

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
        document.createElement(
            "article"
        );


    card.className =
        "product-card";



    card.innerHTML = `

        <img 
            src="${product.media.images[0]}"
            alt="${product.title[currentLanguage]}"
        >


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


    if (
        product.price.type === "request"
    ) {

        return currentLanguage === "uk"
        ? "Ціна за запитом"
        : "Price on Request";

    }



    return `${product.price.value} ${product.price.currency}`;

}





function filterByCategory(categoryId) {


    const filtered =
        products.filter(product =>
            product.category === categoryId
        );


    renderCatalog(filtered);

}
