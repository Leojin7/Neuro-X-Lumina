@echo off
setlocal enabledelayedexpansion

echo Starting comment removal...

for /r . %%f in (*.ts,*.tsx,*.js,*.jsx) do (
    echo Processing: %%~nxf
    powershell -Command "(Get-Content '%%f' -Raw) -replace '(?<![\\])\/\/.*?$', '' -replace '\/\*[\s\S]*?\*\/' -replace '[\r\n]+\s*[\r\n]+', "`r`n" | Set-Content '%%f' -NoNewline"
)

echo Comment removal complete!
pause
