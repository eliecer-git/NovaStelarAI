from typing import Optional, Dict

class VectorDatabase:
    """
    Simulación de Base de Datos Vectorial (ej. Pinecone, Qdrant).
    Almacena conocimiento verificado de libros, documentación, etc.
    """
    def __init__(self):
        # Base de conocimiento embebida (SIMULADA)
        self.knowledge_base = {
            "ecuacion_schrodinger": "La ecuación de Schrödinger describe cómo cambia el estado cuántico de un sistema físico...",
            "documentacion_react": "React es una biblioteca de JavaScript para construir interfaces de usuario basadas en componentes...",
        }
    
    def search(self, query: str, threshold: float = 0.9) -> Optional[str]:
        """
        Busca en la BD vectorial. Solo retorna si la similitud supera el umbral (simulado al 100% de certeza).
        """
        print(f"[VectorDB] Buscando coincidencias para: '{query}'")
        for key, value in self.knowledge_base.items():
            # Simulación de similitud cosenoidal simple
            if key.replace("_", " ") in query.lower():
                print(f"[VectorDB] Match encontrado (Confianza > {threshold*100}%)")
                return value
        return None


class WebSearchAgent:
    """
    Agente que navega y busca en internet en tiempo real.
    """
    def search_internet(self, query: str) -> str:
        print(f"[WebAgent] Accediendo a la red global. Buscando: '{query}'...")
        # Simulación de respuesta web
        return f"Información verificada de internet sobre '{query}': [Fuente verificada y sintetizada]"


class OmniscienceEngine:
    """
    Unidad 4: Motor de Sabiduría Universal.
    Gestiona la lógica RAG y la Regla de Oro.
    """
    def __init__(self):
        self.vector_db = VectorDatabase()
        self.web_agent = WebSearchAgent()

    def process_query(self, query: str) -> Dict[str, str]:
        """
        Evalúa si la IA tiene el conocimiento al 100%. Si no, busca en internet.
        """
        # Paso 1: Intentar responder con la base vectorial local
        local_result = self.vector_db.search(query)

        if local_result:
            return {
                "source": "VECTOR_DB",
                "content": local_result,
                "certainty": "100%",
                "status": "Respuesta desde memoria interna."
            }
        
        # Paso 2: Aplicar Regla de Oro - Si no lo sabemos, internet al rescate
        print("[OmniscienceEngine] Certeza insuficiente (< 100%). Activando protocolo de búsqueda web externa. ¡Nada de inventar! 🌍")
        web_result = self.web_agent.search_internet(query)

        return {
            "source": "INTERNET_RAG",
            "content": web_result,
            "certainty": "100% (Verificado)",
            "status": "Respuesta obtenida y procesada desde fuentes externas."
        }

# Prueba rápida
if __name__ == "__main__":
    engine = OmniscienceEngine()
    print("--- Prueba 1: Conocimiento interno ---")
    print(engine.process_query("Qué es la ecuacion de schrodinger"))
    
    print("\n--- Prueba 2: Búsqueda Web ---")
    print(engine.process_query("Últimas noticias sobre física cuántica en 2026"))
