class MultimodalGenerator:
    def __init__(self):
        pass

    def validate_media_tone(self, media_type: str, prompt: str, context_mode: str) -> str:
        """
        Garantiza que el tipo de medio (audio/imagen/video) y el prompt sigan el tono de la conversación.
        """
        if context_mode == "FOCUS":
            # Para temas serios o técnicos, bloqueamos el modo festivo
            return f"Modificando prompt para [{media_type}]: Tono sobrio, instrumental de concentración/lofi sin distracciones, o diseño gráfico técnico y limpio. Base: '{prompt}'"
            
        elif context_mode == "CREATIVE":
            # Liberamos creatividad
            return f"Modificando prompt para [{media_type}]: Estilo inspirador, enérgico, colorido o expansivo. Base: '{prompt}'"
            
        else: # EMPATHIC
            # Tono de apoyo y relajante
            return f"Modificando prompt para [{media_type}]: Tono relajante, suave, armonioso e introspectivo. Base: '{prompt}'"

    def generate_media(self, media_type: str, prompt: str, context_mode: str) -> str:
        adjusted_prompt = self.validate_media_tone(media_type, prompt, context_mode)
        
        # Simulación de llamada a la IA de generación de contenido (imágenes, música, etc.)
        print(f"[Simulando API Generativa] \n--> Modo: {context_mode}\n--> Tipo: {media_type}\n--> Prompt calibrado: {adjusted_prompt}")
        
        return f"Generación completada para tipo {media_type} bajo el esquema de modo {context_mode}."
