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
    userGreetingText: document.getElementById('user-greeting-text'),

    // Vision / Image Attachment
    attachImageBtn: document.getElementById('attach-image-btn'),
    imageAttachInput: document.getElementById('image-attach-input'),
    imagePreviewStrip: document.getElementById('image-preview-strip'),
    previewThumb: document.getElementById('preview-thumb'),
    previewFileName: document.getElementById('preview-file-name'),
    previewFileSize: document.getElementById('preview-file-size'),
    previewRemoveBtn: document.getElementById('preview-remove-btn'),
};

// --- VISION: IMAGE ATTACHMENT STATE --- //
let pendingImageBase64 = null;
let pendingImageMimeType = null;

// Attach image button triggers hidden file input
ui.attachImageBtn.addEventListener('click', () => {
    ui.imageAttachInput.click();
});

// When user selects an image file
ui.imageAttachInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        window.showToast('Solo se permiten archivos de imagen.', 'warning');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        window.showToast('La imagen es demasiado grande. Máximo 10MB.', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        const dataUrl = event.target.result;
        pendingImageBase64 = dataUrl.split(',')[1]; // Remove data:image/...;base64,
        pendingImageMimeType = file.type;

        // Show preview strip
        ui.previewThumb.src = dataUrl;
        ui.previewFileName.textContent = file.name;
        ui.previewFileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
        ui.imagePreviewStrip.classList.add('active');

        // Enable send button if there's text or just image
        ui.btnSend.disabled = false;

        window.showToast('Imagen adjuntada. Escribe tu pregunta sobre ella.', 'image');
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
});

