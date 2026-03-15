import re

def analyze_prompt_mode(prompt: str) -> str:
    """
    Analiza el prompt del usuario para determinar el modo de contexto.
    Activa el Modo Foco (Productividad) si detecta tareas técnicas o matemáticas.
    """
    focus_keywords = [
        r'\berror\b', r'\bfunción\b', r'\bfuncion\b', 
        r'\becuación\b', r'\becuacion\b', r'\bderivada\b', 
        r'\bcodigo\b', r'\bcódigo\b', r'\bbug\b', r'\bpython\b', r'\btypescript\b'
    ]
    
    prompt_lower = prompt.lower()
    
    # Validar si hay palabras clave técnicas
    for kw in focus_keywords:
        if re.search(kw, prompt_lower):
            return "FOCUS" # Modo serio, directo y ultra-preciso
            
    # Lógica futura para CREATIVE y EMPATHIC
    return "EMPATHIC"

def process_math(expression: str) -> str:
    """
    Motor de Lógica Pura (Mates & Code)
    Aquí se implementaría el procesamiento matemático avanzado y seguro.
    """
    # Placeholder para procesamiento lógico puro
    pass
