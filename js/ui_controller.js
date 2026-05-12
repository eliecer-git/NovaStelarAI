/**
 * Controlador Principal - NovaStelarAI (Advanced & Omnimodal)
 */

window.ui = {
    input: document.getElementById('user-input'),
    btnSend: document.getElementById('send-btn'),
    btnToggleSidebar: document.getElementById('toggle-sidebar'),
    btnToggleHeader: document.getElementById('header-toggle-sidebar'),
    sidebar: document.getElementById('sidebar'),
    btnNewChat: document.getElementById('btn-new-chat'),
    centralContent: document.getElementById('central-content'),
    chatThread: document.getElementById('conversation-thread'),
    chatStream: document.getElementById('chat-stream'),
    historyList: document.getElementById('history-list'),
    loadingIndicator: document.getElementById('loading-indicator'),

    // Elementos Nuevos
    btnTheme: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    btnPlus: document.getElementById('plus-btn'),
    menuPlus: document.getElementById('plus-menu'),
    featureBadgeContainer: document.getElementById('feature-badge-container'),
    featureBadgeIcon: document.getElementById('feature-badge-icon'),
    featureBadgeText: document.getElementById('feature-badge-text'),
    featureBadgeClose: document.getElementById('feature-badge-close'),

    toastContainer: document.getElementById('toast-container'),
    userGreetingText: document.getElementById('user-greeting-text')
};

// --- CAPA 1: LANDING & AUTH TRANSITION --- //
window.showAuthPortal = function(mode) {
    const initialView = document.getElementById('landing-initial-view');
    const portal = document.getElementById('auth-portal');
    const title = document.getElementById('auth-portal-title');
    const verifyGroup = document.getElementById('verify-password-group');
    const btnMain = document.querySelector('.btn-portal-main');
    
    // Limpiar campos al entrar
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-verify-password').value = '';
    
    initialView.classList.add('hidden');
    portal.classList.remove('hidden');
    
    if (mode === 'login') {
        title.innerText = 'INICIA SESIÓN';
        verifyGroup.style.display = 'none';
        btnMain.innerText = 'INICIAR SESIÓN';
    } else {
        title.innerText = 'CREA TU CUENTA';
        verifyGroup.style.display = 'flex';
        btnMain.innerText = 'CREAR CUENTA';
    }
};

window.hideAuthPortal = function() {
    document.getElementById('landing-initial-view').classList.remove('hidden');
    document.getElementById('auth-portal').classList.add('hidden');
    
    // Limpiar campos al salir
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-verify-password').value = '';
};

window.togglePasswordVisibility = function(id) {
    const input = document.getElementById(id);
    const icon = document.getElementById('eye-icon-' + id);
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerText = 'visibility_off';
    } else {
        input.type = 'password';
        icon.innerText = 'visibility';
    }
};

window.enterApp = function(mode) {
    // Solo validamos campos si venimos del formulario de Email/Password
    if (mode === 'email-auth') {
        const pass = document.getElementById('auth-password').value;
        const verifyPass = document.getElementById('auth-verify-password').value;
        const email = document.getElementById('auth-email').value;
        const isSignup = document.getElementById('verify-password-group').style.display !== 'none';

        if (!email) {
            window.showToast('Por favor, ingresa tu correo electrónico.', 'mail');
            return;
        }

        if (isSignup) {
            if (pass !== verifyPass) {
                window.showToast('Las contraseñas no coinciden.', 'warning');
                return;
            }
            if (pass.length < 6) {
                window.showToast('La contraseña debe tener al menos 6 caracteres.', 'lock_reset');
                return;
            }
        }
    }

    const landing = document.getElementById('landing-page');
    const message = (mode === 'email-auth' || mode === 'social') ? 'Sincronizando con el Núcleo Neuronal...' : 'Abriendo puente de seguridad...';
    
    window.showToast(message, 'rocket_launch');
    
    // Transición Premium e Inmediata
    landing.style.opacity = '0';
    landing.style.transform = 'scale(1.1)';
    setTimeout(() => {
        landing.classList.add('hidden');
        landing.style.display = 'none';
    }, 500);
    
    // Enfocar el input después de la animación
    setTimeout(() => {
        ui.input.focus();
    }, 800);
};

// --- SISTEMA TOAST (Notificaciones Profesionales) --- //
window.showToast = function (message, icon = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 px-4 py-3 bg-white dark:bg-nova-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/10 shadow-lg rounded-xl opacity-0 transform translate-y-[-10px] transition-all duration-300 pointer-events-auto';
    toast.innerHTML = `
        <span class="material-symbols-rounded text-brand-500">${icon}</span>
        <p class="text-[13.5px] font-medium">${message}</p>
    `;
    ui.toastContainer.appendChild(toast);

    // Entrar
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-y-[-10px]');
    });

    // Salir
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};