// Remove attached image
ui.previewRemoveBtn.addEventListener('click', () => {
    pendingImageBase64 = null;
    pendingImageMimeType = null;
    ui.imagePreviewStrip.classList.remove('active');
    ui.previewThumb.src = '';

    if (ui.input.value.trim().length === 0) {
        ui.btnSend.disabled = true;
    }
});

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
    let sessionsToRender = [];
    
    if (window.currentFolderId) {
        const folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
        const folder = folders.find(f => f.id === window.currentFolderId);
        if (folder && folder.chatSessions) sessionsToRender = folder.chatSessions;
    } else {
        chatSessions = JSON.parse(localStorage.getItem('novastelar_chats')) || [];
        sessionsToRender = chatSessions;
    }
    
    ui.historyList.innerHTML = '';
    sessionsToRender.forEach(session => {
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
    let folders = [];
    let session = null;
    let folder = null;

    if (window.currentFolderId) {
        folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
        folder = folders.find(f => f.id === window.currentFolderId);
        if (folder && folder.chatSessions) session = folder.chatSessions.find(s => s.id === id);
    } else {
        session = chatSessions.find(s => s.id === id);
    }

    if (!session) return;
    const newName = prompt("Nuevo nombre para el chat:", session.summary);
    if (newName && newName.trim()) {
        session.summary = newName.trim();
        if (window.currentFolderId) {
            localStorage.setItem('nova_folders', JSON.stringify(folders));
            if (window.saveChatsToCloud) window.saveChatsToCloud();
        } else {
            saveChatsToLocal();
        }
        window.renderHistorySidebar();
        window.showToast('Chat renombrado.', 'edit');
    }
};

window.deleteChat = function(id) {
    window.showConfirmModal(
        "Eliminar Chat", 
        "¿Estás seguro de que deseas eliminar este chat? No podrás recuperarlo.", 
        () => {
            let folders = [];
            if (window.currentFolderId) {
                folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
                let folder = folders.find(f => f.id === window.currentFolderId);
                if (folder && folder.chatSessions) {
                    folder.chatSessions = folder.chatSessions.filter(s => s.id !== id);
                    localStorage.setItem('nova_folders', JSON.stringify(folders));
                    if (window.saveChatsToCloud) window.saveChatsToCloud();
                }
            } else {
                chatSessions = chatSessions.filter(s => s.id !== id);
                saveChatsToLocal();
            }
            
            window.renderHistorySidebar();
            window.showToast('Chat eliminado.', 'delete');
            
            if (currentSessionId === id) {
                ui.chatThread.innerHTML = '';
                ui.centralContent.style.display = 'flex';
                currentSessionId = null;
                isFirstMessage = true;
            }
        }
    );
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
    
    let session = null;
    if (window.currentFolderId) {
        let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
        let folder = folders.find(f => f.id === window.currentFolderId);
        if (folder && folder.chatSessions) session = folder.chatSessions.find(s => s.id === id);
    } else {
        session = chatSessions.find(s => s.id === id);
    }
    
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

    if ((this.value.trim().length > 0 || pendingImageBase64) && !isProcessing) {
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
    if ((text || pendingImageBase64) && !isProcessing) {
        window.submitPrompt(text || 'Describe esta imagen.');
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

        currentSessionId = Date.now(); // ID único
        const summary = text.length > 25 ? text.substring(0, 25) + '...' : text;
        const newSession = {
            id: currentSessionId,
            summary: summary,
            messages: []
        };

        if (window.currentFolderId) {
            let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
            let folder = folders.find(f => f.id === window.currentFolderId);
            if (folder) {
                folder.chatSessions = folder.chatSessions || [];
                folder.chatSessions.push(newSession);
                localStorage.setItem('nova_folders', JSON.stringify(folders));
                if (window.saveChatsToCloud) window.saveChatsToCloud();
            }
        } else {
            chatSessions.push(newSession);
            saveChatsToLocal(); // <-- Guardar inmediatamente para que no se pierda
        }

        // Actualizar el sidebar completo para que el nuevo chat tenga los 3 puntos de opciones
        window.renderHistorySidebar();
    }

    // Obtener Sesión Actual y guardar el mensaje del Usuario
    if (window.currentFolderId) {
        let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
        let folder = folders.find(f => f.id === window.currentFolderId);
        if (folder && folder.chatSessions) {
            let session = folder.chatSessions.find(s => s.id === currentSessionId);
            if (session) {
                session.messages.push({ role: 'user', text: text });
                localStorage.setItem('nova_folders', JSON.stringify(folders));
                if (window.saveChatsToCloud) window.saveChatsToCloud();
            }
        }
    } else {
        const currentSession = chatSessions.find(s => s.id === currentSessionId);
        if (currentSession) {
            currentSession.messages.push({ role: 'user', text: text });
            saveChatsToLocal();
        }
    }

    // If there's an attached image, capture it before clearing
    const attachedImageBase64 = pendingImageBase64;
    const attachedImageMime = pendingImageMimeType;
    const attachedImageSrc = attachedImageBase64 ? ui.previewThumb.src : null;

    // Clear the image attachment
    pendingImageBase64 = null;
    pendingImageMimeType = null;
    ui.imagePreviewStrip.classList.remove('active');
    ui.previewThumb.src = '';

    renderUserMessage(text, attachedImageSrc);
    scrollBottom();

    ui.loadingIndicator.classList.remove('hidden');
    scrollBottom();

    // Crear burbuja vacía
    const aiBubble = renderEmptyAIMessage();
    const aiContentDiv = aiBubble.querySelector('.bubble-content');
    
    // Callback para ir actualizando el texto en tiempo real
    const onChunk = (chunkText) => {
        ui.loadingIndicator.classList.add('hidden');
        aiContentDiv.innerHTML = window.marked ? marked.parse(chunkText) : chunkText;
        scrollBottom();
    };

    try {
        const iaResponse = await generateAIResponse(text, attachedImageBase64, attachedImageMime, onChunk);

        // Render final completo y highlighting (por si es una acción agéntica que ocultó el stream)
        aiContentDiv.innerHTML = window.marked ? marked.parse(iaResponse) : iaResponse;
        if (window.Prism) Prism.highlightAllUnder(aiBubble);

        // Guardar mensaje de la IA
        if (window.currentFolderId) {
            let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
            let folder = folders.find(f => f.id === window.currentFolderId);
            if (folder && folder.chatSessions) {
                let session = folder.chatSessions.find(s => s.id === currentSessionId);
                if (session) {
                    session.messages.push({ role: 'ai', text: iaResponse });
                    localStorage.setItem('nova_folders', JSON.stringify(folders));
                    if (window.saveChatsToCloud) window.saveChatsToCloud();
                }
            }
        } else {
            const currentSession = chatSessions.find(s => s.id === currentSessionId);
            if (currentSession) {
                currentSession.messages.push({ role: 'ai', text: iaResponse });
                saveChatsToLocal();
            }
        }

    } catch (err) {
        ui.loadingIndicator.classList.add('hidden');
        aiContentDiv.innerHTML = "⚠️ **Fallo de Enlace Neuronal:** " + err.message;
        console.error(err);
    } finally {
        isProcessing = false;
        ui.input.disabled = false;
        ui.btnSend.innerHTML = '<span class="material-symbols-rounded text-[22px] font-medium">arrow_upward</span>';

        ui.input.focus();
        scrollBottom();
    }
}

function renderUserMessage(text, imageSrc) {
    const safeText = escapeHTML(text);
    const imageHTML = imageSrc ? `<img src="${imageSrc}" class="msg-user-image" alt="Imagen adjuntada">` : '';
    const html = `
        <div class="msg-bubble msg-user animate-[fadeIn_0.3s_ease-out]">
            <div class="bubble-content shadow-sm text-[15.5px]">
                ${imageHTML}
                ${safeText}
            </div>
        </div>
    `;
    ui.chatThread.insertAdjacentHTML('beforeend', html);
}

function renderEmptyAIMessage() {
    const aiName = localStorage.getItem('nova_ai_name') || 'NovaStelar';
    const html = `
        <div class="msg-bubble msg-ai animate-[fadeIn_0.3s_ease-out]">
            <div class="bubble-avatar shadow-sm border border-brand-500/20">
                <span class="material-symbols-rounded text-[18px] text-brand-500">auto_awesome</span>
            </div>
            <div class="flex-1 w-full max-w-[85%]">
                <div class="text-[11px] font-bold text-brand-600 dark:text-brand-400 mb-0.5 tracking-wider uppercase">${aiName}</div>
                <div class="bubble-content markdown-body text-[15px] pt-0 pb-2">
                    <span class="animate-pulse">Escribiendo...</span>
                </div>
            </div>
        </div>
    `;
    ui.chatThread.insertAdjacentHTML('beforeend', html);
    return ui.chatThread.lastElementChild;
}

function renderAIMessage(markdownText) {
    const aiBubble = renderEmptyAIMessage();
    const aiContentDiv = aiBubble.querySelector('.bubble-content');
    aiContentDiv.innerHTML = window.marked ? marked.parse(markdownText) : markdownText;
    if (window.Prism) Prism.highlightAllUnder(aiBubble);
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
    
    // Si la IA estaba procesando, forzamos la cancelación visual
    isProcessing = false;
    ui.loadingIndicator.classList.add('hidden');
    ui.input.disabled = false;
    ui.btnSend.innerHTML = '<span class="material-symbols-rounded text-[22px] font-medium">arrow_upward</span>';

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
window.openSettingsModal = function() {
    const provider = localStorage.getItem('nova_ai_provider') || 'gemini';
    const key = localStorage.getItem('nova_api_key') || '';
    
    document.getElementById('select-ai-provider').value = provider;
    document.getElementById('input-api-key').value = key;
    
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.add('opacity-100');
    modal.querySelector('div').classList.remove('scale-95');
};

window.closeSettingsModal = function() {
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('opacity-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

window.saveAISettings = function() {
    const provider = document.getElementById('select-ai-provider').value;
    const key = document.getElementById('input-api-key').value.trim();
    
    localStorage.setItem('nova_ai_provider', provider);
    localStorage.setItem('nova_api_key', key);
    
    window.closeSettingsModal();
    window.showToast("Configuración IA guardada.", "settings");
};

// --- AGENTIC SYSTEM PROMPT --- //
const AGENT_SYSTEM_PROMPT = `Eres NovaStelar, un asistente IA avanzado con capacidades agénticas. Además de responder preguntas normalmente, puedes ejecutar acciones en la interfaz del usuario.

CUANDO el usuario te pida explícitamente realizar una de estas acciones en la interfaz, responde ÚNICAMENTE con un JSON válido en este formato exacto, sin texto adicional, sin markdown, sin backticks:
{"agent_action": "<acción>", "value": "<valor>", "confirmation": "<mensaje corto de confirmación>"}

Acciones disponibles:
- "create_folder" → Crear una nueva carpeta/entorno. value = nombre de la carpeta.
- "enter_folder" → Entrar/abrir/navegar a una carpeta existente. value = nombre exacto o parcial de la carpeta.
- "exit_folder" → Salir de la carpeta actual y volver al inicio. value = "".
- "clear_chat" → Limpiar/borrar el chat actual. value = "".
- "toggle_theme" → Cambiar entre tema claro y oscuro. value = "".
- "rename_ai" → Cambiar el nombre de la IA. value = nuevo nombre.

Ejemplos:
Usuario: "Crea una carpeta llamada Proyectos de Python"
Respuesta: {"agent_action": "create_folder", "value": "Proyectos de Python", "confirmation": "He creado la carpeta 'Proyectos de Python' para ti."}

Usuario: "Entra a la carpeta Matemáticas" o "Méteme a Matemáticas" o "Abre la carpeta Matemáticas"
Respuesta: {"agent_action": "enter_folder", "value": "Matemáticas", "confirmation": "Te he llevado a la carpeta 'Matemáticas'."}

Usuario: "Sal de esta carpeta" o "Vuelve al inicio"
Respuesta: {"agent_action": "exit_folder", "value": "", "confirmation": "He salido de la carpeta actual."}

Usuario: "Limpia este chat"
Respuesta: {"agent_action": "clear_chat", "value": "", "confirmation": "He limpiado el chat actual."}

Usuario: "Cambia al tema claro"
Respuesta: {"agent_action": "toggle_theme", "value": "", "confirmation": "He cambiado el tema de la interfaz."}

Si el usuario NO te pide explícitamente una de estas acciones, responde normalmente con texto. NUNCA respondas con JSON si no es una acción de interfaz.`;

// --- AGENTIC ACTION EXECUTOR --- //
function tryExecuteAgentAction(responseText) {
    // Try to detect if the response is an agent action JSON
    let cleaned = responseText.trim();
    
    // Remove markdown code fences if present
    if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }
    
    try {
        const action = JSON.parse(cleaned);
        if (!action.agent_action) return null; // Not an agent action
        
        switch (action.agent_action) {
            case 'create_folder': {
                if (!action.value) return null;
                let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
                const newFolder = {
                    id: 'folder_' + Date.now(),
                    name: action.value,
                    createdAt: new Date().toISOString()
                };
                folders.push(newFolder);
                localStorage.setItem('nova_folders', JSON.stringify(folders));
                if (window.saveChatsToCloud) window.saveChatsToCloud();
                if (window.renderFoldersGrid) window.renderFoldersGrid();
                break;
            }
            case 'enter_folder': {
                if (!action.value) return null;
                let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
                // Fuzzy match: find folder by exact name or partial match (case-insensitive)
                let folder = folders.find(f => f.name.toLowerCase() === action.value.toLowerCase());
                if (!folder) {
                    folder = folders.find(f => f.name.toLowerCase().includes(action.value.toLowerCase()));
                }
                if (!folder) {
                    action.confirmation = `No encontré ninguna carpeta con el nombre "${action.value}". Verifica que exista.`;
                    action._failed = true;
                    break;
                }
                // Use a small delay to let the current AI response render first
                setTimeout(() => {
                    window.enterFolder(folder.id);
                }, 600);
                action.confirmation = action.confirmation || `Te he llevado a la carpeta '${folder.name}'.`;
                break;
            }
            case 'exit_folder': {
                if (!window.currentFolderId) {
                    action.confirmation = 'No estás dentro de ninguna carpeta actualmente.';
                    action._failed = true;
                    break;
                }
                setTimeout(() => {
                    window.exitFolder();
                }, 600);
                break;
            }
            case 'clear_chat': {
                resetWorkspace();
                break;
            }
            case 'toggle_theme': {
                ui.btnTheme.click();
                break;
            }
            case 'rename_ai': {
                if (action.value) {
                    localStorage.setItem('nova_ai_name', action.value);
                }
                break;
            }
            default:
                return null;
        }
        
        return action;
    } catch (e) {
        return null; // Not JSON, normal text response
    }
}

async function generateAIResponse(prompt, imageBase64, imageMimeType, onChunk) {
    let provider = localStorage.getItem('nova_ai_provider') || 'gemini';
    let apiKey = localStorage.getItem('nova_api_key');
    
    // Si no hay API key, abrir modal
    if (!apiKey) {
        window.openSettingsModal();
        return "⚠️ Necesitas configurar tu API Key antes de hablar con la IA.";
    }

    // Build History
    let currentSession = null;
    let folderContext = null;
    
    if (window.currentFolderId) {
        let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
        let folder = folders.find(f => f.id === window.currentFolderId);
        if (folder) {
            folderContext = folder.context || null;
            if (folder.chatSessions) {
                currentSession = folder.chatSessions.find(s => s.id === currentSessionId);
            }
        }
    } else {
        currentSession = chatSessions.find(s => s.id === currentSessionId);
    }
    
    try {
        let rawResponse;
        
        // Interceptor para evitar mostrar JSON de acciones al usuario mientras hace streaming
        const internalOnChunk = (chunkText) => {
            const trimmed = chunkText.trimStart();
            // Si parece que está escribiendo JSON o markdown de JSON, no se actualiza la interfaz
            if (trimmed.startsWith('{') || trimmed.startsWith('```json') || trimmed.startsWith('```\n{')) {
                return;
            }
            if (onChunk) onChunk(chunkText);
        };

        if (provider === 'gemini') {
            rawResponse = await runGemini(prompt, currentSession, apiKey, folderContext, imageBase64, imageMimeType, internalOnChunk);
        } else if (provider === 'groq') {
            rawResponse = await runGroq(prompt, currentSession, apiKey, folderContext, internalOnChunk);
        }
        
        // --- AGENTIC INTERCEPTOR --- //
        const agentResult = tryExecuteAgentAction(rawResponse);
        if (agentResult) {
            const actionIcons = {
                create_folder: 'create_new_folder',
                enter_folder: 'folder_open',
                exit_folder: 'logout',
                clear_chat: 'delete_sweep',
                toggle_theme: 'contrast',
                rename_ai: 'badge'
            };
            const icon = actionIcons[agentResult.agent_action] || 'smart_toy';
            const badgeLabel = agentResult._failed ? 'Acción no completada' : 'Acción ejecutada';
            const badge = `<div class="agent-action-badge"><span class="material-symbols-rounded">${icon}</span> ${badgeLabel}</div>`;
            if (!agentResult._failed) {
                window.showToast('🤖 Acción agéntica ejecutada.', 'smart_toy');
            } else {
                window.showToast('⚠️ ' + agentResult.confirmation, 'warning');
            }
            return `${badge}\n\n${agentResult.confirmation || 'Listo.'}`; 
        }
        
        return rawResponse;
    } catch (err) {
        console.error("AI Error:", err);
        return `⚠️ **Fallo de Enlace Neuronal:** ${err.message}`;
    }
}

async function runGemini(prompt, currentSession, apiKey, folderContext, imageBase64, imageMimeType, onChunk) {
    let contents = [];
    
    // Inject Agent System Prompt + Folder Context
    let systemContext = AGENT_SYSTEM_PROMPT;
    if (folderContext) {
        systemContext += `\n\nCONTEXTO ADICIONAL DE CARPETA:\n${folderContext}`;
    }
    
    contents.push({
        role: 'user',
        parts: [{ text: `INSTRUCCIÓN DE SISTEMA / CONTEXTO OBLIGATORIO: \n\n${systemContext}\n\nActúa siempre bajo estas instrucciones en las siguientes interacciones.` }]
    });
    contents.push({
        role: 'model',
        parts: [{ text: "Entendido. Soy NovaStelar con capacidades agénticas y de visión. Responderé normalmente a menos que me pidas ejecutar una acción en la interfaz." }]
    });

    if (currentSession && currentSession.messages) {
        for (let msg of currentSession.messages) {
            if (!msg.text || msg.text.startsWith("⚠️")) continue;
            // Skip agent action badges from history
            if (msg.text.includes('agent-action-badge')) continue;
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        }
    }

    // Build the current user message parts
    let currentUserParts = [];
    
    // If there's an image attached, add it as inlineData (Gemini Vision)
    if (imageBase64 && imageMimeType) {
        currentUserParts.push({
            inlineData: {
                mimeType: imageMimeType,
                data: imageBase64
            }
        });
    }
    
    currentUserParts.push({ text: prompt });
    contents.push({ role: 'user', parts: currentUserParts });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contents })
    });
    
    if (!response.ok) {
        if (response.status === 400 || response.status === 403) {
            localStorage.removeItem('nova_api_key');
            throw new Error("API Key de Gemini inválida o sin permisos.");
        }
        throw new Error(`Error en API: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        // Split by lines instead of double-newlines for robust SSE parsing
        let lines = buffer.split(/\r?\n/);
        buffer = lines.pop(); // keep incomplete line
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr.trim() === '[DONE]') continue;
                try {
                    const data = JSON.parse(dataStr);
                    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                        const textPart = data.candidates[0].content.parts[0].text;
                        if (textPart) {
                            fullText += textPart;
                            if (onChunk) onChunk(fullText);
                        }
                    }
                } catch(e) { }
            }
        }
    }
    return fullText || "Lo siento, mi núcleo procesador generó una respuesta vacía.";
}

async function runGroq(prompt, currentSession, apiKey, folderContext, onChunk) {
    let messages = [];
    
    // Inject Agent System Prompt + Folder Context for Groq
    let systemContext = AGENT_SYSTEM_PROMPT;
    if (folderContext) {
        systemContext += `\n\nCONTEXTO ADICIONAL DE CARPETA:\n${folderContext}`;
    }
    messages.push({
        role: 'system',
        content: systemContext
    });

    if (currentSession && currentSession.messages) {
        for (let msg of currentSession.messages) {
            if (!msg.text || msg.text.startsWith("⚠️")) continue;
            if (msg.text.includes('agent-action-badge')) continue;
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
            });
        }
    }
    
    // Always add the current prompt
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ 
            model: "llama3-70b-8192",
            messages: messages,
            stream: true
        })
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('nova_api_key');
            throw new Error("API Key de Groq inválida.");
        }
        throw new Error(`Error en API Groq: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        
        // Split by lines for robust SSE parsing
        let lines = buffer.split(/\r?\n/);
        buffer = lines.pop(); 
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr.trim() === '[DONE]') continue;
                try {
                    const data = JSON.parse(dataStr);
                    if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                        const chunk = data.choices[0].delta.content;
                        if (chunk) {
                            fullText += chunk;
                            if (onChunk) onChunk(fullText);
                        }
                    }
                } catch(e) { }
            }
        }
    }
    return fullText || "Error al decodificar la respuesta de Groq.";
}

