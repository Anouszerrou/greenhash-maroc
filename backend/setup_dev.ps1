<#
  setup_dev.ps1
  - crée un virtualenv avec Python 3.11 (si présent)
  - installe les dépendances depuis requirements.txt
  - lance l'app via: python -m backend.app

  Usage: Exécuter depuis PowerShell:
    .\setup_dev.ps1

  Note: require Python 3.11 (ou 3.10). Le script détecte et utilisera py -3.11 si disponible.
#>

Set-StrictMode -Version Latest

# Aller dans le dossier du script
Set-Location $PSScriptRoot

Write-Host "Running setup_dev.ps1 in $PSScriptRoot"

$pyCmd = $null

function Test-PyVersion($launcher) {
    try {
        & $launcher -3.11 -V > $null 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

if (Get-Command py -ErrorAction SilentlyContinue) {
    if (Test-PyVersion 'py') { $pyCmd = 'py -3.11' }
}

if (-not $pyCmd) {
    Write-Host "py -3.11 not found. Trying py -3.10..."
    try { & py -3.10 -V > $null 2>&1; if ($LASTEXITCODE -eq 0) { $pyCmd = 'py -3.10' } }
    catch { }
}

if (-not $pyCmd) {
    Write-Warning "Python 3.11 or 3.10 not found via the py launcher. Please install Python 3.11 or 3.10 and ensure 'py' is on PATH. Aborting."; exit 1
}

Write-Host "Using $pyCmd to create virtual environment"

# Create venv
& $pyCmd -m venv .venv

Write-Host "Activating venv..."
. .\.venv\Scripts\Activate.ps1

Write-Host "Upgrading pip and installing requirements..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

Write-Host "Starting the app (python -m backend.app)"
python -m backend.app
