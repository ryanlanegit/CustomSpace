# Include ConvertTo-Markdown
. "$PSScriptRoot\ConvertTo-Markdown.ps1"

#>
<#
.Synopsis
   Short description
.DESCRIPTION
   Long description
.EXAMPLE
   Get-IISRedirects
.EXAMPLE
   Get-IISRedirects -PSPath 'IIS:\sites\CiresonPortal'
.EXAMPLE
   Get-IISRedirects('IIS:\sites\CiresonPortal')
#>
function Get-IISRedirects
{
    [CmdletBinding()]
    [OutputType([Object[]])]
    Param
    (
        # IIS Site Path
        [Parameter(Mandatory=$false,
                   ValueFromPipelineByPropertyName=$true,
                   Position=0)]
        $PSPath = 'IIS:\sites\CiresonPortal'
    )

    Begin
    {
        Write-Verbose "Querying for IIS Redirects in '$PSPath'..."
    }
    Process
    {
        $IISRedirects = Get-WebConfiguration -Filter system.webServer/httpRedirect -PSPath $PSPath -Recurse
        Write-Verbose ("Results: `r`n" + ($IISRedirects | Select enabled, PSPath, Location, destination, exactDestination, httpResponseStatus | ConvertTo-Markdown | Out-String))
    }
    End
    {
        Write-Output $IISRedirects
    }
}