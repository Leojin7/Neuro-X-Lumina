# PowerShell script to remove comments from TypeScript and JavaScript files

function Remove-FileComments {
    param (
        [string]$filePath
    )
    
    $content = Get-Content -Path $filePath -Raw
    
    # Remove single-line comments (//...)
    $content = $content -replace '(?<![\\])\/\/.*?$', '' -replace '\/\*.*?\*\/'
    
    # Remove multi-line comments (/* ... */)
    $content = $content -replace '\/\*[\s\S]*?\*\/'
    
    # Remove empty lines
    $content = $content -replace '[\r\n]+\s*[\r\n]+', "`r`n"
    
    # Save the file if changes were made
    if ($content -ne (Get-Content -Path $filePath -Raw)) {
        $content | Set-Content -Path $filePath -NoNewline
        Write-Host "Processed: $filePath"
    }
}

# Get all .ts, .tsx, .js, .jsx files, excluding node_modules and .git
$files = Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx -Recurse | 
         Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' }

Write-Host "Found $($files.Count) files to process..."

foreach ($file in $files) {
    try {
        Remove-FileComments -filePath $file.FullName
    } catch {
        Write-Host "Error processing $($file.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "Comment removal complete!"
