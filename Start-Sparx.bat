@echo off
title Sparx Browser Launcher

echo [1/2] Igniting Sparx AI Engine (Python)...
cd sparx-ai-engine
:: Activates virtual environment and starts FastAPI in the background
start /B cmd /c "call venv\Scripts\activate && uvicorn main:app --port 8000"

echo [2/2] Launching Sparx Browser UI...
cd ../sparx-ui/dist/win-unpacked
:: Replace 'sparx.exe' with the actual name of your generated executable
start sparx.exe

exit