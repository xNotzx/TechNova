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

    function clearGuestCart() {
        localStorage.removeItem(guestCartKey);
    }

    function toTitleCase(text) {
        return text
            .toLowerCase()
            .split(" ")
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function cleanPcName(text) {
        return toTitleCase(text.replace(/^PC\s+/i, "").trim());
    }

    function parseComponent(text) {
        const parts = text.split(":");
        if (parts.length < 2) {
            return {
                category: "Componente",
                detail: text.trim()
            };
        }

        return {
            category: parts.shift().trim(),
            detail: parts.join(":").trim()
        };
    }

    function createAmazonLink(search) {
        return `https://www.amazon.com/s?k=${encodeURIComponent(search)}`;
    }

    function createMercadoLibreLink(search) {
        return `https://listado.mercadolibre.com.mx/${encodeURIComponent(search)}`;
    }

    function getComponentSearch(component, fallback) {
        const amazonSearch = component?.querySelector(".btn-amazon")?.dataset.busqueda;
        const mercadoLibreSearch = component?.querySelector(".btn-ml")?.dataset.busqueda;
        return {
            amazon: amazonSearch || fallback,
            mercadoLibre: mercadoLibreSearch || fallback
        };
    }

    function getItemLinks(item) {
        const amazonSearch = item.search?.amazon || item.detail;
        const mercadoLibreSearch = item.search?.mercadoLibre || item.detail;
        return {
            amazon: item.links?.amazon || createAmazonLink(amazonSearch),
            mercadoLibre: item.links?.mercadoLibre || createMercadoLibreLink(mercadoLibreSearch)
        };
    }

    function createPanel() {
        if (document.getElementById("cartPanel")) return;

        const overlay = document.createElement("div");
        overlay.className = "cart-panel-overlay";
        overlay.id = "cartPanelOverlay";

        const panel = document.createElement("aside");
        panel.className = "cart-panel";
        panel.id = "cartPanel";
        panel.setAttribute("aria-hidden", "true");
        panel.innerHTML = `
            <div class="cart-panel-header">
                <h2>Canasta</h2>
                <button class="cart-close" type="button" aria-label="Cerrar canasta">&times;</button>
            </div>
            <div class="cart-panel-body" id="cartPanelBody"></div>
            <div class="cart-panel-footer">
                <a class="cart-links-page" href="canasta.html">Crear HTML de links</a>
                <button class="cart-clear" type="button">Vaciar canasta</button>
            </div>
        `;

        document.body.append(overlay, panel);
    }

    function updateCount() {
        const total = getCart().length;
        document.querySelectorAll(".cart-count").forEach((count) => {
            count.textContent = total;
        });
    }

    function groupedCart(items) {
        return items.reduce((groups, item) => {
            if (!groups[item.pc]) groups[item.pc] = [];
            groups[item.pc].push(item);
            return groups;
        }, {});
    }

    function renderCart() {
        const body = document.getElementById("cartPanelBody");
        if (!body) return;

        const items = getCart();
        updateCount();

        if (!items.length) {
            body.innerHTML = `<div class="cart-empty">Tu canasta está vacía.</div>`;
            return;
        }

        const groups = groupedCart(items);
        body.innerHTML = Object.entries(groups)
            .map(([pc, pcItems]) => `
                <section class="cart-section">
                    <div class="cart-section-title">${pc}</div>
                    ${pcItems.map((item) => `
                        <div class="cart-item">
                            <div>
                                <strong>${item.category}</strong>
                                <span>${item.detail}</span>
                                <div class="cart-item-links">
                                    <a href="${getItemLinks(item).amazon}" target="_blank" rel="noopener">Amazon</a>
                                    <a href="${getItemLinks(item).mercadoLibre}" target="_blank" rel="noopener">Mercado Libre</a>
                                </div>
                            </div>
                            <button class="cart-remove" type="button" data-cart-id="${item.id}" aria-label="Quitar ${item.category}">&times;</button>
                        </div>
                    `).join("")}
                </section>
            `)
            .join("");
    }

    function openCart() {
        createPanel();
        renderCart();
        document.getElementById("cartPanelOverlay").classList.add("active");
        const panel = document.getElementById("cartPanel");
        panel.classList.add("active");
        panel.setAttribute("aria-hidden", "false");
    }

    function closeCart() {
        const overlay = document.getElementById("cartPanelOverlay");
        const panel = document.getElementById("cartPanel");
        if (!overlay || !panel) return;
        overlay.classList.remove("active");
        panel.classList.remove("active");
        panel.setAttribute("aria-hidden", "true");
    }

    function addComponent(button) {
        const component = button.closest(".componente");
        const card = button.closest(".pc-card");
        const componentText = component?.querySelector("span")?.textContent || "";
        const pcTitle = card?.querySelector(".pc-header h2")?.textContent || "PC";
        if (!component || !componentText) return;

        const parsed = parseComponent(componentText);
        const search = getComponentSearch(component, parsed.detail);
        const item = {
            id: `${cleanPcName(pcTitle)}-${parsed.category}-${parsed.detail}`.toLowerCase(),
            pc: cleanPcName(pcTitle),
            category: parsed.category,
            detail: parsed.detail,
            search,
            links: {
                amazon: createAmazonLink(search.amazon),
                mercadoLibre: createMercadoLibreLink(search.mercadoLibre)
            }
        };

        const items = getCart();
        if (!items.some((existing) => existing.id === item.id)) {
            items.push(item);
            saveCart(items);
        }

        button.textContent = "Agregado";
        button.classList.add("added");
        window.setTimeout(() => {
            button.textContent = "Agregar";
            button.classList.remove("added");
        }, 1100);

        renderCart();
    }

    function addProductButtons() {
        document.querySelectorAll(".componente").forEach((component) => {
            if (component.querySelector(".btn-agregar-canasta")) return;

            const detailsButton = component.querySelector(".btn-ver-mas");
            const actions = document.createElement("div");
            actions.className = "component-actions";

            if (detailsButton) {
                actions.appendChild(detailsButton);
            }

            const button = document.createElement("button");
            button.className = "btn-agregar-canasta";
            button.type = "button";
            button.textContent = "Agregar";
            actions.appendChild(button);

            component.insertBefore(actions, component.querySelector(".links-componente"));
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        createPanel();
        addProductButtons();
        renderCart();

        document.querySelectorAll(".cart-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                openCart();
            });
        });

        document.addEventListener("click", (event) => {
            if (event.target.closest(".cart-close") || event.target.id === "cartPanelOverlay") {
                closeCart();
            }

            const addButton = event.target.closest(".btn-agregar-canasta");
            if (addButton) {
                addComponent(addButton);
            }

            const removeButton = event.target.closest(".cart-remove");
            if (removeButton) {
                const items = getCart().filter((item) => item.id !== removeButton.dataset.cartId);
                saveCart(items);
                renderCart();
            }

            if (event.target.closest(".cart-clear")) {
                saveCart([]);
                renderCart();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeCart();
        });
    });

    window.TechNovaCart = {
        getCart,
        getItemLinks,
        refresh: renderCart,
        clearGuestCart
    };
})();
