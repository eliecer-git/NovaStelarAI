import json

HTML_FILE = "index.html"
JS_FILE = "js/ui_controller.js"

with open(HTML_FILE, "r") as f:
    html_content = f.read()

# Fix UI (U3): Adjust padding of the input and the direction of mode selector (though native select direction is browser controlled, we can add a class).
# padding del input para que los iconos no se amontonen
html_content = html_content.replace(
    '<div class="py-2 px-3">',
    '<div class="py-3 px-4 mb-2">'
)
# Top-full / direction
html_content = html_content.replace(
    'class="pl-3 pr-8 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/10 focus:outline-none appearance-none cursor-pointer transition-colors mode-selector-focus"',
    'style="direction: rtl;" class="pl-8 pr-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 hover:bg-white/10 focus:outline-none appearance-none cursor-pointer transition-colors mode-selector-focus"'
)
html_content = html_content.replace(
    '<span class="material-symbols-rounded text-[16px] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">expand_more</span>',
    '<span class="material-symbols-rounded text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" style="transform: translateY(-50%) rotate(180deg);">expand_more</span>'
)


with open(HTML_FILE, "w") as f:
    f.write(html_content)


with open(JS_FILE, "r") as f:
    js_content = f.read()

# U8: Persistencia
js_content = js_content.replace(
    "let sessionUser = {",
    "let chatHistory = [];\nlet isLoading = false;\n\nlet sessionUser = {"
)

js_onboarding = """// --- LOGICA DE ONBOARDING ---
function checkPersistence() {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
        sessionUser = JSON.parse(saved);
        uiElements.userAvatar.textContent = sessionUser.name.charAt(0).toUpperCase();
        finishOnboarding(true, true);
    }
}

function finishOnboarding(skipped = false, fromStorage = false) {
    if (!skipped) {
        const inputNameVal = uiElements.inputName.value.trim();
        if (inputNameVal) {
            sessionUser.name = inputNameVal;
            uiElements.userAvatar.textContent = inputNameVal.charAt(0).toUpperCase();
        }
        sessionUser.level = uiElements.selectExp.value;
        localStorage.setItem('userProfile', JSON.stringify(sessionUser));
    }

    if(skipped && !fromStorage) {
         localStorage.setItem('userProfile', JSON.stringify(sessionUser));
    }

    uiElements.onboardingModal.classList.add('opacity-0');
    setTimeout(() => {
        uiElements.onboardingModal.style.display = 'none';

        uiElements.body.classList.remove('overflow-hidden');
        uiElements.mainInterface.classList.remove('opacity-0', 'blur-sm', 'pointer-events-none');
        uiElements.mainInterface.classList.add('opacity-100');

        updateAIResponse(`Sistemas en línea. ¿Qué vamos a hacer hoy, ${sessionUser.name}?`);
        setMode('FOCUS');

        if (chatHistory.length === 0) {
            fadeSuggestions(true);
        }
    }, fromStorage ? 0 : 700);
}
"""

js_content = js_content.replace(
    """// --- LOGICA DE ONBOARDING ---
function finishOnboarding(skipped = false) {
    if (!skipped) {
        const inputNameVal = uiElements.inputName.value.trim();
        if (inputNameVal) {
            sessionUser.name = inputNameVal;
            uiElements.userAvatar.textContent = inputNameVal.charAt(0).toUpperCase();
        }
        sessionUser.level = uiElements.selectExp.value;
    }

    uiElements.onboardingModal.classList.add('opacity-0');
    setTimeout(() => {
        uiElements.onboardingModal.style.display = 'none';

        uiElements.body.classList.remove('overflow-hidden');
        uiElements.mainInterface.classList.remove('opacity-0', 'blur-sm', 'pointer-events-none');
        uiElements.mainInterface.classList.add('opacity-100');

        updateAIResponse(`Sistemas en línea. ¿Qué vamos a hacer hoy, ${sessionUser.name}?`);
        setMode('FOCUS');

        // Mostrar sugerencias automáticamente al iniciar
        fadeSuggestions(true);
    }, 700);
}""", js_onboarding
)

js_content = js_content.replace(
"""// Inicialización de transiciones de las sugerencias
uiElements.suggestionsPanel.style.transition = 'opacity 0.5s ease';
uiElements.sendBtn.setAttribute('disabled', 'true');""",
"""// Inicialización de transiciones de las sugerencias
uiElements.suggestionsPanel.style.transition = 'opacity 0.5s ease';
uiElements.sendBtn.setAttribute('disabled', 'true');
checkPersistence();"""
)

# Lógica de vista (chatHistory)
js_content = js_content.replace(
    """    const loadingTexts = ['Analizando...', 'Procesando en paralelo...', 'Conectando con el Cerebro Global...'];
    updateAIResponse(loadingTexts[Math.floor(Math.random() * loadingTexts.length)]);
    fadeSuggestions(false);""",
    """    isLoading = true;
    chatHistory.push({ role: 'user', content: text });
    fadeSuggestions(false);
    updateAIResponse("Procesando..."); // Solo si isLoading es true
"""
)

js_content = js_content.replace(
    "const data = await response.json();",
    "const data = await response.json();\n        isLoading = false;\n        chatHistory.push({ role: 'ai', content: data.reply || 'Completado' });"
)

js_content = js_content.replace(
    """setTimeout(() => {
            console.log("[NovaStelarAI] 🔄 Utilizando Fallback Vectorial Offline.");
            updateAIResponse(`He analizado tu mensaje de forma local: "${text}". Ejecución Omnimodal Offline completada. ✅`);
            resetInput(true);
        }, 2000);""",
    """setTimeout(() => {
            isLoading = false;
            console.log("[NovaStelarAI] 🔄 Utilizando Fallback Vectorial Offline.");
            const replyMsg = `He analizado tu mensaje de forma local: "${text}". Ejecución Omnimodal Offline completada. ✅`;
            updateAIResponse(replyMsg);
            chatHistory.push({ role: 'ai', content: replyMsg });
            resetInput(true);
        }, 2000);"""
)

with open(JS_FILE, "w") as f:
    f.write(js_content)
