document.addEventListener("DOMContentLoaded", () => {
    const usersKey = "technova_users";
    const sessionKey = "technova_session";

    const defaultAvatar =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='60' fill='%2300c3ff'/%3E%3Ccircle cx='60' cy='46' r='22' fill='%230f172a'/%3E%3Cpath d='M22 104c8-24 24-36 38-36s30 12 38 36' fill='%230f172a'/%3E%3C/svg%3E";

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");

    const sessionStatus = document.getElementById("sessionStatus");
    const userCount = document.getElementById("userCount");

    const profilePanel = document.getElementById("profilePanel");
    const profilePreview = document.getElementById("profilePreview");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");

    const profileImageInput = document.getElementById("profileImageInput");
    const logoutBtn = document.getElementById("logoutBtn");

    const authForms = document.getElementById("authForms");
    const downloadUsers = document.getElementById("downloadUsers");
    const storagePanel = document.querySelector(".storage-panel");

    function getUsers() {
        return JSON.parse(localStorage.getItem(usersKey) || "[]");
    }

    function saveUsers(users) {
        localStorage.setItem(usersKey, JSON.stringify(users));
    }

    function getSession() {
        return JSON.parse(localStorage.getItem(sessionKey) || "null");
    }

    function saveSession(session) {
        localStorage.setItem(sessionKey, JSON.stringify(session));
    }

    function clearGuestCart() {
        localStorage.removeItem("technova_cart_guest");
    }

    function updateUserCount() {
        if (!userCount) return;

        const total = getUsers().length;

        userCount.textContent = total === 1 ? "1 usuario registrado" : `${total} usuarios registrados`;
    }

    function setMessage(element, text, type) {
        if (!element) return;

        element.textContent = text;
        element.className = `form-message ${type}`;
    }

    function getActiveUser() {
        const session = getSession();

        if (!session) return null;

        return getUsers().find((user) => user.email === session.email);
    }

    function updateSession() {
        const cuentaPage = document.querySelector(".cuenta-page");
        const user = getActiveUser();

        if (!user) {
            sessionStatus.textContent = "No has iniciado sesión.";

            profilePanel.style.display = "none";

            if (storagePanel) {
                storagePanel.style.display = "none";
            }

            if (authForms) {
                authForms.hidden = false;
            }

            return;
        }

        const avatar = user.profileImage || defaultAvatar;

        sessionStatus.textContent = `Sesión activa: ${user.name}`;

        profilePanel.hidden = false;

        if (authForms) {
            authForms.hidden = true;
            cuentaPage.classList.add("solo-perfil");
        }

        profilePreview.src = avatar;
        profileName.textContent = user.name;
        profileEmail.textContent = user.email;
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("registerName").value.trim();

            const email = document.getElementById("registerEmail").value.trim().toLowerCase();

            const password = document.getElementById("registerPassword").value;

            const users = getUsers();

            const exists = users.some((user) => user.email === email);

            if (exists) {
                setMessage(registerMessage, "Ese correo ya está registrado.", "error");

                return;
            }

            const newUser = {
                id: Date.now().toString(),

                name,
                email,
                password,

                profileImage: "",

                createdAt: new Date().toISOString()
            };

            users.push(newUser);

            saveUsers(users);

            saveSession({
                name: newUser.name,
                email: newUser.email
            });
            clearGuestCart();

            registerForm.reset();

            setMessage(registerMessage, "Cuenta creada correctamente.", "ok");

            updateUserCount();
            updateSession();

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();

            const password = document.getElementById("loginPassword").value;

            const user = getUsers().find((item) => item.email === email && item.password === password);

            if (!user) {
                setMessage(loginMessage, "Correo o contraseña incorrectos.", "error");

                return;
            }

            saveSession({
                name: user.name,
                email: user.email
            });
            clearGuestCart();

            loginForm.reset();

            setMessage(loginMessage, "Inicio de sesión correcto.", "ok");

            updateSession();

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1200);
        });
    }

    if (profileImageInput) {
        profileImageInput.addEventListener("change", () => {
            const file = profileImageInput.files[0];

            const session = getSession();

            if (!file || !session) return;

            const reader = new FileReader();

            reader.onload = () => {
                const users = getUsers();

                const index = users.findIndex((user) => user.email === session.email);

                if (index === -1) return;

                users[index].profileImage = reader.result;

                saveUsers(users);

                updateSession();

                profileImageInput.value = "";
            };

            reader.readAsDataURL(file);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem(sessionKey);
            clearGuestCart();

            updateSession();

            alert("Sesión cerrada correctamente.");
        });
    }

    if (downloadUsers) {
        downloadUsers.addEventListener("click", () => {
            const data = {
                nombre: "TechNova Usuarios",

                fecha: new Date().toISOString(),

                usuarios: getUsers()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json"
            });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = "usuarios.json";

            a.click();

            URL.revokeObjectURL(url);
        });
    }

    updateUserCount();
    updateSession();
});
const autoUpload = localStorage.getItem("technova_open_upload");

if (autoUpload === "true") {
    localStorage.removeItem("technova_open_upload");

    setTimeout(() => {
        const input = document.getElementById("profileImageInput");

        if (input) {
            input.click();
        }
    }, 500);
}
