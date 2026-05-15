/**
 * Motor de Autenticación Firebase - NovaStelarAI
 */

// Configuración de Firebase proporcionada por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyBebk0kKAMJVM7IQjeL_teL8UT1wQTbTAQ",
  authDomain: "novastelarai.firebaseapp.com",
  projectId: "novastelarai",
  storageBucket: "novastelarai.firebasestorage.app",
  messagingSenderId: "627767395646",
  appId: "1:627767395646:web:717e5d1447b2c1499c186f",
  measurementId: "G-R1YKQJQP72"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- FUNCIONES DE AUTENTICACIÓN --- //

/**
 * Iniciar sesión con Google
 */
window.loginWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    window.showToast('Conectando con Google...', 'cloud', 2000);
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            window.showToast(`Bienvenido de nuevo, ${user.displayName}`, 'verified_user');
            
            // Guardar nombre en configuración local para la IA
            if (window.ui && window.ui.configUserName) {
                window.ui.configUserName.value = user.displayName;
                window.ui.configUserName.dispatchEvent(new Event('change'));
            }
            
            // Sincronizar chats desde la nube
            window.syncChatsFromCloud(user.uid);
            
            window.enterApp('social');
        })
        .catch((error) => {
            console.error("Error en Google Login:", error);
            window.showToast('Error al conectar con Google: ' + error.message, 'error');
        });
};

/**
 * Iniciar sesión con GitHub
 */
window.loginWithGithub = function() {
    const provider = new firebase.auth.GithubAuthProvider();
    window.showToast('Conectando con GitHub...', 'terminal', 2000);
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            window.showToast(`Bienvenido, @${user.reloadUserInfo.screenName || user.displayName}`, 'code');
            window.syncChatsFromCloud(user.uid);
            window.enterApp('social');
        })
        .catch((error) => {
            console.error("Error en GitHub Login:", error);
            window.showToast('Error en GitHub.', 'error');
        });
};

/**
 * Registro / Login con Email y Contraseña (Firebase)
 */
window.authWithEmail = function() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    const verifyPass = document.getElementById('auth-verify-password').value;
    const isSignup = document.getElementById('verify-password-group').style.display !== 'none';

    if (!email || !pass) {
        window.showToast('Por favor, completa todos los campos.', 'warning');
        return;
    }

    if (isSignup) {
        // MODO CREAR CUENTA
        if (pass !== verifyPass) {
            window.showToast('Las contraseñas no coinciden.', 'warning');
            return;
        }

        window.showToast('Creando tu identidad estelar...', 'person_add');
        auth.createUserWithEmailAndPassword(email, pass)
            .then((result) => {
                window.showToast('¡Cuenta creada con éxito!', 'done_all');
                window.enterApp('email-auth');
            })
            .catch((err) => {
                window.showToast('Error: ' + err.message, 'error');
            });
    } else {
        // MODO INICIAR SESIÓN
        window.showToast('Accediendo al núcleo...', 'login');
        auth.signInWithEmailAndPassword(email, pass)
            .then((result) => {
                window.showToast('Acceso concedido.', 'verified');
                window.syncChatsFromCloud(result.user.uid);
                window.enterApp('email-auth');
            })
            .catch((err) => {
                if (err.code === 'auth/user-not-found') {
                    window.showToast('Esa cuenta no existe. Dale a "Crear Cuenta".', 'help');
                } else {
                    window.showToast('Contraseña incorrecta.', 'error');
                }
            });
    }
};

/**
 * Sincronización de Chats con Firestore (REST API - Bypass SDK)
 */
window.syncChatsFromCloud = async function(uid) {
    console.log("☁️ Sincronizando chats para:", uid);
    const user = auth.currentUser;
    if (!user) return;

    try {
        const token = await user.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${uid}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (response.ok) {
            const doc = await response.json();
            if (doc.fields) {
                if (doc.fields.chats && doc.fields.chats.stringValue) {
                    const chats = JSON.parse(doc.fields.chats.stringValue);
                    localStorage.setItem('novastelar_chats', JSON.stringify(chats));
                    if (window.renderHistorySidebar) window.renderHistorySidebar();
                }
                if (doc.fields.userName && doc.fields.userName.stringValue) {
                    const name = doc.fields.userName.stringValue;
                    localStorage.setItem('nova_user_name', name);
                    localStorage.setItem('nova_name_' + uid, name);
                    
                    const avatar = document.getElementById('user-avatar-icon');
                    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
                }
                if (doc.fields.folders && doc.fields.folders.stringValue) {
                    const folders = JSON.parse(doc.fields.folders.stringValue);
                    localStorage.setItem('nova_folders', JSON.stringify(folders));
                    if (window.renderFoldersGrid) window.renderFoldersGrid();
                }
                console.log("✅ Chats descargados de la nube (REST API)");
            }
        } else if (response.status === 404) {
            console.log("📭 No hay datos previos en la nube para este usuario.");
        } else {
            const errText = await response.text();
            console.error("❌ REST API error:", response.status, errText);
        }
    } catch (e) {
        console.warn("⚠️ No se pudo conectar a la nube:", e.message);
    }
};

/**
 * Guardar Chats en la Nube (REST API - Bypass SDK)
 */
