// Unidad 4: Tipos FrontEnd para interactuar con la Omnisciencia

export interface InformationSource {
    type: 'VECTOR_DB' | 'INTERNET_RAG';
    confidenceScore: number;
    url?: string;
    verifiedAt: Date;
}

export interface OmniscienceResponse {
    query: string;
    answer: string;
    source: InformationSource;
    isVerified: boolean; // Regla de Oro
}

export class KnowledgeFetcher {
    /**
     * Solicita información a la Base de Sabiduría.
     * Garantiza que la UI refleje el proceso de la Regla de Oro.
     */
    public async fetchVerifiedKnowledge(query: string): Promise<OmniscienceResponse> {
        console.log(`[NovaStelarAI] 🧠 Consultando la Omnisciencia para: "${query}"...`);

        // Simular llamada al backend RAG y búsqueda en internet si la IA no sabe
        return new Promise((resolve) => {
            setTimeout(() => {
                const isInternalKnowledge = query.includes('matemática') || query.includes('código');

                if (isInternalKnowledge) {
                    resolve({
                        query,
                        answer: "El resultado de la ecuación cuadrática fue calculado localmente con precisión 100%.",
                        source: { type: 'VECTOR_DB', confidenceScore: 100, verifiedAt: new Date() },
                        isVerified: true
                    });
                } else {
                    console.log(`[NovaStelarAI] 🌍 Conocimiento interno a < 100%. Emprendiendo búsqueda web y síntesis...`);
                    resolve({
                        query,
                        answer: "Información verificada desde fuentes en tiempo real sobre tu consulta.",
                        source: { type: 'INTERNET_RAG', confidenceScore: 100, url: 'https://fuente-verificada.org', verifiedAt: new Date() },
                        isVerified: true
                    });
                }
            }, 800);
        });
    }
}
