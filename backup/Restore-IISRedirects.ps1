# Include Get-IISRedirects
. "$PSScriptRoot\Get-IISRedirects.ps1"

# Include ConvertTo-Markdown
. "$PSScriptRoot\ConvertTo-Markdown.ps1"

Write-Host "Current IIS Redirects:"
$oldIISRedirects = Get-IISRedirects -Verbose | Select enabled, PSPath, Location, destination, exactDestination, httpResponseStatus

$backupFilePath = 'C:\Users\ryanlane\Desktop\Backup\IISRedirects110919.csv'

# Import Saved Redirects
Write-Host "Importing Backed Up IISRedirects from '$backupFilePath'..."
$importedIISRedirects = Import-CSV -Path $backupFilePath
$importedIISRedirects | Select enabled, PSPath, Location, destination, exactDestination, httpResponseStatus | ConvertTo-Markdown

Write-Host "Restoring IISRedirect WebConfigurations:"
$importedIISRedirects | ForEach-Object {
    Set-WebConfiguration -Filter system.webServer/httpRedirect -PSPath $_.PSPath -Location $_.Location -Value $_
    Write-Output $_
} | ft

Write-Host "New IIS Redirects:"
$newIISRedirects = Get-IISRedirects -Verbose | Select enabled, PSPath, Location, destination, exactDestination, httpResponseStatus

Function Compare-ObjectProperties {
    [CmdletBinding()]
    Param(
        [PSObject]$ReferenceObject,
        [PSObject]$DifferenceObject
    )
    $objprops = $ReferenceObject | Get-Member -MemberType Property, NoteProperty | ? { $_.Name -ne 'SideIndicator'} | % Name
    $objprops += $DifferenceObject | Get-Member -MemberType Property, NoteProperty | ? { $_.Name -ne 'SideIndicator'} | % Name
    $objprops = $objprops | Sort | Select -Unique
    $diffs = @()
    Write-Verbose "objprops $objprops"
    foreach ($objprop in $objprops) {
        Write-Verbose "objprop $objprop"
        $diff = Compare-Object $ReferenceObject $DifferenceObject -Property $objprop -PassThru
        if ($diff)
        {
            $diff | Group-Object -Property Location | ForEach-Object {
                $diffObj = $_
                $diffObjProps = @{
                    Location = $diffObj.Name
                    PropertyName = $objprop
                    OldValue = ($diffObj.Group | ? {$_.SideIndicator -eq '<='} | % $($objprop))
                    NewValue = ($diffObj.Group | ? {$_.SideIndicator -eq '=>'} | % $($objprop))
                }
                $diffs += New-Object PSObject -Property $diffObjProps
            }
        }
    }
    if ($diffs)
    {
        return ($diffs | Select Location, PropertyName, OldValue, NewValue)
    }
}


Write-Host "IIS Redirect Configuration Diff:"
Compare-ObjectProperties -ReferenceObject $oldIISRedirects -DifferenceObject $newIISRedirects | Sort-Object -Property Location, PropertyName |Group-Object -Property Location | ForEach-Object {
    $resultItem = New-Object PSObject -Property @{
        Location = $_.Name;
        Results = ($_.Group | Select PropertyName, OldValue, NewValue | ConvertTo-Markdown | Out-String -Width 256);
    }
    Write-Output $resultItem;
} | Select Location, Results | ft -AutoSize -Wrap