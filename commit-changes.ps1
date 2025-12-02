# commit-changes.ps1
# Script simples para inicializar (se necessário) e commitar mudanças no repositório
# Execute a partir da raiz do projeto: powershell -ExecutionPolicy Bypass -File .\commit-changes.ps1

try {
    # Garante que o diretório atual do script seja o diretório do projeto
    $scriptDir = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
    if ($scriptDir) { Set-Location $scriptDir }

    # Verifica se já estamos dentro de um repositório Git
    git rev-parse --is-inside-work-tree 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Repositório Git não encontrado — inicializando..."
        git init
        git config user.name "autofixer"
        git config user.email "autofixer@example.com"
        git add -A
        git commit -m "chore: initial commit (project baseline)"
    } else {
        Write-Host "Repositório Git detectado — preparando commit..."
        git add -A
        git diff --cached --quiet
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Sem mudanças a commitar."
        } else {
            git commit -m "fix: resolve TypeScript errors — enums, types, services, reminderService, and misc"
        }
    }

    Write-Host "Últimos commits:"
    git --no-pager log -n 5 --oneline
} catch {
    Write-Host "Ocorreu um erro durante a execução: " $_.Exception.Message -ForegroundColor Red
    exit 1
}
