param()

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Backend = Join-Path $Root "backend"
$BundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

$Node = (Get-Command node -ErrorAction SilentlyContinue).Source
if ([string]::IsNullOrWhiteSpace($Node) -and (Test-Path -LiteralPath $BundledNode)) {
  $Node = $BundledNode
}

$Python = (Get-Command python -ErrorAction SilentlyContinue).Source
if ([string]::IsNullOrWhiteSpace($Python)) {
  $Python = (Get-Command py -ErrorAction SilentlyContinue).Source
}
if ([string]::IsNullOrWhiteSpace($Python) -and (Test-Path -LiteralPath $BundledPython)) {
  $Python = $BundledPython
}

if ([string]::IsNullOrWhiteSpace($Node)) {
  throw "Node.js was not found. Please install Node.js 18+ and retry."
}
if ([string]::IsNullOrWhiteSpace($Python)) {
  throw "Python was not found. Please install Python 3.10+ and retry."
}

Set-Location $Backend

& $Node scrape_tencent_docs.js
if ($LASTEXITCODE -ne 0) {
  throw "Tencent Docs scraping failed. Login in the opened browser and make sure the sheet grid is visible."
}

$FullFile = Join-Path $Backend "data\tencent-docs.tsv"
$DailyFile = Join-Path $Backend "data\tencent-docs-daily.tsv"

& $Python filter_recent_updates.py --input $FullFile --output $DailyFile
& $Python sync_tencent_docs.py --file $DailyFile --append
& $Python export_web_data.py
