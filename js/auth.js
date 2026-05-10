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
 * Sincronización de Chats con Firestore
 */
window.syncChatsFromCloud = async function(uid) {
    console.log("Sincronizando chats para:", uid);
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            const data = doc.data();
            if (data.chats) {
                // Sincronizar nombre si existe en la nube
                if (data.userName && window.ui && window.ui.configUserName) {
                    window.ui.configUserName.value = data.userName;
                    localStorage.setItem('nova_user_name', data.userName);
                    if (window.ui.userGreetingText) window.ui.userGreetingText.textContent = `Hola, ${data.userName}`;
                }

                localStorage.setItem('novastelar_chats', JSON.stringify(data.chats));
                // Recargar el historial en la UI
                if (window.renderHistorySidebar) window.renderHistorySidebar();
            }
        }
    } catch (e) {
        console.error("Error sincronizando chats:", e);
    }
};

/**
 * Guardar Chats en la Nube
 */
window.saveChatsToCloud = async function() {
    const user = auth.currentUser;
    if (!user) return;
    
    const chats = JSON.parse(localStorage.getItem('novastelar_chats') || '[]');
    const userName = localStorage.getItem('nova_user_name');

    try {
        await db.collection('users').doc(user.uid).set({
            chats: chats,
            userName: userName,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Datos sincronizados con la nube.");
    } catch (e) {
        console.error("Error guardando datos:", e);
    }
};

/**
 * Cerrar Sesión
 */
window.logout = function() {
    window.showToast('Cerrando conexión estelar...', 'logout', 2000);
    
    // LIMPIEZA DE SEGURIDAD: Borrar todo rastro local al salir
    localStorage.removeItem('nova_chat_history');
    localStorage.removeItem('novastelar_chats');
    localStorage.removeItem('nova_user_name');
    localStorage.removeItem('nova_ai_name');
    
    auth.signOut().then(() => {
        // Pequeño retardo para que se vea el toast
        setTimeout(() => {
            window.location.reload(); // Recargar para volver a la landing limpia
        }, 1000);
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
        window.showToast('Error al cerrar sesión.', 'error');
    });
};

// --- ESCUCHADOR DE ESTADO --- //
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("Usuario autenticado:", user.email);
        // Sincronizar y entrar automáticamente (Persistencia)
        window.syncChatsFromCloud(user.uid);
        window.enterApp('social'); 
    } else {
        console.log("Sin sesión activa.");
    }
});
