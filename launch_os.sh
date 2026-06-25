#!/bin/bash

# ⟡ MIRRORGATE OS LAUNCHER
# Starts the Governance Kernel and the Interface

echo "⟡ Initializing MirrorGate OS..."

# 1. Kill any existing kernel (port 8082)
if lsof -ti:8082 >/dev/null; then
    echo "  - Stopping previous kernel..."
    lsof -ti:8082 | xargs kill -9 2>/dev/null
fi

# 2. Check dependencies
if ! python3 -c "import fastapi, uvicorn, httpx" 2>/dev/null; then
    echo "  ! Missing dependencies. Installing..."
    pip3 install -r requirements.txt
fi

# 3. Start Kernel (Backend)
echo "  - Booting Kernel (mirror_gate)..."
python3 mirror_gate/server.py > mirrorgate.log 2>&1 &
KERNEL_PID=$!

# Wait for kernel to sort of start
sleep 2
if ps -p $KERNEL_PID > /dev/null; then
    echo "  ✓ Kernel online (PID $KERNEL_PID)"
else
    echo "  X Kernel failed to start. Check mirrorgate.log"
    exit 1
fi

# 4. Start Interface (Frontend)
echo "⟡ Launching Active Mirror Interface..."
npm run dev

# Cleanup when frontend stops
kill $KERNEL_PID
echo "⟡ MirrorGate OS shutdown."
