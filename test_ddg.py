import urllib.request
import urllib.parse
import re

def duckduckgo_search(query):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            html = res.read().decode('utf-8')
            # Extraer snippet de la clase result__snippet
            match = re.search(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
            if match:
                # Limpiar tags HTML
                snippet = re.sub(r'<[^>]+>', '', match.group(1)).strip()
                return snippet
    except Exception as e:
        return str(e)
    return "No snippet found"

print(duckduckgo_search("what is a black hole"))