// --- FASE 1: NAVEGACIÓN DE CARPETAS (Solo Visual) --- //
window.toggleFoldersView = function() {
    const foldersScreen = document.getElementById('folders-screen');
    const sidebar = document.getElementById('sidebar');
    const mainView = document.querySelector('main');
    
    if (foldersScreen.classList.contains('hidden')) {
        // Mostrar Carpetas (Pantalla Completa)
        foldersScreen.classList.remove('hidden');
        sidebar.classList.add('hidden');
        mainView.classList.add('hidden');
        
        setTimeout(() => {
            foldersScreen.classList.remove('opacity-0', 'pointer-events-none');
            foldersScreen.classList.add('opacity-100');
        }, 50);
    } else {
        // Volver al Inicio
        foldersScreen.classList.remove('opacity-100');
        foldersScreen.classList.add('opacity-0', 'pointer-events-none');
        
        setTimeout(() => {
            foldersScreen.classList.add('hidden');
            sidebar.classList.remove('hidden');
            mainView.classList.remove('hidden');
        }, 300);
    }
};

window.toggleUserDropdown = function() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown.classList.contains('opacity-0')) {
        dropdown.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        dropdown.classList.add('opacity-100', 'scale-100');
    } else {
        dropdown.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        dropdown.classList.remove('opacity-100', 'scale-100');
    }
};

