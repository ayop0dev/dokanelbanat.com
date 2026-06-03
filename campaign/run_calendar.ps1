# Run the calendar builder
python "D:\claude-Projects\dokanelbanat\campaign\build_calendar.py"
if ($LASTEXITCODE -eq 0) {
    $file = Get-Item "D:\claude-Projects\dokanelbanat\campaign\calendar.xlsx" -ErrorAction SilentlyContinue
    if ($file) {
        Write-Host "File exists: $($file.FullName)"
        Write-Host "File size: $($file.Length) bytes"
        Write-Host "Created: $($file.CreationTime)"
        Write-Host "CALENDAR DONE"
    } else {
        Write-Host "ERROR: File not found after script execution."
    }
} else {
    Write-Host "ERROR: Python script failed with exit code $LASTEXITCODE"
}
