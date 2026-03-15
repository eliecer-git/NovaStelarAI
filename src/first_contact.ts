export interface SuggestionOption {
    id: string;
    label: string;
    targetMode: 'FOCUS' | 'CREATIVE' | 'EMPATHIC' | 'OPEN';
    icon: string;
}

export class FirstContactProtocol {
    private readonly greetings = ['hola', 'buenos dias', 'buenas', 'hello', 'hey', 'saludos'];

    public readonly suggestions: SuggestionOption[] = [
        { id: 'opt_creative', label: 'Crear una imagen o música', targetMode: 'CREATIVE', icon: '🎨' },
        { id: 'opt_focus', label: 'Resolver código o matemáticas', targetMode: 'FOCUS', icon: '💻' },
        { id: 'opt_empathic', label: 'Solo conversar por diversión', targetMode: 'EMPATHIC', icon: '💬' },
        { id: 'opt_open', label: 'Otro tema...', targetMode: 'OPEN', icon: '🚀' }
    ];

    /**
     * Evalúa si el mensaje inicial es un saludo.
     */
    public isGreeting(message: string): boolean {
        const normalized = message.toLowerCase().trim();
        // Regex para detectar si la frase contiene un saludo principal
        return this.greetings.some(g => normalized.includes(g) && normalized.length < 20); // Asume que un saludo es corto
    }

    /**
     * Genera la respuesta del sistema al detectar un saludo.
     */
    public handleGreeting(): { reply: string, showSuggestions: boolean } {
        return {
            reply: '¡Hola! Qué alegría verte por aquí. ¿Qué vamos a hacer hoy? ✨',
            showSuggestions: true
        };
    }

    /**
     * Maneja la selección de una sugerencia por parte del usuario.
     */
    public handleSuggestionSelection(targetMode: string): string {
        if (targetMode === 'OPEN') {
            return "¡Perfecto! Soy todo oídos, dime qué tienes en mente y nos ponemos manos a la obra. 🚀";
        }

        switch (targetMode) {
            case 'FOCUS':
                return "Modo Foco activado. Listo para compilar, calcular y resolver. ¿Cuál es el problema? 🛠️";
            case 'CREATIVE':
                return "Modo Creativo activo. ¡Saquemos a pasear la imaginación! ¿Qué generamos? 🎨";
            case 'EMPATHIC':
                return "Modo Empático listo. Me pongo cómodo, cuéntame lo que quieras. ☕";
            default:
                return "Modo ajustado.";
        }
    }
}
