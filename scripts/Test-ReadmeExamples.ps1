#
# Test-ReadmeExamples.ps1
# Test that usage examples on README.md are working fine.
#

Push-Location (Join-Path -Path $PSScriptRoot -ChildPath "..")

$exitCode = 0

Get-Content ./README.md |
    Select-String -Pattern "^mdtodoc .+\.md" |
    ForEach-Object { $_ -replace "doc.md","README.md" -replace "--?w(atch)?","" } |
    ForEach-Object {
        Write-Host -ForegroundColor Yellow "> $_";
        Invoke-Expression "$_";
        $exitCode += $LASTEXITCODE
    }

if (Test-Path ./*.html) {
    Remove-Item ./*.html
}

if ($exitCode -eq 0) {
    Write-Host -ForegroundColor Green "=== Success ==="
} else {
    Write-Host -ForegroundColor Red "=== Fail ==="
}

Pop-Location
