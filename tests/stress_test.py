import json
import urllib.request
import urllib.parse
import sys
import os

def test_query(prompt, mode=None):
    url = "http://localhost:8000"
    data = json.dumps({"text": prompt, "mode": mode}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            response = json.loads(res.read().decode('utf-8'))
            return response
    except Exception as e:
        return {"error": str(e)}

# Batería de Pruebas de Estrés
test_cases = [
    # 1. NLU y Ortografía Extrema
    "ola k ase",
    "k es un bujero negro xd",
    "explicame q es la fotosintesis pa la tarea xfa",
    "2+2*5/2",
    
    # 2. Multilingüe
    "hello how are you",
    "what is quantum entanglement",
    "qui est napoleon",
    
    # 3. Comandos de Sistema (Simulados)
    "abre google",
    "abre la terminal por favor",
    
    # 4. Memoria
    "me llamo Eliecer el Grande",
    "como me llamo?",
    "mi color es verde esmeralda",
    "que color me gusta?",
    
    # 5. Multimodalidad
    "dibuja un gato espacial",
    "hazme una cancion de rock",
    "hazme un codigo en javascript para un juego"
]

print("🚀 INICIANDO BATERÍA DE PRUEBAS DE ESTRÉS - NOVASTELAR AI 🚀")
print("="*60)

failures = 0
for i, prompt in enumerate(test_cases, 1):
    print(f"TEST {i}: '{prompt}'")
    result = test_query(prompt)
    if "error" in result:
        print(f"❌ FALLO TÉCNICO: {result['error']}")
        failures += 1
    else:
        print(f"✅ RESPUESTA ({result['action_type']}):")
        # Mostrar las primeras 2 lineas del resultado
        body = result['response'].split('\n')[0]
        print(f"   > {body[:100]}...")
    print("-" * 60)

if failures == 0:
    print("\n✨ TODAS LAS PRUEBAS DE INTEGRACIÓN FUERON EXITOSAS ✨")
else:
    print(f"\n⚠️ SE DETECTARON {failures} FALLOS EN LA COMUNICACIÓN O LÓGICA ⚠️")