// Cerrar dropdown al hacer click afuera
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('user-dropdown');
    const avatar = document.getElementById('user-avatar-icon');
    if (dropdown && avatar && !dropdown.contains(e.target) && !avatar.contains(e.target)) {
        dropdown.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        dropdown.classList.remove('opacity-100', 'scale-100');
    }
});

window.openCreateFolderModal = function() {
    const modal = document.getElementById('create-folder-modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
};

window.closeCreateFolderModal = function() {
    const modal = document.getElementById('create-folder-modal');
    modal.classList.remove('opacity-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

// --- FASE 2: LÓGICA DE CARPETAS --- //

window.createNewFolder = async function() {
    const inputName = document.getElementById('input-folder-name');
    const folderName = inputName.value.trim();
    
    if (!folderName) {
        window.showToast("El nombre de la carpeta no puede estar vacío.", "warning");
        return;
    }
    
    // Obtener carpetas actuales
    let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
    
    // Crear nueva carpeta
    const newFolder = {
        id: 'folder_' + Date.now(),
        name: folderName,
        createdAt: new Date().toISOString()
    };
    
    folders.push(newFolder);
    localStorage.setItem('nova_folders', JSON.stringify(folders));
    
    inputName.value = ''; // Limpiar input
    window.closeCreateFolderModal();
    window.showToast(`Carpeta "${folderName}" creada.`, "create_new_folder");
    
    window.renderFoldersGrid();
    
    // Guardar en la nube (Fase 2 extendida)
    if (window.saveChatsToCloud) {
        window.saveChatsToCloud();
    }
};

window.renderFoldersGrid = function() {
    const grid = document.getElementById('folders-grid');
    if (!grid) return;
    
    // Limpiar grid dejando solo el botón de crear
    grid.innerHTML = `
        <!-- Caja Grande para Crear Carpeta -->
        <button onclick="window.openCreateFolderModal()" class="flex flex-col items-center justify-center gap-4 min-h-[220px] bg-white/50 dark:bg-white/5 border-2 border-dashed border-gray-300 dark:border-white/20 rounded-3xl hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-300 group shadow-sm hover:shadow-xl">
            <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors text-gray-400 dark:text-gray-500">
                <span class="material-symbols-rounded text-3xl">add</span>
            </div>
            <span class="font-semibold text-gray-600 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 text-lg">Nueva Carpeta</span>
        </button>
    `;
    
    let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
    
    // Filtro por búsqueda
    const searchInput = document.getElementById('input-search-folder');
    if (searchInput && searchInput.value.trim() !== '') {
        const term = searchInput.value.trim().toLowerCase();
        folders = folders.filter(f => f.name.toLowerCase().includes(term));
    }
    
    // Filtro por favoritos
    if (window.isFavoritesFilterActive) {
        folders = folders.filter(f => f.isFavorite);
    }
    
    // Ordenar: Favoritos primero
    folders.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return 0;
        return a.isFavorite ? -1 : 1;
    });
    
    folders.forEach(folder => {
        const folderDiv = document.createElement('div');
        folderDiv.className = "flex flex-col p-6 min-h-[220px] bg-white dark:bg-nova-800 border border-gray-200 dark:border-white/10 rounded-3xl hover:border-brand-500 dark:hover:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer group relative overflow-hidden";
        folderDiv.onclick = () => window.enterFolder(folder.id);
        
        const numChats = folder.chatSessions ? folder.chatSessions.length : 0;
        const textChats = numChats === 1 ? '1 chat' : `${numChats} chats`;
        
        folderDiv.innerHTML = `
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-500/10 to-purple-500/10 rounded-bl-full -z-0"></div>
            <div class="flex justify-between items-start mb-4 relative z-10">
                <div class="flex gap-2 items-start">
                    <div class="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-sm">
                        <span class="material-symbols-rounded text-3xl">folder</span>
                    </div>
                    ${folder.isFavorite ? '<span class="material-symbols-rounded text-yellow-500 text-2xl mt-1 fill-current" title="Favorito">star</span>' : ''}
                </div>
                <!-- Menú de Opciones de Carpeta -->
                <div class="relative folder-options-menu">
                    <button class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors" onclick="window.toggleFolderOptions(event, '${folder.id}')">
                        <span class="material-symbols-rounded text-xl">more_vert</span>
                    </button>
                    <div id="folder-dropdown-${folder.id}" class="absolute right-0 top-10 w-48 bg-white dark:bg-nova-800 rounded-xl shadow-xl border border-gray-100 dark:border-white/10 opacity-0 pointer-events-none transform scale-95 transition-all duration-200 z-50">
                        <div class="p-1.5 flex flex-col gap-1">
                            <button onclick="window.toggleFavoriteFolder(event, '${folder.id}')" class="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2">
                                <span class="material-symbols-rounded text-[18px] ${folder.isFavorite ? 'text-yellow-500 fill-current' : ''}">star</span> ${folder.isFavorite ? 'Quitar Favorito' : 'Fijar Favorito'}
                            </button>
                            <button onclick="window.renameFolder(event, '${folder.id}')" class="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 flex items-center gap-2">
                                <span class="material-symbols-rounded text-[18px]">edit</span> Renombrar
                            </button>
                            <button onclick="window.deleteFolder(event, '${folder.id}')" class="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2">
                                <span class="material-symbols-rounded text-[18px]">delete</span> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2 relative z-10 line-clamp-2">${folder.name}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-auto relative z-10 flex items-center gap-1">
                <span class="material-symbols-rounded text-[14px]">chat_bubble</span> ${textChats} en el entorno
            </p>
        `;
        
        grid.appendChild(folderDiv);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.renderFoldersGrid) {
        window.renderFoldersGrid();
    }
});

// Cerrar dropdowns de carpetas al clickear fuera
document.addEventListener('click', (e) => {
    document.querySelectorAll('[id^="folder-dropdown-"]').forEach(dropdown => {
        const btn = dropdown.previousElementSibling; // el botón que lo abre
        if (!dropdown.contains(e.target) && (!btn || !btn.contains(e.target))) {
            dropdown.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
    });
});

window.toggleFolderOptions = function(event, folderId) {
    event.stopPropagation();
    
    // Cerrar otros dropdowns
    document.querySelectorAll('[id^="folder-dropdown-"]').forEach(d => {
        if (d.id !== `folder-dropdown-${folderId}`) {
            d.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        }
    });

    const dropdown = document.getElementById(`folder-dropdown-${folderId}`);
    if (dropdown) {
        dropdown.classList.toggle('opacity-0');
        dropdown.classList.toggle('pointer-events-none');
        dropdown.classList.toggle('scale-95');
    }
};

window.renameFolder = function(event, folderId) {
    event.stopPropagation();
    window.toggleFolderOptions(event, folderId); // Close menu
    
    let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
    let folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const newName = prompt("Nuevo nombre de la carpeta:", folder.name);
    if (newName && newName.trim() !== '') {
        folder.name = newName.trim();
        localStorage.setItem('nova_folders', JSON.stringify(folders));
        if (window.saveChatsToCloud) window.saveChatsToCloud();
        window.renderFoldersGrid();
        window.showToast("Carpeta renombrada exitosamente.", "edit");
    }
};

window.isFavoritesFilterActive = false;

window.toggleFavoritesFilter = function() {
    window.isFavoritesFilterActive = !window.isFavoritesFilterActive;
    
    const btn = document.getElementById('btn-filter-favorites');
    const icon = document.getElementById('icon-filter-favorites');
    
    if (window.isFavoritesFilterActive) {
        btn.classList.add('bg-yellow-50', 'dark:bg-yellow-500/10', 'border-yellow-500', 'text-yellow-500');
        btn.classList.remove('bg-white', 'dark:bg-nova-800', 'text-gray-400');
        icon.classList.add('fill-current');
    } else {
        btn.classList.remove('bg-yellow-50', 'dark:bg-yellow-500/10', 'border-yellow-500', 'text-yellow-500');
        btn.classList.add('bg-white', 'dark:bg-nova-800', 'text-gray-400');
        icon.classList.remove('fill-current');
    }
    
    window.renderFoldersGrid();
};

window.toggleFavoriteFolder = function(event, folderId) {
    event.stopPropagation();
    window.toggleFolderOptions(event, folderId); // Close menu
    
    let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
    let folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    folder.isFavorite = !folder.isFavorite;
    localStorage.setItem('nova_folders', JSON.stringify(folders));
    if (window.saveChatsToCloud) window.saveChatsToCloud();
    window.renderFoldersGrid();
};

window.deleteFolder = function(event, folderId) {
    event.stopPropagation();
    window.toggleFolderOptions(event, folderId); // Close menu
    
    window.showConfirmModal(
        "Eliminar Entorno",
        "¿Estás seguro de que deseas eliminar este entorno? Se borrarán todos los historiales y notas internamente.",
        () => {
            let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
            folders = folders.filter(f => f.id !== folderId);
            localStorage.setItem('nova_folders', JSON.stringify(folders));
            if (window.saveChatsToCloud) window.saveChatsToCloud();
            window.renderFoldersGrid();
            window.showToast("Entorno eliminado del sistema.", "delete");
        }
    );
};

// Modal de Confirmación Global
window.showConfirmModal = function(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-message').textContent = message;
    
    const confirmBtn = document.getElementById('confirm-modal-btn');
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.onclick = () => {
        window.closeConfirmModal();
        if (onConfirm) onConfirm();
    };
    
    modal.classList.remove('hidden');
    void modal.offsetWidth; // Forzar reflow
    modal.classList.add('opacity-100');
    modal.querySelector('div').classList.remove('scale-95');
};

window.closeConfirmModal = function() {
    const modal = document.getElementById('confirm-modal');
    modal.classList.remove('opacity-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

// --- KNOWLEDGE BASE (CONTEXTO DE CARPETA) --- //
window.openKnowledgeModal = function() {
    if (!window.currentFolderId) return;
    
    let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
    let folder = folders.find(f => f.id === window.currentFolderId);
    
    if (folder) {
        document.getElementById('input-folder-knowledge').value = folder.context || '';
    }
    
    const modal = document.getElementById('knowledge-modal');
    modal.classList.remove('hidden');
    void modal.offsetWidth;
    modal.classList.add('opacity-100');
    modal.querySelector('div').classList.remove('scale-95');
};

window.closeKnowledgeModal = function() {
    const modal = document.getElementById('knowledge-modal');
    modal.classList.remove('opacity-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

window.saveFolderKnowledge = function() {
    if (!window.currentFolderId) return;
    
    const text = document.getElementById('input-folder-knowledge').value.trim();
    
    let folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
    let folder = folders.find(f => f.id === window.currentFolderId);
    
    if (folder) {
        folder.context = text;
        localStorage.setItem('nova_folders', JSON.stringify(folders));
        if (window.saveChatsToCloud) window.saveChatsToCloud();
        
        window.closeKnowledgeModal();
        window.showToast("Conocimiento anclado exitosamente.", "menu_book");
    }
};

window.currentFolderId = null;

window.enterFolder = function(folderId) {
    const folders = JSON.parse(localStorage.getItem('nova_folders') || '[]');
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    window.currentFolderId = folderId;
    currentSessionId = null;
    
    // Ocultar pantalla de carpetas
    document.getElementById('folders-screen').classList.add('hidden');
    document.getElementById('folders-screen').classList.remove('opacity-100');
    
    // Mostrar sidebar normal (para subchats)
    document.getElementById('sidebar').classList.remove('hidden');
    document.querySelector('main').classList.remove('hidden');
    
    // Cambiar headers y sidebar
    document.getElementById('main-header-title').classList.add('hidden');
    document.getElementById('header-toggle-sidebar').classList.add('hidden');
    document.getElementById('folder-header-title').classList.remove('hidden');
    document.getElementById('folder-header-title').classList.add('flex');
    document.getElementById('current-folder-name').textContent = folder.name;
    
    // UI Sidebar específica
    document.getElementById('btn-folders-view').classList.add('hidden');
    document.getElementById('sidebar-history-label').textContent = `Chats en ${folder.name}`;
    
    // Configurar estado limpio
    ui.chatThread.innerHTML = '';
    ui.centralContent.style.display = 'flex';
    ui.chatThread.classList.add('hidden');
    isFirstMessage = true;
    
    // Renderizar historial lateral de LA CARPETA
    window.renderHistorySidebar();
    
    if (window.Prism) Prism.highlightAll();
};

window.exitFolder = function() {
    window.currentFolderId = null;
    currentSessionId = null;
    
    // Restaurar UI normal
    document.getElementById('main-header-title').classList.remove('hidden');
    document.getElementById('folder-header-title').classList.add('hidden');
    document.getElementById('folder-header-title').classList.remove('flex');
    if (window.innerWidth > 768) {
        document.getElementById('header-toggle-sidebar').classList.remove('hidden');
    }

    // Restaurar Sidebar
    document.getElementById('btn-folders-view').classList.remove('hidden');
    document.getElementById('sidebar-history-label').textContent = 'Reciente';
    
    // Refrescar el historial lateral con LOS CHATS GLOBALES
    window.renderHistorySidebar();
    
    // Limpiar el chat
    ui.chatThread.innerHTML = '';
    ui.centralContent.style.display = 'flex';
    ui.chatThread.classList.add('hidden');
    isFirstMessage = true;

    // Mostrar pantalla de carpetas
    const foldersScreen = document.getElementById('folders-screen');
    const mainView = document.querySelector('main');
    
    foldersScreen.classList.remove('hidden');
    document.getElementById('sidebar').classList.add('hidden');
    mainView.classList.add('hidden');
    
    setTimeout(() => {
        foldersScreen.classList.remove('opacity-0', 'pointer-events-none');
        foldersScreen.classList.add('opacity-100');
    }, 50);
};
