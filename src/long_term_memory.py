import json
import os
from datetime import datetime
from typing import Dict, Any, List

class ExperienceArchive:
    """
    Unidad 8: El Archivo de Experiencias (Memoria a Largo Plazo)
    Gestiona los gustos del usuario, proyectos y progresión cognitiva.
    """
    def __init__(self, user_id: str = "captain_01"):
        self.user_id = user_id
        self.db_path = f"data/memory_{self.user_id}.json"
        
        # En producción esto sería MongoDB o una DB Vectorial como Pinecone.
        # Por ahora, usamos un archivo JSON local simulando la base de datos persistente.
        self.memory_state = {
            "preferences": {
                "colors": ["neón", "oscuro", "cyan"],
                "tone": "profesional",
                "favorite_topics": ["tecnología", "física cuántica", "música ambient"]
            },
            "projects": {},
            "cognitive_progression": {
                "python_level": "intermedio",
                "rust_level": "principiante",
                "learned_concepts": []
            },
            "last_interaction": datetime.now().isoformat()
        }
        
        self.load_memory()

    def _ensure_dir(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

    def load_memory(self):
        """Carga la memoria si existe el archivo."""
        if os.path.exists(self.db_path):
            with open(self.db_path, "r", encoding="utf-8") as f:
                self.memory_state = json.load(f)
                print("[Memoria a Largo Plazo] 🧠 Archivo de experiencias recuperado con éxito.")
        else:
            print("[Memoria a Largo Plazo] 🌱 Inicializando archivo de experiencias virgen.")
            self._ensure_dir()
            self.save_memory()

    def save_memory(self):
        """Persiste la memoria al disco o base de datos."""
        self._ensure_dir()
        self.memory_state["last_interaction"] = datetime.now().isoformat()
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(self.memory_state, f, indent=4)
        print("[Memoria a Largo Plazo] 💾 Memorias consolidadas.")

    def update_preference(self, key: str, value: Any):
        """Añade o actualiza un gusto específico."""
        self.memory_state["preferences"][key] = value
        self.save_memory()
        print(f"[Memoria] Gusto '{key}' actualizado a '{value}'.")

    def save_project_context(self, project_name: str, context_summary: str, tech_stack: List[str]):
        """Guarda el contexto de un proyecto para retomarlo en el futuro sin explicaciones."""
        self.memory_state["projects"][project_name] = {
            "summary": context_summary,
            "tech_stack": tech_stack,
            "last_touched": datetime.now().isoformat()
        }
        self.save_memory()
        print(f"[Memoria] Contexto del proyecto '{project_name}' archivado.")

    def register_learning_progress(self, skill: str, new_level: str, concept: str):
        """Registra el progreso. Ej: Ayer aprendiste bucles en Python, hoy ya la IA lo sabe."""
        self.memory_state["cognitive_progression"][f"{skill}_level"] = new_level
        if concept not in self.memory_state["cognitive_progression"]["learned_concepts"]:
            self.memory_state["cognitive_progression"]["learned_concepts"].append(concept)
        self.save_memory()
        print(f"[Memoria] Evolución cognitiva registrada: {skill} subió a {new_level}.")

    def recall(self) -> Dict[str, Any]:
        """Extrae el contexto del usuario para inyectarlo en el system prompt antes de chatear."""
        return self.memory_state

# --- Pruebas del Archivo de Experiencias ---
if __name__ == "__main__":
    memory = ExperienceArchive()
    memory.update_preference("humor", "sarcástico pero amable")
    memory.save_project_context("StelarOS", "Sistema operativo web con CSS Glassmorphism.", ["HTML", "CSS", "JS"])
    memory.register_learning_progress("python", "avanzado", "AsyncIO")
    
    print("\n[Extracción de Contexto para la Red Neuronal]:")
    print(json.dumps(memory.recall(), indent=2))
