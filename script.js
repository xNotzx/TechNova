document.addEventListener("DOMContentLoaded", () => {
    const pageLoader = document.getElementById("pageLoader");
    const heroVideo = document.querySelector(".hero-video");

            if (sessionStorage.getItem("technova_index_loaded") === "true") {
                document.documentElement.classList.add("skip-loader");
            }

    
    function prepareHeroVideo() {
        if (!heroVideo) return Promise.resolve();

        heroVideo.muted = true;
        heroVideo.loop = true;
        heroVideo.playsInline = true;
        heroVideo.load();

        const playPromise = heroVideo.play();
        if (playPromise) {
            playPromise.catch(() => {});
        }

        if (heroVideo.readyState >= 2) return Promise.resolve();

        return new Promise((resolve) => {
            const done = () => {
                heroVideo.removeEventListener("loadeddata", done);
                heroVideo.removeEventListener("canplay", done);
                resolve();
            };

            heroVideo.addEventListener("loadeddata", done, { once:true });
            heroVideo.addEventListener("canplay", done, { once:true });
            window.setTimeout(done, 5000);
        });
    }

    if (pageLoader) {
        const alreadyVisitedIndex = sessionStorage.getItem("technova_index_loaded") === "true";

        if (alreadyVisitedIndex) {
            pageLoader.remove();
            prepareHeroVideo();
        } else {
            sessionStorage.setItem("technova_index_loaded", "true");
            const minimumLoaderTime = new Promise((resolve) => window.setTimeout(resolve, 2000));

            Promise.all([minimumLoaderTime, prepareHeroVideo()]).then(() => {
                pageLoader.classList.add("loader-content-hide");

                window.setTimeout(() => {
                    pageLoader.classList.add("loader-hidden");

                    window.setTimeout(() => {
                        pageLoader.remove();
                    }, 600);
                }, 450);
            });
        }
    }

    document.querySelectorAll(".details-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            window.location.href = "Productos.html";
        });
    });

    const sections = document.querySelectorAll(".reveal-section");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.14 });
    sections.forEach((section) => observer.observe(section));

    const usersKey = "technova_users";
    const sessionKey = "technova_session";
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='60' fill='%2300c3ff'/%3E%3Ccircle cx='60' cy='46' r='22' fill='%230f172a'/%3E%3Cpath d='M22 104c8-24 24-36 38-36s30 12 38 36' fill='%230f172a'/%3E%3C/svg%3E";

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authForms = document.getElementById("authForms");
    const loginMessage = document.getElementById("loginMessage");
    const registerMessage = document.getElementById("registerMessage");
    const sessionStatus = document.getElementById("sessionStatus");
    const userCount = document.getElementById("userCount");
    const downloadUsers = document.getElementById("downloadUsers");
    const headerLoginBtn = document.getElementById("headerLoginBtn");
    const headerProfileBtn = document.getElementById("headerProfileBtn");
    const headerAvatar = document.getElementById("headerAvatar");
    const headerUserName = document.getElementById("headerUserName");
    const heroRegisterBtn = document.getElementById("heroRegisterBtn");
    const cuentaPanel = document.getElementById("cuenta");
    const closeAccountPanel = document.getElementById("closeAccountPanel");
    const profilePanel = document.getElementById("profilePanel");
    const profilePreview = document.getElementById("profilePreview");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileImageInput = document.getElementById("profileImageInput");
    const logoutBtn = document.getElementById("logoutBtn");

    const getUsers = () => JSON.parse(localStorage.getItem(usersKey) || "[]");
    const saveUsers = (users) => localStorage.setItem(usersKey, JSON.stringify(users));
    const getSession = () => JSON.parse(localStorage.getItem(sessionKey) || "null");
    const saveSession = (session) => localStorage.setItem(sessionKey, JSON.stringify(session));
    const clearGuestCart = () => {
        window.TechNovaCart?.clearGuestCart();
        window.TechNovaCart?.refresh();
    };

    function getActiveUser() {
        const session = getSession();
        if (!session) return null;
        return getUsers().find((user) => user.email === session.email) || session;
    }

    function setMessage(element, text, type) {
        element.textContent = text;
        element.className = `form-message ${type}`;
    }

    function openAccountPanel() {
        cuentaPanel.classList.add("cuenta-activa");
        cuentaPanel.setAttribute("aria-hidden", "false");
        cuentaPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closePanel() {
        cuentaPanel.classList.remove("cuenta-activa");
        cuentaPanel.setAttribute("aria-hidden", "true");
        if (location.hash === "#cuenta") {
            history.replaceState(null, "", location.pathname + location.search);
        }
    }

    function updateUserCount() {
        const total = getUsers().length;
        userCount.textContent = total === 1 ? "1 usuario guardado" : `${total} usuarios guardados`;
    }

    function updateSession() {
        const user = getActiveUser();
        const isLoggedIn = !!user;
        const avatar = user?.profileImage || defaultAvatar;

        sessionStatus.textContent = isLoggedIn ? `Sesión activa: ${user.name}` : "No has iniciado sesión.";
        headerLoginBtn.hidden = isLoggedIn;
        headerProfileBtn.hidden = !isLoggedIn;
        profilePanel.hidden = !isLoggedIn;
        authForms.hidden = isLoggedIn;

        if (isLoggedIn) {
            headerAvatar.src = avatar;
            headerUserName.textContent = user.name;
            profilePreview.src = avatar;
            profileName.textContent = user.name;
            profileEmail.textContent = user.email;
        }
    }

    function downloadUsersFile() {
        const database = {
            nombre: "TechNova usuarios",
            actualizado: new Date().toISOString(),
            usuarios: getUsers()
        };
        const file = new Blob([JSON.stringify(database, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(file);
        link.download = "data/usuarios.json";
        link.click();
        URL.revokeObjectURL(link.href);
    }

    document.querySelectorAll('a[href="#cuenta"], .open-account').forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            history.replaceState(null, "", "#cuenta");
            openAccountPanel();
        });
    });

    headerLoginBtn.addEventListener("click", openAccountPanel);
    headerProfileBtn.addEventListener("click", openAccountPanel);
    closeAccountPanel.addEventListener("click", closePanel);
    downloadUsers.addEventListener("click", downloadUsersFile);

    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;
        const users = getUsers();

        if (users.some((user) => user.email === email)) {
            setMessage(registerMessage, "Ese correo ya está registrado.", "error");
            return;
        }

        const user = {
            id: window.crypto?.randomUUID ? window.crypto.randomUUID() : String(Date.now()),
            name,
            email,
            password,
            profileImage: "",
            createdAt: new Date().toISOString()
        };

        users.push(user);
        saveUsers(users);
        saveSession({ name: user.name, email: user.email });
        clearGuestCart();
        registerForm.reset();
        setMessage(registerMessage, "Cuenta creada correctamente. Ahora puedes subir tu foto de perfil.", "ok");
        updateUserCount();
        updateSession();
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;
        const user = getUsers().find((item) => item.email === email && item.password === password);

        if (!user) {
            setMessage(loginMessage, "Correo o contraseña incorrectos.", "error");
            return;
        }

        saveSession({ name: user.name, email: user.email });
        clearGuestCart();
        loginForm.reset();
        setMessage(loginMessage, "Inicio de sesión correcto.", "ok");
        updateSession();
    });

    profileImageInput.addEventListener("change", () => {
        const file = profileImageInput.files[0];
        const session = getSession();
        if (!file || !session) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            const users = getUsers();
            const index = users.findIndex((user) => user.email === session.email);
            if (index === -1) return;

            users[index].profileImage = reader.result;
            saveUsers(users);
            updateSession();
            profileImageInput.value = "";
        });
        reader.readAsDataURL(file);
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(sessionKey);
        clearGuestCart();
        setMessage(loginMessage, "Sesión cerrada. Puedes iniciar sesión de nuevo.", "ok");
        updateSession();
        openAccountPanel();
    });

    updateSession();
    updateUserCount();
    if (location.hash === "#cuenta") openAccountPanel();
    startHeroCanvas();
});