window.saveChatsToCloud = async function() {
    const user = auth.currentUser;
    if (!user) return;
    
    const chatsRaw = localStorage.getItem('novastelar_chats');
    const userName = localStorage.getItem('nova_user_name') || localStorage.getItem('nova_name_' + user.uid) || '';

    // Si no hay ni chats ni nombre, no guardar
    if (!chatsRaw && !userName) return;

    try {
        const token = await user.getIdToken();
        const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/users/${user.uid}`;
        
        let fields = {
            lastUpdate: { timestampValue: new Date().toISOString() }
        };
        
        if (chatsRaw) {
            fields.chats = { stringValue: chatsRaw };
        }
        
        if (userName) {
            fields.userName = { stringValue: userName };
        }
        
        const foldersRaw = localStorage.getItem('nova_folders');
        if (foldersRaw) {
            fields.folders = { stringValue: foldersRaw };
        }
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields })
        });

        if (response.ok) {
            console.log("✅ Datos (chats/nombre) guardados en la nube (REST API)");
        } else {
            const errText = await response.text();
            console.error("❌ Error guardando (REST):", response.status, errText);
        }
    } catch (e) {
        console.error("⚠️ Error de red al guardar:", e.message);
    }
};

/**
 * Cerrar Sesión (Abre el Modal)
 */
window.logout = function() {
    const modal = document.getElementById('logout-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
};

window.closeLogoutModal = function() {
    const modal = document.getElementById('logout-modal');
    modal.classList.remove('opacity-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

window.executeLogout = function() {
    window.closeLogoutModal();
    window.showToast('Cerrando conexión estelar...', 'logout', 2000);
    
    // LIMPIEZA: Borrar chats locales y cache de nombre activo
    localStorage.removeItem('nova_chat_history');
    localStorage.removeItem('novastelar_chats');
    localStorage.removeItem('nova_ai_name');
    localStorage.removeItem('nova_user_name');
    localStorage.removeItem('nova_user_logged_in');
    
    auth.signOut().then(() => {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
        window.showToast('Error al cerrar sesión.', 'error');
    });
};

/**
 * Modal de Bienvenida (Personalización)
 */
window.showWelcomeModal = function() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modal.querySelector('div').classList.remove('scale-90');
    }, 50);
};

window.saveInitialName = async function() {
    const name = document.getElementById('input-welcome-name').value.trim();
    if (!name) {
        window.showToast('Por favor, dime un nombre para saludarte.', 'warning');
        return;
    }

    const user = auth.currentUser;
    const uid = user ? user.uid : 'local';

    window.showToast(`Perfecto, ${name}. Iniciando sistemas...`, 'stars');
    // Guardar por UID para que no se pierda al cerrar sesión
    localStorage.setItem('nova_name_' + uid, name);
    localStorage.setItem('nova_user_name', name);
    
    // Intentar guardar en la nube
    try { await window.saveChatsToCloud(); } catch(e) {}

    // Actualizar UI
    const greeting = document.getElementById('user-greeting');
    if (greeting) greeting.textContent = `Hola, ${name}`;
    
    const avatar = document.getElementById('user-avatar-icon');
    if (avatar) avatar.textContent = name.charAt(0).toUpperCase();

    // Cerrar modal
    const modal = document.getElementById('welcome-modal');
    modal.classList.remove('opacity-100');
    modal.querySelector('div').classList.add('scale-90');
    setTimeout(() => modal.classList.add('hidden'), 500);
};

// --- ESCUCHADOR DE ESTADO --- //
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log("Sincronizando identidad para:", user.email);
        
        // 1. Intentar traer lo que hay en la nube
        try {
            await window.syncChatsFromCloud(user.uid);
        } catch (e) {
            console.warn("Nube no disponible, usando datos locales.");
        }
        
        // 2. Verificar nombre: UID local > genérico > pedir
        let name = localStorage.getItem('nova_name_' + user.uid) 
                || localStorage.getItem('nova_user_name');
        
        if (!name && user.displayName) {
            // Si vino de Google/GitHub, usar su nombre
            name = user.displayName.split(' ')[0];
            localStorage.setItem('nova_name_' + user.uid, name);
        }
        
        if (!name) {
            window.showWelcomeModal();
        } else {
            localStorage.setItem('nova_user_name', name);
            const greeting = document.getElementById('user-greeting');
            if (greeting) greeting.textContent = `Hola, ${name}`;
            
            const avatar = document.getElementById('user-avatar-icon');
            if (avatar) avatar.textContent = name.charAt(0).toUpperCase();
        }
        
        // Actualizar el menú de cuenta
        const emailDisplay = document.getElementById('user-email-display');
        if (emailDisplay && user.email) {
            emailDisplay.textContent = user.email;
            emailDisplay.title = user.email;
        }
        
        localStorage.setItem('nova_user_logged_in', 'true');
        
        // Ocultar loader si existe
        const loader = document.getElementById('global-loading-screen');
        if (loader && loader.style.display !== 'none') {
            loader.classList.add('opacity-0');
            setTimeout(() => {
                loader.classList.add('hidden');
                document.documentElement.classList.remove('fast-loading');
            }, 500);
        }
        
        // 3. Entrar a la app
        window.enterApp('social'); 
    } else {
        localStorage.setItem('nova_user_logged_in', 'false');
        document.documentElement.classList.remove('fast-loading');
        const loader = document.getElementById('global-loading-screen');
        if (loader) loader.classList.add('hidden');
        
        console.log("NovaStelar: Esperando conexión...");
    }
});
