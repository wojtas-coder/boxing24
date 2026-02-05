$ErrorActionPreference = "Stop"

function Add-VercelEnv {
    param(
        [string]$key,
        [string]$value
    )
    Write-Host "Adding $key..."
    $process = Start-Process -FilePath "npx.cmd" -ArgumentList "vercel", "env", "add", $key, "production" -NoNewWindow -PassThru -RedirectStandardInput (New-Object System.Diagnostics.ProcessStartInfo).RedirectStandardInput
    $process.StandardInput.WriteLine($value)
    $process.StandardInput.Close()
    $process.WaitForExit()
}

# 1. Supabase URL (Shared)
Add-VercelEnv "VITE_SUPABASE_URL" "https://sltxwuaxueqcdlkseqgl.supabase.co"
Add-VercelEnv "SUPABASE_URL" "https://sltxwuaxueqcdlkseqgl.supabase.co"

# 2. Supabase Key (Shared)
$supaKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsdHh3dWF4dWVxY2Rsa3NlcWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzc5ODIsImV4cCI6MjA4NDc1Mzk4Mn0.leriGRlCVJBWqj1jAhI32KgmmLhcs1kWrRLNKR06Bcc"
Add-VercelEnv "VITE_SUPABASE_ANON_KEY" $supaKey
Add-VercelEnv "SUPABASE_KEY" $supaKey

# 3. Google / Gemini
Add-VercelEnv "GEMINI_API_KEY" "AIzaSyDu9P1e2-bNmaOFQe2C7N-q3xbj8752DMc"
Add-VercelEnv "GOOGLE_SEARCH_API_KEY" "AIzaSyDu9P1e2-bNmaOFQe2C7N-q3xbj8752DMc"
Add-VercelEnv "GOOGLE_CX_ID" "25ee53714efbf4cc9"

Write-Host "✅ All keys added successfully!"