let isFirstMessage = true;
let isProcessing = false;
let currentFeatureMode = null; // 'imagen', 'aprendizaje' o null

// --- GESTORES DE HISTORIAL (Múltiples Chats) --- //
let chatSessions = JSON.parse(localStorage.getItem('novastelar_chats')) || [];
let currentSessionId = null;

// Re-pintar historial anterior
window.renderHistorySidebar = function() {
    // ACTUALIZACIÓN DE SEGURIDAD: Obtener siempre lo último de localStorage
    chatSessions = JSON.parse(localStorage.getItem('novastelar_chats')) || [];
    
    ui.historyList.innerHTML = '';
    chatSessions.forEach(session => {
        const li = document.createElement('li');
        li.className = 'relative group history-item';
        li.innerHTML = `
            <button class="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-700 dark:text-[#e3e3e3] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors truncate flex items-center gap-3 font-medium active:scale-95 focus:outline-none" onclick="window.loadChat(${session.id})">
                <span class="material-symbols-rounded text-[18px] opacity-70">chat_bubble</span> 
                <span class="session-name">${session.summary}</span>
            </button>
            <div class="chat-options-menu">
                <button class="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/20 text-gray-500 dark:text-gray-400" onclick="window.toggleChatOptions(event, ${session.id})">
                    <span class="material-symbols-rounded text-[18px]">more_vert</span>
                </button>
                <div id="dropdown-${session.id}" class="options-dropdown">
                    <div class="option-item" onclick="window.renameChat(${session.id})">
                        <span class="material-symbols-rounded text-[16px]">edit</span> Renombrar
                    </div>
                    <div class="option-item delete" onclick="window.deleteChat(${session.id})">
                        <span class="material-symbols-rounded text-[16px]">delete</span> Eliminar
                    </div>
                </div>
            </div>
        `;
        ui.historyList.prepend(li);
    });
}

// Funciones de Gestión de Chat
window.toggleChatOptions = function(event, id) {
    event.stopPropagation();
    // Cerrar otros dropdowns
    document.querySelectorAll('.options-dropdown').forEach(d => {
        if (d.id !== `dropdown-${id}`) d.classList.remove('show');
    });
    const dropdown = document.getElementById(`dropdown-${id}`);
    dropdown.classList.toggle('show');
};

window.renameChat = function(id) {
    const session = chatSessions.find(s => s.id === id);
    if (!session) return;
    const newName = prompt("Nuevo nombre para el chat:", session.summary);
    if (newName && newName.trim()) {
        session.summary = newName.trim();
        saveChatsToLocal();
        window.renderHistorySidebar();
        window.showToast('Chat renombrado.', 'edit');
    }
};

window.deleteChat = function(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este chat?")) {
        chatSessions = chatSessions.filter(s => s.id !== id);
        saveChatsToLocal();
        window.renderHistorySidebar();
        window.showToast('Chat eliminado.', 'delete');
        
        if (currentSessionId === id) {
            ui.chatThread.innerHTML = '';
            ui.centralContent.style.display = 'flex';
            currentSessionId = null;
        }
    }
};

// Cerrar dropdowns al hacer clic fuera
document.addEventListener('click', () => {
    document.querySelectorAll('.options-dropdown').forEach(d => d.classList.remove('show'));
});

function saveChatsToLocal() {
    localStorage.setItem('novastelar_chats', JSON.stringify(chatSessions));
    // SINCRONIZACIÓN ESTELAR: Mandar a la nube de Firebase de inmediato
    if (window.saveChatsToCloud) window.saveChatsToCloud();
}

document.addEventListener('DOMContentLoaded', () => {
    if (chatSessions.length > 0) renderHistorySidebar();
    
    // Auto-colapsar sidebar en móviles para no tapar la pantalla
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
});

window.loadChat = function (id) {
    if (isProcessing) return;
    const session = chatSessions.find(s => s.id === id);
    if (!session) return;

    currentSessionId = id;

    // Cambiar la UI a la sesión seleccionada
    ui.centralContent.style.display = 'none';
    ui.chatThread.innerHTML = ''; // Limpiar el hilo actual
    ui.chatThread.classList.remove('hidden');
    isFirstMessage = false;

    // Rellenamos el chat con la conversación real de ese historial
    window.showToast(`Conectando con archivo cifrado: ${session.summary}...`, 'memory');

    session.messages.forEach(msg => {
        if (msg.role === 'user') {
            renderUserMessage(msg.text);
        } else {
            renderAIMessage(msg.text);
        }
    });

    scrollBottom();
    ui.input.focus();

    if (window.innerWidth < 640 && !ui.sidebar.classList.contains('collapsed')) {
        toggleSidebar(); // Autocierra el sidebar en móviles
    }
};

