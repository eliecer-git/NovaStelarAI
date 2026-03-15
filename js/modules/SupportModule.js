export class SupportModule {
    constructor(system) {
        this.system = system;
        this.name = 'Soporte Tecnológico';
    }

    onActivate() {
        this.system.appendMessage('Sistema de Soporte Tecnológico activo. Preparado para maximizar el uso de los recursos de NovaStelarAI.');
    }

    processCommand(input) {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('guia') || lowerInput.includes('ayuda')) {
            return "Iniciando protocolo de guía interactivo. Le asistiré en el descubrimiento de las capacidades multimodales de la plataforma.";
        }
        
        if (lowerInput.includes('error') || lowerInput.includes('falla')) {
            return "Analizando log de errores locales. Calibrando sistema de diagnóstico para resolución de excepciones.";
        }

        return "Su consulta tecnológica ha sido registrada. Por favor especifique el módulo o función que requiere atención técnica.";
    }
}
