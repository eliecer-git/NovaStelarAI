import os
import subprocess
import time
from typing import Callable, Dict, Any, List

class FileManager:
    """Gestor de Archivos Inteligente. Permite a la IA guardar código en disco de forma segura."""
    
    def save_file(self, filename: str, content: str, export_ready: bool = True):
        workspace = "workspace_exports"
        os.makedirs(workspace, exist_ok=True)
        filepath = os.path.join(workspace, filename)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
        print(f"[FileManager] 📁 Archivo guardado con éxito: {filepath}")
        if export_ready:
            print(f"[FileManager] ⬇️ {filename} ha sido empaquetado y preparado para su descarga.")
        return filepath

class ApiIntegrator:
    """Motor de conexiones a bases científicas, calendarios y recordatorios."""
    
    def fetch_external_data(self, source: str, query: str) -> str:
        print(f"[API Integrator] 🔌 Conectando a {source} en tiempo real sobre: {query}...")
        # Simulación de request HTTP a arxiv, nasa api, google calendar, etc.
        time.sleep(0.5) 
        return f"Datos relevantes de {source} procesados satisfactoriamente."

class CodeSandbox:
    """
    Motor de Ejecución de Código (Simulación).
    Si el código no corre, la IA lo arregla en silencio antes de mostrarlo.
    """
    
    def execute_and_fix(self, code: str, language: str = "python") -> Dict[str, Any]:
        print(f"[Sandbox 💻] Inicializando contenedor seguro para {language}...")
        
        # Simula un error y cómo la IA lo parchea y vuelve a correr = Perfección Silenciosa
        if "syntax_error" in code.lower() or "bug" in code.lower():
            print("[Sandbox 💻] 🚨 Error detectado en la primera ejecución. Aplicando Auto-Fix interno...")
            time.sleep(1) # IA pensando y parcheando
            code = code.replace("bug", "fix")
            print("[Sandbox 💻] ✨ Error subsanado en silencio. Nueva ejecución exitosa.")
        else:
            print("[Sandbox 💻] ✅ Ejecución perfecta a la primera.")

        return {
            "status": "success",
            "final_code": code,
            "output": "Simulated Output: Hello World / Computation Complete"
        }

class TaskAutomator:
    """
    Automatizador de Tareas en Cadena. 
    Ej: "Si hago X, entonces haz Y y Z y guárdalo en mis notas."
    """
    def __init__(self, file_manager: FileManager):
        self.fm = file_manager

    def chain_tasks(self, trigger: str, actions: List[Callable]):
        print(f"[Automator] ⚙️ Disparador activado: '{trigger}' -> Evaluando Cadena de Eventos.")
        for i, action in enumerate(actions, 1):
            print(f"   └─ Ejecutando Petición {i}...")
            action()
        print("[Automator] 🟢 Ciclo de automatización completado.")


# --- PRUEBAS DE LA UNIDAD 9 ---
if __name__ == "__main__":
    print("\n========= UNIDAD 9: SISTEMAS ACTIVADOS =========")
    
    # 1. Prueba de File Manager
    fm = FileManager()
    fm.save_file("script_cuantico.js", "console.log('Energía calculada');")
    
    # 2. Prueba con el Sandbox de Código
    sandbox = CodeSandbox()
    result = sandbox.execute_and_fix("def calcular(): print('hay un bug aquí')")
    print(f"Código Final (Filtrado por Sandbox): {result['final_code']}")

    # 3. Automatización de Cadenas (Ejemplo del usuario con las Imágenes de Galaxias)
    automator = TaskAutomator(fm)
    
    def generar_imagen():
        print("   🖼️ [Acción 1] Imagen de la Nebulosa generada.")
    def crear_poema_y_guardar():
        print("   📝 [Acción 2] Generando descripción poética...")
        fm.save_file("notas_espaciales.txt", "Las estrellas bailan en el vacío de la nada.", export_ready=False)
        
    automator.chain_tasks("generar imagen de galaxia", [generar_imagen, crear_poema_y_guardar])
