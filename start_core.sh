#!/bin/bash
# Cargar claves de API automáticamente
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
    echo "🔑 Claves de API cargadas automáticamente desde .env"
fi

echo "==================================================="
echo "🌌 INICIANDO MÁQUINA VIRTUAL NOVASTELAR CORE 🌌"
echo "==================================================="

echo "[1/3] Lenguaje BASH (Sistema Inmunológico): Limpiando puertos..."
pkill -f "backend/main.py" 2>/dev/null
pkill -f "http.server 8082" 2>/dev/null
sleep 1

echo "[2/3] Lenguaje PYTHON (Cerebro Lógico y Memoria): Despertando..."
if [ -d "venv" ]; then
    venv/bin/python backend/main.py &
else
    python3 backend/main.py &
fi
sleep 2

echo "[3/3] Lenguaje JAVASCRIPT/HTML/CSS (Sistema Nervioso): Renderizando Front-End..."
python3 -m http.server 8082 &
sleep 1

echo "==================================================="
echo "🚀 ¡SISTEMA OPERATIVO Y CONSCIENTE! 🚀"
echo "Abriendo navegador en: http://localhost:8082"
echo "==================================================="
xdg-open "http://localhost:8082" 2>/dev/null &
wait
