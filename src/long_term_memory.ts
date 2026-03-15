export interface UserPreferences {
    colors: string[];
    tone: string;
    favorite_topics: string[];
}

export interface CognitiveProgression {
    [key: string]: string | string[];
    learned_concepts: string[];
}

export interface UserMemorySnapshot {
    preferences: UserPreferences;
    projects: { [projectName: string]: any };
    cognitive_progression: CognitiveProgression;
    last_interaction: string;
}

export class LongTermMemoryInterface {
    /**
     * Unidad 8: Consumo Frontend de la Memoria a Largo Plazo.
     * Esta clase interceptaría las llamadas de API de Rust/Python para 
     * inyectar tu historia y tus gustos en el contexto del chat.
     */

    public loadMemoryContext(): Promise<UserMemorySnapshot> {
        console.log("[LTM Interface] 🧠 Descargando contexto del Capitán (preferencias, proyectos, nivel)...");

        // Simula la llamada al backend que devuelve el JSON de memoria
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    preferences: {
                        colors: ["neón", "oscuro", "cyan"],
                        tone: "profesional y enfocado",
                        favorite_topics: ["tecnología", "física cuántica"]
                    },
                    projects: {
                        'NovaStelarAI': { status: 'Construyendo Unidades', tech_stack: ['HTML', 'CSS', 'Vanilla JS'] }
                    },
                    cognitive_progression: {
                        python_level: 'avanzado',
                        learned_concepts: ['AsyncIO', 'Glassmorphism Design']
                    },
                    last_interaction: new Date().toISOString()
                });
            }, 300);
        });
    }

    public generateSystemPrompt(memory: UserMemorySnapshot): string {
        return `
            Eres NovaStelarAI. 
            El usuario prefiere un tono ${memory.preferences.tone}. 
            Último proyecto trabajado: NovaStelarAI.
            Evita explicar conceptos básicos de CSS o AsyncIO, ya que el usuario ya los domina 
            (Nivel Python: ${memory.cognitive_progression['python_level']}). 
            Mantén respuestas optimizadas para la memoria a largo plazo.
        `;
    }
}