// --- GESTIÓN DE TEMA (CLARO/OSCURO) --- //
let isDarkMode = true; // Por defecto Dark como Gemini Advanced

ui.btnTheme.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        ui.themeIcon.textContent = 'dark_mode';
        document.getElementById('prism-theme-dark').removeAttribute('disabled');
        document.getElementById('prism-theme-light').setAttribute('disabled', 'true');
    } else {
        document.documentElement.classList.remove('dark');
        ui.themeIcon.textContent = 'light_mode';
        document.getElementById('prism-theme-light').removeAttribute('disabled');
        document.getElementById('prism-theme-dark').setAttribute('disabled', 'true');
    }
});

// --- SIDEBAR RESPONSIVE Toggles --- //
function toggleSidebar() {
    ui.sidebar.classList.toggle('collapsed');

    // Si la colapsamos, mostramos el botón del header
    if (ui.sidebar.classList.contains('collapsed')) {
        ui.btnToggleHeader.classList.remove('hidden');
    } else {
        ui.btnToggleHeader.classList.add('hidden');
    }
}

ui.btnToggleSidebar.addEventListener('click', toggleSidebar);
ui.btnToggleHeader.addEventListener('click', toggleSidebar);
ui.btnNewChat.addEventListener('click', resetWorkspace);


// --- MENÚ '+' (POPPER) Y ESTADOS --- //
// Abrir/cerrar menú al clickear '+'
ui.btnPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    ui.menuPlus.classList.toggle('opacity-0');
    ui.menuPlus.classList.toggle('scale-95');
    ui.menuPlus.classList.toggle('pointer-events-none');
});

// Cerrar menú si clickeas fuera
document.addEventListener('click', (e) => {
    if (!ui.menuPlus.contains(e.target) && e.target !== ui.btnPlus && !ui.menuPlus.classList.contains('opacity-0')) {
        ui.menuPlus.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
    }
});

// Seleccionar feature desde el menú
window.selectFeature = function (feature, iconStr) {
    currentFeatureMode = feature;
    let label = '';

    switch (feature) {
        case 'imagen': label = 'Modo Imagen'; break;

        case 'aprendizaje': label = 'Aprendizaje Escolar'; break;
    }

    ui.featureBadgeIcon.textContent = iconStr;
    ui.featureBadgeText.textContent = label;
    ui.featureBadgeContainer.classList.remove('hidden'); // Muestra la etiqueta arriba del input

    // Oculta el menú
    ui.menuPlus.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
    ui.input.focus();
};

// Remover feature badge
ui.featureBadgeClose.addEventListener('click', () => {
    currentFeatureMode = null;
    ui.featureBadgeContainer.classList.add('hidden');
});


// --- INPUT TEXTAREA --- //
ui.input.addEventListener('input', function () {
    this.style.height = 'auto'; // Reset
    this.style.height = (this.scrollHeight) + 'px';

    if (this.value.trim().length > 0 && !isProcessing) {
        ui.btnSend.disabled = false;
    } else {
        ui.btnSend.disabled = true;
    }
});

ui.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!ui.btnSend.disabled) {
            submitPromptFromInput();
        }
    }
});

ui.btnSend.addEventListener('click', () => {
    if (!ui.btnSend.disabled) {
        submitPromptFromInput();
    }
});

// --- LÓGICA CORE & RENDEREOS --- //

function submitPromptFromInput() {
    const text = ui.input.value.trim();
    if (text && !isProcessing) {
        window.submitPrompt(text);
    }
}

