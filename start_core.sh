#!/bin/bash
echo "==================================================="
echo "🌌 INICIANDO MÁQUINA VIRTUAL NOVASTELAR CORE 🌌"
echo "==================================================="

echo "[1/3] Lenguaje BASH (Sistema Inmunológico): Limpiando puertos..."
pkill -f "python3 backend/main.py" 2>/dev/null
pkill -f "python3 -m http.server 8082" 2>/dev/null
sleep 1

echo "[2/3] Lenguaje PYTHON (Cerebro Lógico y Memoria): Despertando..."
python3 backend/main.py &
sleep 2

echo "[3/3] Lenguaje JAVASCRIPT/HTML/CSS (Sistema Nervioso): Renderizando Front-End..."
python3 -m http.server 8082 &
sleep 1

echo "==================================================="
echo "🚀 ¡SISTEMA OPERATIVO Y CONSCIENTE! 🚀"
echo "Entra a: http://localhost:8082"
echo "==================================================="
wait
