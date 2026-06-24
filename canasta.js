(function () {
    const guestCartKey = "technova_cart_guest";
    const sessionKey = "technova_session";

    function getSession() {
        try {
            return JSON.parse(localStorage.getItem(sessionKey) || "null");
        } catch {
            return null;
        }
    }

    function getCartKey() {
        const session = getSession();
        const email = session?.email ? String(session.email).trim().toLowerCase() : "";
        return email ? `technova_cart_user_${email}` : guestCartKey;
    }

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem(getCartKey()) || "[]");
        } catch {
            return [];
        }
    }

    function saveCart(items) {
        localStorage.setItem(getCartKey(), JSON.stringify(items));
    }

    function createAmazonLink(search) {
        return `https://www.amazon.com/s?k=${encodeURIComponent(search)}`;
    }

    function createMercadoLibreLink(search) {
        return `https://listado.mercadolibre.com.mx/${encodeURIComponent(search)}`;
    }

    function getItemLinks(item) {
        const amazonSearch = item.search?.amazon || item.detail;
        const mercadoLibreSearch = item.search?.mercadoLibre || item.detail;
        return {
            amazon: item.links?.amazon || createAmazonLink(amazonSearch),
            mercadoLibre: item.links?.mercadoLibre || createMercadoLibreLink(mercadoLibreSearch)
        };
    }

    function groupedCart(items) {
        return items.reduce((groups, item) => {
            if (!groups[item.pc]) groups[item.pc] = [];
            groups[item.pc].push(item);
            return groups;
        }, {});
    }

    function renderBasketPage() {
        const content = document.getElementById("basketContent");
        const total = document.getElementById("basketTotal");
        const pcTotal = document.getElementById("basketPcTotal");
        if (!content || !total || !pcTotal) return;

        const items = getCart();
        const groups = groupedCart(items);
        total.textContent = items.length;
        pcTotal.textContent = Object.keys(groups).length;

        if (!items.length) {
            content.innerHTML = `
                <div class="basket-empty">
                    <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                    <h2>Tu canasta esta vacia</h2>
                    <p>Agrega componentes desde el catalogo para generar aqui sus links de compra.</p>
                    <a class="btn" href="Productos.html">Ir al catalogo</a>
                </div>
            `;
            return;
        }

        content.innerHTML = Object.entries(groups)
            .map(([pc, pcItems]) => `
                <article class="basket-pc">
                    <div class="basket-pc-header">
                        <h2>${pc}</h2>
                        <span>${pcItems.length} componentes</span>
                    </div>
                    <div class="basket-list">
                        ${pcItems.map((item) => {
                            const links = getItemLinks(item);
                            return `
                                <div class="basket-item">
                                    <div>
                                        <h3>${item.category}</h3>
                                        <p>${item.detail}</p>
                                    </div>
                                    <div class="basket-store-links">
                                        <a class="store-link amazon" href="${links.amazon}" target="_blank" rel="noopener">
                                            <i class="fab fa-amazon" aria-hidden="true"></i> Amazon
                                        </a>
                                        <a class="store-link mercado-libre" href="${links.mercadoLibre}" target="_blank" rel="noopener">
                                            <i class="fas fa-store" aria-hidden="true"></i> Mercado Libre
                                        </a>
                                    </div>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </article>
            `)
            .join("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderBasketPage();

        document.querySelector(".basket-clear-page")?.addEventListener("click", () => {
            saveCart([]);
            window.TechNovaCart?.refresh();
            renderBasketPage();
        });
    });
})();
