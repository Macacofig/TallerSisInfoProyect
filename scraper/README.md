## Init Server
node src/app.js
## Go to Login Page
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/scraper/login
## Extraction
$body = @{
    programa = "PREGRADO"
    periodo = "[2-2026-FEES] SEMESTRE SEGUNDO DEL 2026 FEES"
    carrera = "[ENF]"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/scraper/extraer -ContentType "application/json" -Body $body