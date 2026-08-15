$ErrorActionPreference = "Stop"

$tools = "C:\Users\p3rc\Documents\Codex\2026-07-23\files-mentioned-by-the-user-you"

Set-Location $tools

# Keep WSL running while signed in, then start/verify LifeOS.
.\LifeOS-Windows-KeepAlive-Repair.ps1
.\LifeOS-Windows-AutoStart-Verify.ps1

# Open LifeOS locally.
Start-Process "http://127.0.0.1:3001"

# Optional: confirm private mobile/Tailscale access.
.\LifeOS-Mobile-Tailscale-Verify.ps1