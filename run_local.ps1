<#
run_local.ps1

Script d'aide pour démarrer le projet en local sous Windows (PowerShell).
- Détecte et utilise `py -3.11` (ou `py -3.10` en fallback).
- Crée un virtualenv dans `backend\.venv` si absent.
- Installe les dépendances Python.
- Lance le backend Flask dans une nouvelle fenêtre PowerShell.
- Lance le frontend Vite dans une nouvelle fenêtre PowerShell.

Conçu pour fonctionner sur chemins contenant espaces (ex: OneDrive).
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "Run local helper — Green Hash Maroc"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $root) { $root = Get-Location }
Write-Host "Project root: $root"

function Find-PyLauncher {
    # Return a launcher command string like 'py -3.11' or $null
    $candidates = @("py -3.11", "py -3.10", "py -3")
    foreach ($c in $candidates) {
        try {
            & cmd /c "$c -V" > $null 2>&1
            if ($LASTEXITCODE -eq 0) { return $c }
        } catch { }
    }
    return $null
}

$pyCmd = Find-PyLauncher
if (-not $pyCmd) {
    Write-Warning "Python 3.11/3.10 not found via py launcher.\nPlease install Python 3.11 and ensure 'py' is on PATH.\nDownload: https://www.python.org/downloads/release/python-311/"
    exit 1
}
Write-Host "Using Python launcher: $pyCmd"

# Paths
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'
$venvPath = Join-Path $backendPath '.venv'
$pythonExe = Join-Path $venvPath 'Scripts\python.exe'
$activateScript = Join-Path $venvPath 'Scripts\Activate.ps1'

# Create venv if missing
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating virtual environment in $venvPath"
    & cmd /c "$pyCmd -m venv "$venvPath""
}

# Upgrade pip and install requirements
if (-not (Test-Path $pythonExe)) {
    Write-Error "Python executable not found at $pythonExe. Aborting."
    exit 1
}

Write-Host "Upgrading pip and installing Python dependencies (this may take a few minutes)..."
& "$pythonExe" -m pip install --upgrade pip
& "$pythonExe" -m pip install -r (Join-Path $backendPath 'requirements.txt')

# Install frontend deps (run in current window, can be heavy)
if (Test-Path (Join-Path $frontendPath 'package.json')) {
    Write-Host "Installing frontend npm dependencies..."
    Push-Location $frontendPath
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install
    } else {
        Write-Warning "npm not found. Please install Node.js 18+ and ensure 'npm' is on PATH."
    }
    Pop-Location
} else {
    Write-Warning "No frontend package.json found at $frontendPath"
}

# Start backend in a new PowerShell window
$backendCmd = "cd '$backendPath'; . '$activateScript'; python -m backend.app"
Write-Host "Starting backend in a new window: $backendCmd"
Start-Process powershell -ArgumentList @("-NoExit","-Command", $backendCmd)

# Start frontend in a new PowerShell window (Vite)
if (Test-Path (Join-Path $frontendPath 'package.json')) {
    $frontendCmd = "cd '$frontendPath'; npm run dev"
    Write-Host "Starting frontend in a new window: $frontendCmd"
    Start-Process powershell -ArgumentList @("-NoExit","-Command", $frontendCmd)
}

Write-Host "Done. Backend should be running on http://127.0.0.1:5000 and frontend on http://localhost:5173 (Vite default)."
Write-Host "Open http://localhost:5173 in your browser and verify /api/health at http://127.0.0.1:5000/api/health"
