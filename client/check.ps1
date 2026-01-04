# Directorio del proyecto (ajústalo a tu ruta)
$ProjectDir = "C:\Users\alejo\Documents\carpetaprotegida\parking-app\client\src"


# Extensiones que quieres analizar
$Extensions = @("*.js", "*.jsx", "*.ts", "*.tsx")

# Buscar archivos, contar líneas y ordenar de mayor a menor
Get-ChildItem -Path $ProjectDir -Recurse -Include $Extensions -File |
    Where-Object { $_.FullName -notlike "*\node_modules\*" } |
    ForEach-Object {
        $lineCount = (Get-Content $_.FullName).Count
        if ($lineCount -gt 200) {
            [PSCustomObject]@{
                Archivo = $_.FullName
                Lineas  = $lineCount
            }
        }
    } | Sort-Object Lineas -Descending |
    ForEach-Object {
        Write-Output "$($_.Archivo) -> $($_.Lineas) líneas"
    }
