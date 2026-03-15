import re
from typing import Dict, List, Tuple

class FactChecker:
    """Módulo de Verificación de Datos (Fact-Checking)"""
    def check_contradictions(self, topic: str, info_sources: List[str]) -> Tuple[bool, str]:
        # Simula el análisis de múltiples fuentes buscando contradicciones
        if "teoría de cuerdas" in topic.lower() or "nutrición" in topic.lower():
            return True, "Hay dos teorías o perspectivas sobre esto, aquí te explico ambas... 🧐\n1. Perspectiva A...\n2. Perspectiva B..."
        return False, "La información es consistente en el consenso científico actual. ✅"

class AdaptiveCommunicator:
    """Módulo de Lenguaje Técnico Adaptable"""
    def format_explanation(self, content: str, user_level: str) -> str:
        if user_level == "novato":
            return f"🌟 ¡Imagina que esto es como jugar con legos! {content} (Explicación simplificada con analogías 🧱✨)"
        elif user_level == "experto":
            return f"🔬 [Análisis Técnico Senior]: {content} (Terminología avanzada, fórmulas omitidas por brevedad)."
        return content

class DeepWebSearchAgent:
    """Agente de Búsqueda Profunda y Filtrado"""
    def deep_search(self, query: str) -> str:
        print(f"[Deep Search] Rastreando bases de datos académicas, artículos revisados por pares y noticias actualizadas para: '{query}'...")
        # Simula filtrado de basura vs real
        return f"[Información Filtrada y Estructurada sobre '{query}']"

class GlobalBrain(DeepWebSearchAgent):
    """
    Unidad 6: El Manantial de Sabiduría Universal.
    Actúa como experto en múltiples dominios.
    """
    def __init__(self):
        super().__init__()
        self.fact_checker = FactChecker()
        self.communicator = AdaptiveCommunicator()
        
        self.domains = {
            "exact_sciences": ["matemáticas", "física", "cuántica", "química"],
            "health_law": ["leyes", "medicina", "salud", "jurisprudencia"],
            "engineering": ["ingeniería", "software", "arquitectura", "electrónica", "mecánica"],
            "culture": ["historia", "arte", "videojuegos", "tendencias"]
        }

    def detect_domain(self, query: str) -> str:
        q_lower = query.lower()
        for domain, keywords in self.domains.items():
            if any(kw in q_lower for kw in keywords):
                return domain
        return "general"

    def process_query(self, query: str, user_level: str = "experto") -> Dict[str, str]:
        domain = self.detect_domain(query)
        print(f"[Cerebro Global] Dominio detectado: especializado en {domain.upper()}")

        # 1. Búsqueda Profunda (para cosas que no están en la red neuronal base)
        raw_info = self.deep_search(query)

        # 2. Fact-Checking (Cruce de información)
        has_contradiction, verification_msg = self.fact_checker.check_contradictions(query, [raw_info])

        # 3. Adaptación del Lenguaje
        final_answer = self.communicator.format_explanation(raw_info, user_level)

        if has_contradiction:
            final_answer = f"{verification_msg}\n\nDetalles:\n{final_answer}"

        return {
            "domain": domain,
            "answer": final_answer,
            "status": "Respuesta generada vía Búsqueda Profunda y validada."
        }

# --- Pruebas del Manantial de Sabiduría ---
if __name__ == "__main__":
    brain = GlobalBrain()
    print("--- Prueba 1: Experto en Ciencias Exactas (Contradicción detectada) ---")
    res1 = brain.process_query("Explícame el estado actual de la teoría de cuerdas en la física cuántica", user_level="experto")
    print(res1['answer'])
    
    print("\n--- Prueba 2: Explicación para Novatos (Medicina/Salud) ---")
    res2 = brain.process_query("Cómo funciona la nutrición celular", user_level="novato")
    print(res2['answer'])
