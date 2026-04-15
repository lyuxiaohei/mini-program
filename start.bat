@echo off
cd /d "%~dp0"
echo Starting server at http://localhost:8080 ...
echo Press Ctrl+C to stop
start http://localhost:8080/index.html
python -m http.server 8080
