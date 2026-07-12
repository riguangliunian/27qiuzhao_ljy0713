param(
  [string]$ExportFile = "",
  [switch]$FromFile
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Backend = Join-Path $Root "backend"
$BundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$BundledPnpm = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
if ([string]::IsNullOrWhiteSpace($Node) -and (Test-Path -LiteralPath $BundledNode)) {
  $Node = $BundledNode
}
$Npm = (Get-Command npm -ErrorAction SilentlyContinue).Source
$Pnpm = (Get-Command pnpm -ErrorAction SilentlyContinue).Source
if ([string]::IsNullOrWhiteSpace($Pnpm) -and (Test-Path -LiteralPath $BundledPnpm)) {
  $Pnpm = $BundledPnpm
}
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

if (-not $FromFile) {
  if ([string]::IsNullOrWhiteSpace($Node)) {
    throw "Node.js was not found. Please install Node.js 18+ and retry."
  }
  if (-not (Test-Path -LiteralPath (Join-Path $Backend "node_modules\playwright"))) {
    $env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1"
    if (-not [string]::IsNullOrWhiteSpace($Npm)) {
      & $Npm install
    } elseif (-not [string]::IsNullOrWhiteSpace($Pnpm)) {
      & $Pnpm install
    } else {
      throw "npm/pnpm was not found. Please install Node.js 18+ and retry."
    }
  }
  & $Node scrape_tencent_docs.js
  if ($LASTEXITCODE -ne 0) {
    throw "Tencent Docs scraping failed. Login in the opened browser and make sure the sheet grid is visible."
  }
  $ExportFile = Join-Path $Backend "data\tencent-docs.tsv"
}

if (-not (Test-Path -LiteralPath $ExportFile)) {
  throw "Export file was not found: $ExportFile"
}

& $Python -m pip install -r requirements.txt
& $Python sync_tencent_docs.py --file $ExportFile