function startHeroCanvas() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const particles = [];
    const total = 70;

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
        particles.length = 0;
        for (let i = 0; i < total; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                r: Math.random() * 2 + 1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0,195,255,.85)";
        ctx.strokeStyle = "rgba(0,195,255,.18)";

        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
            ctx.fill();

            for (let j = index + 1; j < particles.length; j++) {
                const other = particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.hypot(dx, dy);
                if (distance < 130) {
                    ctx.globalAlpha = 1 - distance / 130;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        });

        requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener("resize", () => {
        resize();
        createParticles();
    });
}

const sessionKey = "technova_session";

const headerLoginBtn =
document.getElementById("headerLoginBtn");

const headerProfileBtn =
document.getElementById("headerProfileBtn");

const headerAvatar =
document.getElementById("headerAvatar");

const headerUserName =
document.getElementById("headerUserName");

const users = JSON.parse(
    localStorage.getItem("technova_users") || "[]"
);

const session = JSON.parse(
    localStorage.getItem(sessionKey) || "null"
);

if (
    session &&
    headerLoginBtn &&
    headerProfileBtn &&
    headerAvatar &&
    headerUserName
) {

    const user = users.find(
        u => u.email === session.email
    );

    if (user) {

        headerLoginBtn.hidden = true;
        headerProfileBtn.hidden = false;

        if (heroRegisterBtn) {
        heroRegisterBtn.style.display = "none";
        }
        
        headerUserName.textContent = user.name;

        if (user.profileImage) {
            headerAvatar.src = user.profileImage;
        }

    }

}

const profileDropdown =
document.getElementById("profileDropdown");

const changePhotoBtn =
document.getElementById("changePhotoBtn");

const logoutBtnMenu =
document.getElementById("logoutBtnMenu");

if(headerProfileBtn){

    headerProfileBtn.addEventListener(
        "click",
        (e) => {

            e.stopPropagation();

            profileDropdown.classList.toggle(
                "active"
            );

        }
    );

}

document.addEventListener(
    "click",
    () => {

        if(profileDropdown){

            profileDropdown.classList.remove(
                "active"
            );

        }

    }
);

if(changePhotoBtn){

    changePhotoBtn.addEventListener(
        "click",
        () => {
            localStorage.setItem(
                "technova_open_upload",
                "true"
            );
            window.location.href =
            "cuentas.html";
        }
    );

}

if(logoutBtnMenu){

    logoutBtnMenu.addEventListener(
        "click",
        () => {
            localStorage.removeItem(
                "technova_session"
            );
            localStorage.removeItem(
                "technova_cart_guest"
            );
            location.reload();
        }
    );

}
