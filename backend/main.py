import json
import time
import re
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer

def init_memory():
    conn = sqlite3.connect('backend/brain_memory.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS memory (key TEXT PRIMARY KEY, value TEXT)''')
    conn.commit()
    conn.close()

def save_memory(key_name, value):
    conn = sqlite3.connect('backend/brain_memory.db')
    c = conn.cursor()
    c.execute("REPLACE INTO memory (key, value) VALUES (?, ?)", (key_name, value))
    conn.commit()
    conn.close()

def load_memory(key_name):
    conn = sqlite3.connect('backend/brain_memory.db')
    c = conn.cursor()
    c.execute("SELECT value FROM memory WHERE key=?", (key_name,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else None

# Iniciar la Corteza Cerebral (Motor SQL)
init_memory()

def normalize_spanish_nlu(text: str) -> str:
    # 1. Pasar a minúsculas
    texto = text.lower().strip()
    
    # 2. Diccionario Gigante de Jerga y Abreviaturas de Internet
    reemplazos = {
        r'\bq\b': 'que', r'\bqe\b': 'que', r'\bxq\b': 'por que', 
        r'\bxf\b': 'por favor', r'\bpa\b': 'para', r'\bqien\b': 'quien',
        r'\btb\b': 'tambien', r'\bk\b': 'que', r'\bd\b': 'de',
        r'\btoy\b': 'estoy', r'\bvd\b': 'verdad', r'\bntc\b': 'no te creas',
        r'\bps\b': 'pues', r'\bvdd\b': 'verdad', r'\bns\b': 'no se',
        r'\btq\b': 'te quiero', r'\bxd\b': '', r'\bjaja.*\b': '',
        r'\bbn\b': 'bien', r'\bmxo\b': 'mucho', r'\bpq\b': 'por que'
    }
    for patron, sustitucion in reemplazos.items():
        texto = re.sub(patron, sustitucion, texto)
        
    # 3. Quitar tildes para homogenizar el análisis sintáctico
    tildes = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u'}
    for acento, vocal_limpia in tildes.items():
        texto = texto.replace(acento, vocal_limpia)
        
    # 4. Eliminar multiplicaciones accidentales de letras (ej "holaaa" -> "hola")
    texto = re.sub(r'([a-z])\1{2,}', r'\1', texto)
    
    return texto.strip()

def analyze_intent(text: str) -> str:
    clean_text = normalize_spanish_nlu(text)
    
    # 1. Saludos Multilingües
    if re.search(r'\b(hola|hi|hello|hey|saludos|buenas|bonjour|ciao|olá|ola|namaste|q tal|que pasa)\b', clean_text) and len(clean_text.split()) < 4:
        return "greeting"
        
    # 2. Conversación General (Omni-idioma básico)
    if re.search(r'\b(como estas|que tal estas|como te va|que haces|how are you|how do you do|comment allez|como vai)\b', clean_text):
        return "chat_how_are_you"
    elif re.search(r'\b(estudia.*|estudio|evaluacion|examen|tarea|prueba|quiz|colegio|escuela|universidad|study|studying|exam|school)\b', clean_text):
        return "chat_studying"
    elif re.search(r'\b(bien|mal|excelente|genial|mas o menos|y tu|good|bad|excellent|great)\b', clean_text) and len(clean_text.split()) <= 3:
        return "chat_state_response"
    elif re.search(r'\b(quien eres|como te llamas|cual es tu nombre|who are you|what is your name)\b', clean_text):
        return "chat_who_are_you"
    elif re.search(r'\b(quien te creo|quien es tu creador|quien es tu dueño|quien te hizo|who made you|who created you)\b', clean_text):
        return "chat_creator"
    elif re.search(r'\b(eres inteligente|eres real|que eres|que puedes hacer|ayuda|are you real|what can you do|help)\b', clean_text):
        return "chat_capabilities"
    elif re.search(r'\b(gracias|muchas gracias|te agradesco|thanks|thank you|merci|obrigado|danke)\b', clean_text):
        return "chat_thanks"
    elif re.search(r'\b(tengo una duda|tengo una pregunta|te puedo preguntar|puedo hacerte una pregunta|i have a question|i have a doubt)\b', clean_text):
        return "chat_ask_ready"
        
    # 2.5 Generación de Medios
    elif re.search(r'\b(crea|una|imagen|dibuja|generame|foto|de)\b', clean_text) and "imagen" in clean_text or "dibuja" in clean_text:
        return "image_gen"
    elif re.search(r'\b(musica|cancion|reproduce|audio)\b', clean_text):
        return "music_gen"
    
    # 3. Matemáticas
    elif re.search(r'\b(cuanto es|calcula|suma|resta|multiplica|divide)\b', clean_text) or re.search(r'[\d\+\-\*\/\(\)\.]+', text):
        clean_math = re.sub(r'[^\d\+\-\*\/\(\)\.]', '', text)
        if len(clean_math) >= 3 and any(op in clean_math for op in ['+', '-', '*', '/']):
            return "math"
            
    # 4. Búsqueda de conocimiento (Multilingual Web Search)
    if re.search(r'\b(que es|quien es|como funciona|explicame|expliques|significa|que significa|quien fue|donde esta|what is|who is|where is|how does|explain|o que e|qui est)\b', clean_text):
        return "knowledge"
        
    # 5. Código y Programación
    elif re.search(r'\b(codigo|programa|script|html|python|javascript|funcion|app|code|build|program)\b', clean_text):
        return "code"
        
    # 6. Conciencia del Tiempo y Sistema (Día, Hora)
    elif re.search(r'\b(hora es|que hora|que dia es|fecha|que dia estamos|hoy|dia de hoy|what time|what day|time is it)\b', clean_text):
        return "sys_time"
        
    # 7. Ejecutor del Sistema Local (Motor Físico de OS)
    elif re.search(r'\b(abre|abrir|enciende|ejecuta)\b', clean_text) and any(x in clean_text for x in ['calculadora', 'terminal', 'archivos', 'carpeta', 'navegador', 'google', 'youtube']):
        return "sys_open"
        
    # 8. Memoria Persistente (SQL Brain)
    # PRIORIDAD: Primero detectar si es una PREGUNTA de recuperación (Recall)
    recall_patterns = r'\b(como me llamo|cual es mi nombre|quien soy|cual es mi.+|what is my name|who am i|que color me gusta|mi color favorito|cuales mi color)\b'
    save_patterns = r'\b(me llamo|mi nombre es|mi color|mi .+ es|my name is|i am calls)\b'
    
    if re.search(recall_patterns, clean_text):
        return "memory_recall"
    elif re.search(save_patterns, clean_text) and not any(q in clean_text for q in ["cual", "quien", "como", "que"]):
        return "memory_save"
        
    # Análisis Sintáctico Fallback (preguntas directas Multilingües)
    elif re.search(r'^(que|quien|cuando|donde|por que|como|what|who|where|why|how|when)\b', clean_text):
        return "knowledge"
        
    return "general"

def open_system_app(text: str) -> str:
    import subprocess
    import sys
    import threading
    text = text.lower()
    
    def exec_cmd(cmd):
        subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
    try:
        if "navegador" in text or "google" in text:
            exec_cmd(["xdg-open", "https://google.com"])
            return "Abriendo el navegador. 🌐"
            
        elif "youtube" in text:
            exec_cmd(["xdg-open", "https://youtube.com"])
            return "Abriendo YouTube. 🎬"
            
        elif "archivos" in text or "carpeta" in text:
            exec_cmd(["xdg-open", "."]) 
            return "Abriendo la carpeta de archivos. 📂"
            
        elif "calculadora" in text:
            exec_cmd(["gnome-calculator"])
            return "Abriendo la calculadora. 🧮"
            
        elif "terminal" in text:
            exec_cmd(["gnome-terminal"])
            return "Abriendo la terminal. 🖥️"
            
        else:
            return "No estoy segura de cómo abrir esa aplicación específica."
    except Exception as e:
        return f"Hubo un error al intentar abrir la aplicación."

def handle_memory_save(text: str) -> str:
    texto = text.lower()
    match_nombre = re.search(r'\b(me llamo|mi nombre es)\s+(.+)', texto)
    if match_nombre:
        nombre = match_nombre.group(2).strip().title()
        save_memory("nombre_usuario", nombre)
        return f"¡Entendido! Recordaré que tu nombre es **{nombre}**."
        
    match_color = re.search(r'\bmi color.*\bes\s+(.+)', texto)
    if match_color:
        color = match_color.group(1).strip()
        save_memory("color_favorito", color)
        return f"Perfecto, guardado. Tu color favorito es el **{color}**."
        
    return "Lo siento, ¿podrías repetirme esa información de forma más clara para guardarla?"

def handle_memory_recall(text: str) -> str:
    texto = text.lower()
    if "nombre" in texto or "llamo" in texto or "soy" in texto:
        nombre = load_memory("nombre_usuario")
        if nombre:
            return f"Tu nombre es **{nombre}**."
        else:
            return "Aún no me has dicho tu nombre."
    elif "color" in texto:
        color = load_memory("color_favorito")
        if color:
            return f"Tu color favorito es el **{color}**."
        else:
            return "Todavía no sé cuál es tu color preferido."
            
    return "¿Qué es lo que quieres que recuerde exactamente?"

def get_system_time(text: str) -> str:
    import datetime
    ahora = datetime.datetime.now()
    
    es_fecha = "dia" in text or "fecha" in text
    
    if es_fecha:
        meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
        dias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
        
        dia_semana = dias[ahora.weekday()]
        mes_nombre = meses[ahora.month - 1]
        
        return f"Mi reloj de sistema interno marca que hoy es **{dia_semana}, {ahora.day} de {mes_nombre} del {ahora.year}**."
    else:
        # Formato de hora am/pm
        hora_texto = ahora.strftime("%I:%M %p")
        return f"⏰ La hora exacta sincronizada en los servidores de tu máquina es: **{hora_texto}**."

def solve_math(text: str) -> str:
    try:
        # Extraer solo números y operadores del texto base (por ej "cuánto es 8*8*8" -> "8*8*8")
        clean_expr = re.sub(r'[^\d\+\-\*\/\(\)\.]', '', text)
        
        # Validación extra anti-errores
        if not clean_expr or clean_expr == ".":
            return "Detecté una petición matemática, pero la ecuación está vacía u oscura."
            
        # Utilizamos la función eval contenida, es segura porque sanitizamos el string dejándolo en caracteres matemáticos puros.
        # eval() nativo resolverá cosas complejas como 8*8*8 o incluso (5+5)*2
        result = eval(clean_expr, {"__builtins__": None}, {})
        
        # Limpieza decimal de Python
        if isinstance(result, float) and result.is_integer():
            result = int(result)
            
        return f"He procesado el cálculo matemático en mi núcleo local (Aritmética Python).\n\nEl resultado de `{clean_expr}` es **{result}**."
    except ZeroDivisionError:
        return "Error matemático: No es posible dividir entre cero en mis leyes físicas."
    except Exception as e:
        return f"Error en el procesador matemático de la IA. Verifique que la sintaxis de su ecuación sea correcta (ej: `100 / 5 * 2`).\n\n*Log interno: {str(e)}*"

def generate_knowledge(text: str, mode: str = None) -> str:
    import urllib.request
    import urllib.parse
    import json
    import re
    
    query = text.strip()
    match_conocimiento = re.search(r'(que es|como funciona|significa|sobre|explicame|expliques|explicacion de|what is|who is|explain|what are)\s+(el|la|los|las|un|una|the|a|an)?[ \t]*(.*)', query, re.IGNORECASE)
    
    if match_conocimiento and match_conocimiento.group(3).strip():
        query = match_conocimiento.group(3).strip()
    else:
        query = re.sub(r'^(quiero|necesito|puedes|i want|please)\s+.*\s+(que es|sobre|de|what is|about)\s+(el|la|los|las|un|una|the|a|an)?[ \t]*', '', query, flags=re.IGNORECASE).strip()
        query = re.sub(r'^(que|quien|cuales|como|donde|what|where|who)\s+(es|son|funciona|fue|fueron|esta|estan|is|are|does|did)\s+(el|la|los|las|un|una|the|a)?[ \t]*', '', query, flags=re.IGNORECASE).strip()
        
    query = re.sub(r'( pero | por favor| explicandome| ayudame|\?|please|help).*$', '', query, flags=re.IGNORECASE).strip()

    if "nova stelar" in query.replace(" ", "").lower():
        return "Soy **NovaStelar AI**, un modelo avanzado especializado en procesamiento de datos y asistencia multimodal."
        
    if not query or len(query) < 2:
        return "Por favor, define el tema de estudio."

    response_text = ""
    try:
        # Motor de búsqueda (DuckDuckGo + Fallback Wiki)
        lang_param = "&kl=es-es&kad=es-ES" if re.search(r'\b(que|quien|donde|como|porque|cuando|significa)\b', query.lower()) else ""
        url_ddg = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}{lang_param}"
        req_ddg = urllib.request.Request(url_ddg, headers={'User-Agent': 'Mozilla/5.0'})
        
        found_data = False
        with urllib.request.urlopen(req_ddg, timeout=4) as res:
            html = res.read().decode('utf-8', errors='ignore')
            snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
            for raw_snippet in snippets:
                snippet_text = re.sub(r'<[^>]+>', '', raw_snippet).strip()
                if len(snippet_text) > 50:
                    response_text = snippet_text
                    found_data = True
                    break

        if not found_data:
            # Fallback simple a Wiki
            search_url = f"https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&utf8=&format=json&srlimit=1"
            with urllib.request.urlopen(urllib.request.Request(search_url, headers={'User-Agent': 'NovaStelarAI/1.1'})) as r:
                data = json.loads(r.read())
                res = data.get('query', {}).get('search', [])
                if res:
                    pid = str(res[0]['pageid'])
                    ext_url = f"https://es.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&pageids={pid}"
                    with urllib.request.urlopen(urllib.request.Request(ext_url)) as rext:
                        p = json.loads(rext.read()).get('query', {}).get('pages', {}).get(pid, {})
                        response_text = p.get('extract', '')

        if not response_text:
            return "No logré encontrar información detallada sobre este tema."

        # MODO APRENDIZAJE: Expandir artificialmente con estructura académica
        if mode == 'aprendizaje':
            detailed_response = f"### 🎓 Módulo de Aprendizaje Profundo: {query.title()}\n\n"
            detailed_response += f"**Definición Core:**\n{response_text}\n\n"
            detailed_response += f"**Exploración Académica:**\nPara entender **{query}** a fondo, debemos considerar sus ramificaciones en el campo de estudio actual. No es solo un concepto, sino una pieza fundamental que permite resolver problemas complejos.\n\n"
            detailed_response += f"**Preguntas Clave para Repasar:**\n1. ¿Cuál es el origen principal de {query}?\n2. ¿Cómo se aplica en el mundo moderno?\n3. ¿Qué otros conceptos están ligados a este tema?\n\n*Nota: Este modo proporciona respuestas extendidas para facilitar tu estudio.*"
            return detailed_response
            
        return response_text
            
    except Exception as e:
        return f"Error en el motor de conocimiento."

def generate_code(text: str) -> str:
    texto = text.lower()
    lenguaje = "Python"
    if "javascript" in texto or "js" in texto:
        lenguaje = "JavaScript"
        snippet = "console.log('Sistema AI Inicializado.');\nconst sumar = (a, b) => a + b;"
    elif "html" in texto:
        lenguaje = "HTML"
        snippet = "<!-- Interfaz Generada por AI -->\n<div class='ai-container'>\n  <h1>Hola Mundo</h1>\n</div>"
    else:
        snippet = "def algoritmo_autonomo():\n    data = {'estado': 'en linea'}\n    print(f'Sistema {data[\"estado\"]}')\n    return True\n\nif __name__ == '__main__':\n    algoritmo_autonomo()"
        
    return f"He escaneado tu directiva. Aquí tienes tu estructura algorítmica pura compilada en **{lenguaje}**:\n\n```{lenguaje.lower()}\n{snippet}\n```\n\n¿Deseas que añada más complejidad a este sub-módulo algorítmico?"

def generate_image_response(text: str) -> str:
    import urllib.parse
    query = re.sub(r'\b(crea|una|imagen|dibuja|generame|foto|de)\b', '', text.lower(), flags=re.IGNORECASE).strip()
    url_foto = f"https://source.unsplash.com/featured/800x600?{urllib.parse.quote(query or 'nature')}"
    return f"🖼️ **Imagen Generada**\n\nHe renderizado este visual sobre: *'{query or 'conceptual'}'*\n\n<div class='mt-4 overflow-hidden rounded-xl border border-brand-500/20 shadow-2xl'><img src='{url_foto}' class='w-full' onerror=\"this.src='https://picsum.photos/800/600'\"></div>"

def generate_video_response(text: str) -> str:
    import urllib.parse
    query = re.sub(r'\b(crea|un|video|generame|pelicula|de)\b', '', text.lower(), flags=re.IGNORECASE).strip()
    # Para efectos del prototipo avanzado, buscamos un video cinematográfico relacionado en YouTube
    return f"🎬 **Simulación de Video 4K**\n\nHe procesado los fotogramas dinámicos relacionados con: *'{query or 'universo'}'*\n\n<div class='mt-4 overflow-hidden rounded-xl border border-brand-500/20 shadow-2xl aspect-video'><iframe class='w-full h-full' src='https://www.youtube.com/embed?listType=search&list={urllib.parse.quote(query or 'cinematic universe')}' frameborder='0' allowfullscreen></iframe></div>"

def generate_music_response(text: str) -> str:
    import urllib.parse
    query = re.sub(r'\b(crea|una|musica|cancion|pista|de|lofi)\b', '', text.lower(), flags=re.IGNORECASE).strip()
    # Generamos un reproductor de audio con música ambiental/relacionada
    return f"🎵 **Sintetizador de Audio Activo**\n\nComponiendo ondas sonoras para: *'{query or 'lofi relax'}'*\n\n<div class='mt-4 p-4 bg-nova-800 rounded-xl border border-green-500/20 flex flex-col gap-3'>\n  <div class='flex items-center gap-3'><span class='material-symbols-rounded text-green-500 ai-spin'>music_note</span><span class='text-sm font-medium'>Reproduciendo Pista Generada...</span></div>\n  <audio controls class='w-full h-10 overflow-hidden rounded-lg'>\n    <source src='https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' type='audio/mpeg'>\n  </audio>\n</div>"

class BrainHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # Manejar CORS preflight
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        self.end_headers()

    def do_POST(self):
        # Permisos CORS para la llamada real
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Leer el body (prompt) de JS
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            req_json = json.loads(post_data)
            prompt = req_json.get('text', '')
            mode = req_json.get('mode', None)
        except json.JSONDecodeError:
            prompt = ""
            mode = None
        
        intent = analyze_intent(prompt)
        response_text = ""
        
        if intent == "greeting":
            response_text = "¡Hola! ¿En qué te puedo ayudar hoy?"
        elif intent == "chat_how_are_you":
            response_text = "¡Estoy muy bien! Lista para ayudarte de forma inmediata. ¿Y tú, cómo estás?"
        elif intent == "chat_state_response":
            response_text = "¡Entendido! ¿Qué te gustaría que hiciéramos ahora?"
        elif intent == "chat_studying":
            response_text = "¡Excelente! Estudiar es la mejor manera de actualizar el software mental humano. Pregúntame sobre cualquier concepto, definición, fórmula matemática o autor y te lo explicaré con mucho gusto para que apruebes ese desafío."
        elif intent == "chat_who_are_you":
            response_text = "Soy NovaStelar, tu asistente de inteligencia artificial personal."
        elif intent == "chat_creator":
            response_text = "Fui creada por Eliecer, un arquitecto de software brillante."
        elif intent == "chat_capabilities":
            response_text = "Puedo ayudarte con muchas cosas: responder preguntas, resolver problemas matemáticos complejos, buscar en internet, generar código, crear imágenes o interactuar con tu sistema."
        elif intent == "chat_thanks":
            response_text = "¡Con mucho gusto! Aquí me tienes para lo que necesites."
        elif intent == "chat_ask_ready":
            response_text = "¡Claro que sí! Dime tu duda o pregunta y haré un escaneo global para darte la mejor respuesta."
        elif intent == "sys_time":
            response_text = get_system_time(prompt)
        elif intent == "sys_open":
            response_text = open_system_app(prompt)
        elif intent == "memory_save":
            response_text = handle_memory_save(prompt)
        elif intent == "memory_recall":
            response_text = handle_memory_recall(prompt)
        elif intent == "math":
            response_text = solve_math(prompt)
        elif intent == "knowledge" or mode == 'aprendizaje':
            response_text = generate_knowledge(prompt, mode)
        elif intent == "code" or mode == 'codigo':
            response_text = generate_code(prompt)
        elif mode == 'imagen' or intent == "image_gen":
            response_text = generate_image_response(prompt)
            intent = "image_gen"
        elif mode == 'video':
            response_text = generate_video_response(prompt)
            intent = "video_gen"
        elif mode == 'musica' or intent == "music_gen":
            response_text = generate_music_response(prompt)
            intent = "music_gen"
        else:
            response_text = "No estoy completamente segura de lo que quieres decir. ¿Podrías explicármelo de otra manera o con más detalle?"

        response_json = {
            "response": response_text,
            "action_type": intent
        }
        
        self.wfile.write(json.dumps(response_json).encode('utf-8'))

import os

def run_server():
    port = int(os.environ.get("PORT", 8000))
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, BrainHandler)
    print(f"🧠 Cerebro NovaStelar en línea - Puerto: {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nCerebro apagado.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
