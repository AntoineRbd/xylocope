# PowerShell script to resize logos using .NET System.Drawing
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height = 0,
        [bool]$MaintainAspectRatio = $true
    )
    
    $image = [System.Drawing.Image]::FromFile($InputPath)
    
    if ($MaintainAspectRatio -and $Height -eq 0) {
        $aspectRatio = $image.Height / $image.Width
        $Height = [int]($Width * $aspectRatio)
    }
    
    $newImage = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($image, 0, 0, $Width, $Height)
    
    $newImage.Save($OutputPath)
    
    $graphics.Dispose()
    $newImage.Dispose()
    $image.Dispose()
}

# Get current directory
$currentDir = Get-Location

# Resize main logo to 100px width
Write-Host "Resizing main logo..."
Resize-Image -InputPath "xylocope-logo.png" -OutputPath "xylocope-logo-temp.png" -Width 100

# Resize alt logo to 40px width  
Write-Host "Resizing alt logo..."
Resize-Image -InputPath "xylocope-logo-alt.png" -OutputPath "xylocope-logo-alt-temp.png" -Width 40

# Create backups and replace originals
Write-Host "Creating backups and replacing files..."
Copy-Item "xylocope-logo.png" "xylocope-logo-original.png"
Copy-Item "xylocope-logo-alt.png" "xylocope-logo-alt-original.png"
Move-Item "xylocope-logo-temp.png" "xylocope-logo.png" -Force
Move-Item "xylocope-logo-alt-temp.png" "xylocope-logo-alt.png" -Force

Write-Host "Logo optimization complete!"
Write-Host "Original files backed up as *-original.png"
Write-Host "Note: Background removal and favicon creation require additional tools"