window.submitPrompt = async function (text) {
    if (isProcessing) return;

    isProcessing = true;
    ui.input.value = '';
    ui.input.style.height = 'auto';
    ui.input.disabled = true;
    ui.btnSend.disabled = true;
    ui.btnSend.innerHTML = '<span class="material-symbols-rounded text-[22px] animate-spin">refresh</span>';

    // Zero State y Creación de Sesión (Solo en el primer mensaje)
    if (isFirstMessage || currentSessionId === null) {
        ui.centralContent.style.display = 'none';
        ui.chatThread.classList.remove('hidden');
        isFirstMessage = false;

        // Crear nueva sesión de Chat
        currentSessionId = Date.now(); // ID único
        const summary = text.length > 25 ? text.substring(0, 25) + '...' : text;

        // Guardarla en Memoria Local RAM
        chatSessions.push({
            id: currentSessionId,
            summary: summary,
            messages: []
        });

        // Crear el botón en el Frontend (Sidebar Historial)
        const li = document.createElement('li');
        li.innerHTML = `
            <button class="w-full text-left px-3 py-2.5 rounded-xl text-[13px] text-gray-700 dark:text-[#e3e3e3] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors truncate flex items-center gap-3 font-medium active:scale-95 focus:outline-none" onclick="window.loadChat(${currentSessionId})">
                <span class="material-symbols-rounded text-[18px] opacity-70">chat_bubble</span> ${summary}
            </button>
        `;
        ui.historyList.prepend(li);
    }

    // Obtener Sesión Actual y guardar el mensaje del Usuario
    const currentSession = chatSessions.find(s => s.id === currentSessionId);
    if (currentSession) {
        currentSession.messages.push({ role: 'user', text: text });
        saveChatsToLocal();
    }

    renderUserMessage(text);
    scrollBottom();

    ui.loadingIndicator.classList.remove('hidden');
    scrollBottom();

    try {
        const iaResponse = await fakeAIModelResponse(text, currentFeatureMode);

        // Guardar mensaje de la IA en la Sesión Local
        if (currentSession) {
            currentSession.messages.push({ role: 'ai', text: iaResponse });
            saveChatsToLocal();
        }

        ui.loadingIndicator.classList.add('hidden');
        renderAIMessage(iaResponse);
    } catch (err) {
        ui.loadingIndicator.classList.add('hidden');
        renderAIMessage("⚠️ Ocurrió un error general en la Red Estelar.");
        console.error(err);
    } finally {
        isProcessing = false;
        ui.input.disabled = false;
        ui.btnSend.innerHTML = '<span class="material-symbols-rounded text-[22px] font-medium">arrow_upward</span>';

        ui.input.focus();
        scrollBottom();
    }
}

function renderUserMessage(text) {
    const safeText = escapeHTML(text);
    const html = `
        <div class="msg-bubble msg-user animate-[fadeIn_0.3s_ease-out]">
            <div class="bubble-content shadow-sm text-[15.5px]">${safeText}</div>
        </div>
    `;
    ui.chatThread.insertAdjacentHTML('beforeend', html);
}

function renderAIMessage(markdownText) {
    const parsedHTML = window.marked ? marked.parse(markdownText) : markdownText;
    const aiName = localStorage.getItem('nova_ai_name') || 'NovaStelar';
    const html = `
        <div class="msg-bubble msg-ai animate-[fadeIn_0.3s_ease-out]">
            <div class="bubble-avatar shadow-sm border border-brand-500/20">
                <span class="material-symbols-rounded text-[18px] text-brand-500">auto_awesome</span>
            </div>
            <div class="flex-1 w-full max-w-[85%]">
                <div class="text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-0.5 tracking-wider uppercase">${aiName}</div>
                <div class="bubble-content markdown-body text-[15px] pt-0 pb-2">
                    ${parsedHTML}
                </div>
            </div>
        </div>
    `;
    ui.chatThread.insertAdjacentHTML('beforeend', html);
    if (window.Prism) Prism.highlightAllUnder(ui.chatThread);
}

function scrollBottom() {
    setTimeout(() => {
        ui.chatStream.scrollTo({ top: ui.chatStream.scrollHeight + 150, behavior: 'smooth' });
    }, 50);
}

function resetWorkspace() {
    ui.chatThread.innerHTML = '';
    ui.chatThread.classList.add('hidden');
    ui.centralContent.style.display = 'flex';
    isFirstMessage = true;
    currentSessionId = null; // Reiniciar para que el próximo mensaje cree una nueva sesión
    ui.input.value = '';
    ui.input.focus();

    // Si la abrimos en movil la volvemos a cerrar
    if (window.innerWidth < 640 && !ui.sidebar.classList.contains('collapsed')) {
        toggleSidebar();
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag]));
}

// --- OMNIMODALITY AI BACKEND (API REAL CONNECTION) --- //
async function fakeAIModelResponse(prompt, explicitlySelectedMode) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 Segundos máximo de espera para el Cerebro Python

    try {
        const response = await fetch("http://localhost:8000/", {
            method: "POST",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: prompt,
                mode: explicitlySelectedMode
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Error de red neuronal: ${response.status}`);
        }

        const data = await response.json();

        // Si Python detecta un cálculo, podemos notificarlo visualmente
        if (data.action_type === 'math') {
            window.showToast("Cálculo matemático interceptado y resuelto puro", "calculate");
        } else if (data.action_type === 'code') {
            window.showToast("Compilación finalizada con éxito", "code");
        }

        return data.response;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("Conexión fallida al Cerebro Python:", error);
        if (error.name === 'AbortError') {
            return `⚠️ **Corte de Enlace Táctico.**\n\nEl servidor en red está tardando demasiado en responder (Timeout). Los escudos antibloqueo desconectaron el hilo para proteger la página.`;
        }
        return `⚠️ **Error de Conexión con el Cerebro Principal.**\n\nNo he podido conectarme a mi servidor de inteligencia artificial. \n\n*Detalle del fallo: ${error.message}*`;
    }
}
