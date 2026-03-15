export type InteractionMode = 'FOCUS' | 'CREATIVE' | 'EMPATHIC';

export interface PromptAnalysis {
    mode: InteractionMode;
    keywordsDetected: string[];
    isTechnical: boolean;
}

export interface MediaGenerationRequest {
    type: 'IMAGE' | 'AUDIO' | 'VIDEO';
    prompt: string;
    contextMode: InteractionMode;
}

export class MultimodalGenerator {
    /**
     * Valida que la generación de contenido multimedia respete el tono de la conversación.
     */
    public validateMediaTone(request: MediaGenerationRequest): string {
        if (request.contextMode === 'FOCUS') {
            return `Modificando prompt para [${request.type}]: Asegurando un estilo sobrio, profesional, minimalista y libre de distracciones o tonos festivos. Base prompt: "${request.prompt}"`;
        }

        if (request.contextMode === 'CREATIVE') {
            return `Modificando prompt para [${request.type}]: Añadiendo energía, creatividad, colores vibrantes y un tono inspirador. Base prompt: "${request.prompt}"`;
        }

        // EMPATHIC
        return `Modificando prompt para [${request.type}]: Usando un tono relajante, equilibrado, amable y acogedor. Base prompt: "${request.prompt}"`;
    }

    public async generateMedia(request: MediaGenerationRequest): Promise<string> {
        const adjustedPrompt = this.validateMediaTone(request);
        // Simulando la llamada al motor de IA generativa (Stable Diffusion, MusicGen, etc.)
        console.log(`[Generando ${request.type}] -> ${adjustedPrompt}`);
        return `Archivo ${request.type.toLowerCase()} generado exitosamente basado en el tono ${request.contextMode}.`;
    }
}
