$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Backend = Join-Path $Root "backend"
$BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$Python = (Get-Command python -ErrorAction SilentlyContinue).Source
if ([string]::IsNullOrWhiteSpace($Python)) {
  $Python = (Get-Command py -ErrorAction SilentlyContinue).Source
}
if ([string]::IsNullOrWhiteSpace($Python) -and (Test-Path -LiteralPath $BundledPython)) {
  $Python = $BundledPython
}
if ([string]::IsNullOrWhiteSpace($Python)) {
  throw "Python was not found. Please install Python 3.10+ and retry."
}

Set-Location $Backend
& $Python -m pip install -r requirements.txt
& $Python app.py
