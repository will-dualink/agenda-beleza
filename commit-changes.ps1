# Script para inicializar e commitar mudancas no Git
# Execute: powershell -ExecutionPolicy Bypass -File .\commit-changes.ps1

$ErrorActionPreference = "Stop"

Write-Host "Inicializando repositorio Git..."
git init
git config user.name "autofixer"
git config user.email "autofixer@example.com"

Write-Host "Adicionando arquivos..."
git add -A

Write-Host "Commitando mudancas..."
git commit -m "fix: resolve TypeScript errors -- enums, types, services, reminderService, and misc"

Write-Host "Ultimos 5 commits:"
git log --oneline -n 5

Write-Host "Commit concluido com sucesso!" -ForegroundColor Green
