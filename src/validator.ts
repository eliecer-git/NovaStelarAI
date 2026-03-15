export type InteractionMode = 'FOCUS' | 'CREATIVE' | 'EMPATHIC';

export interface PromptAnalysis {
    mode: InteractionMode;
    keywordsDetected: string[];
    isTechnical: boolean;
}

export class LogicValidator {
    private static readonly focusTerms = [
        'error', 'función', 'funcion', 'ecuación', 'ecuacion',
        'derivada', 'código', 'codigo', 'bug', 'matemáticas',
        'matematicas', 'python', 'typescript'
    ];

    /**
     * Valida la intención del usuario y ajusta el modo en TypeScript.
     * Si no se cumplen condiciones técnicas, revierte a un estado amigable.
     */
    public analyzeIntention(prompt: string): PromptAnalysis {
        const lowerPrompt = prompt.toLowerCase();
        const detected = LogicValidator.focusTerms.filter(term => lowerPrompt.includes(term));

        if (detected.length > 0) {
            return {
                mode: 'FOCUS',
                keywordsDetected: detected,
                isTechnical: true
            };
        }

        // Se puede ampliar lógica con otros vocabularios
        return {
            mode: 'EMPATHIC',
            keywordsDetected: [],
            isTechnical: false
        };
    }
}
