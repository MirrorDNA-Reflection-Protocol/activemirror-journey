#!/bin/bash
set -e

echo "⟡ Active Mirror Stack Installer"
echo "================================"
echo "Sovereign AI Infrastructure | v1.0"
echo ""

# 1. Clone Repos
echo "[1/3] Cloning core repositories..."
mkdir -p ActiveMirror-Stack
cd ActiveMirror-Stack

git clone https://github.com/MirrorDNA-Reflection-Protocol/active-mirror-identity.git
git clone https://github.com/MirrorDNA-Reflection-Protocol/MirrorBrain.git
git clone https://github.com/MirrorDNA-Reflection-Protocol/ActiveMirrorOS.git

# 2. Install Ollama
echo ""
echo "[2/3] Checking Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "Ollama already installed."
fi

# 3. Pull Model
echo ""
echo "[3/3] Pulling Sovereign Kernel Model (Llama 3.2 3B)..."
ollama pull llama3.2:3b

echo ""
echo "⟡ Setup Complete."
echo "Your stack is in $(pwd)"
echo "Next: cd MirrorBrain && npm install && npm run dev"
