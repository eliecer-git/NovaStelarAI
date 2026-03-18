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
    zeroState: document.getElementById('zero-state'),
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

    // Configuración y Utilidades
    btnSettings: document.getElementById('btn-settings'),
    toastContainer: document.getElementById('toast-container')
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

// --- LISTENERS BASE DE BOTONES MUERTOS --- //
ui.btnSettings.addEventListener('click', () => {
    window.showToast('El panel de ajustes está bajo construcción en esta alpha.', 'settings');
});

let isFirstMessage = true;
let isProcessing = false;
let currentFeatureMode = null; // 'imagen', 'video', 'musica', 'aprendizaje' o null

// --- GESTORES DE HISTORIAL (Múltiples Chats) --- //
let chatSessions = [];
let currentSessionId = null;

window.loadChat = function (id) {
    if (isProcessing) return;
    const session = chatSessions.find(s => s.id === id);
    if (!session) return;

    currentSessionId = id;

    // Cambiar la UI a la sesión seleccionada
    ui.zeroState.style.display = 'none';
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
        case 'video': label = 'Modo Video'; break;
        case 'musica': label = 'Modo Música'; break;
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
        ui.zeroState.style.display = 'none';
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
    const html = `
        <div class="msg-bubble msg-ai animate-[fadeIn_0.3s_ease-out]">
            <div class="bubble-avatar shadow-sm border border-brand-500/20">
                <span class="material-symbols-rounded text-[18px] text-brand-500">auto_awesome</span>
            </div>
            <div class="bubble-content markdown-body w-full max-w-[85%] text-[15px] pt-1 pb-2">
                ${parsedHTML}
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
    ui.zeroState.style.display = 'flex';
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
    try {
        const response = await fetch("https://novastelarai.onrender.com/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: prompt,
                mode: explicitlySelectedMode
            })
        });

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
        console.error("Conexión fallida al Cerebro Python:", error);
        return `⚠️ **Error de Conexión con el Cerebro Principal.**\n\nNo he podido conectarme a mi servidor local de inteligencia artificial en \`localhost:8000\`. \n\n*Detalle del fallo: ${error.message}*`;
    }
}
