// Unidad 7: Streaming Inteligente y Zero Latency en TypeScript (Gestor de Carga Frontend)

export class StreamingEngine {
    private responseQueue: string[] = [];
    private isStreaming: boolean = false;

    /**
     * Mantiene entretenido al usuario mientras espera tareas pesadas (música/videos).
     * Cero silencios incómodos.
     */
    public startConversationalFiller(onUpdate: (fillerText: string) => void) {
        const fillers = [
            'Procesando coordenadas estelares... 🚀',
            'Analizando la densidad de datos... ✨',
            'Sintetizando frecuencias de audio... 🎧',
            'Casi listo, afinando los últimos píxeles del render... 🖼️'
        ];

        let index = 0;
        const intervalId = setInterval(() => {
            if (index < fillers.length && this.isStreaming) {
                onUpdate(fillers[index]);
                index++;
            } else {
                clearInterval(intervalId);
            }
        }, 1500); // Cada 1.5s decimos algo para mantener el interés
    }

    /**
     * Encola trozos de la respuesta y los envía a la UI letra por letra
     * Empieza a emitir ANTES de los 200ms.
     */
    public startZeroLatencyStream(fullResponse: string, onCharReceived: (char: string) => void) {
        console.log('[Streaming Engine] ⚡ Comenzando streaming instantáneo en < 200ms');
        this.isStreaming = true;
        let index = 0;

        const streamInterval = setInterval(() => {
            if (index < fullResponse.length) {
                onCharReceived(fullResponse[index]);
                index++;
            } else {
                clearInterval(streamInterval);
                this.isStreaming = false;
            }
        }, 30); // Escribimos rápido como una IA top
    }

    /**
     * Lógica de Gestión de Carga Paralela
     * Envía solicitudes concurrentes y reacciona cuando cada una termina,
     * sin que la música trabe el video, ni el código frene a la charla.
     */
    public async handleParallelTasks(tasks: string[], onTaskFinished: (result: string) => void) {
        console.log(`[Carga Paralela] 🚄💨 Distibuyendo ${tasks.length} trabajos simultáneos...`);

        // Simulación de Promising asíncrono puro de Node.js (que en produccón llamaría al Rust Core)
        const asyncWorkers = tasks.map(async (taskName, index) => {
            return new Promise<string>((resolve) => {
                const randomTime = Math.random() * 2000 + 500; // Entre 0.5s y 2.5s
                setTimeout(() => {
                    const result = `✔️ Operación completada (Threading): ${taskName}`;
                    onTaskFinished(result);
                    resolve(result);
                }, randomTime);
            });
        });

        await Promise.all(asyncWorkers);
        console.log('[Carga Paralela] 🌟 Todas las ramas de conocimiento sincronizadas.');
    }
}
