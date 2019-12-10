$backupFilePath = 'C:\Users\ryanlane\Desktop\Backup\IISRedirects110919.csv'

# Include Get-IISRedirects
. "$PSScriptRoot\Get-IISRedirects.ps1"

$IISRedirects = Get-IISRedirects -Verbose

Write-Host "Saving IIS Redirects to '$backupFilePath'"
$IISRedirects | Select enabled, PSPath, Location, destination, exactDestination, httpResponseStatus  | Export-Csv -Path $backupFilePath -Encoding UTF8 -NoTypeInformation
