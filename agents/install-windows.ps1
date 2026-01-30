<# 
==============================================================================
Name:        Philipp Fischer
Kontakt:     p.fischer@itconex.de
Version:     2026.01.30.13.30.00
Beschreibung: LogBot Agent v2026.01.30.13.30.00 - Windows Installer
              Installiert einen PowerShell-basierten Event Log Forwarder
              Keine zusätzlichen Abhängigkeiten erforderlich!
==============================================================================
#>

#Requires -RunAsAdministrator

param(
    [string]$ServerHost = "",
    [int]$ServerPort = 514,
    [switch]$Uninstall,
    [switch]$Test
)

$ErrorActionPreference = "Stop"

# Konfiguration
$INSTALL_DIR = "$env:ProgramData\LogBot-Agent"
$SCRIPT_NAME = "LogBotAgent.ps1"
$TASK_NAME = "LogBotAgent"
$AGENT_VERSION = "2026.01.30.13.30.00"

# ==============================================================================
# Hilfsfunktionen
# ==============================================================================

function Write-LogInfo($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-LogSuccess($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-LogWarn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-LogError($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# ==============================================================================
# Agent Script (wird installiert)
# ==============================================================================

$AgentScript = @'
<#
==============================================================================
Name:        Philipp Fischer
Kontakt:     p.fischer@itconex.de
Version:     2026.01.30.13.30.00
Beschreibung: LogBot Agent v2026.01.30.13.30.00 - Windows Event Log Forwarder
              Liest Windows Event Logs und sendet sie per Syslog an LogBot
==============================================================================
#>

param(
    [string]$ConfigFile = "$PSScriptRoot\config.json"
)

# Konfiguration laden
if (Test-Path $ConfigFile) {
    $Config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
} else {
    Write-Error "Konfiguration nicht gefunden: $ConfigFile"
    exit 1
}

$ServerHost = $Config.server_host
$ServerPort = $Config.server_port
$LogSources = $Config.log_sources
$MinLevel = $Config.min_level
$Hostname = if ($Config.hostname) { $Config.hostname } else { $env:COMPUTERNAME }

# Level Mapping (Windows -> Syslog)
$LevelMap = @{
    1 = 2   # Critical -> critical
    2 = 3   # Error -> error  
    3 = 4   # Warning -> warning
    4 = 6   # Information -> info
    0 = 6   # LogAlways -> info
    5 = 7   # Verbose -> debug
}

$MinLevelNum = @{ "debug"=7; "info"=6; "notice"=5; "warning"=4; "error"=3; "critical"=2 }[$MinLevel]
if (-not $MinLevelNum) { $MinLevelNum = 6 }

# UDP Client erstellen
$UdpClient = New-Object System.Net.Sockets.UdpClient

# Letzte Record-IDs pro Log speichern
$StateFile = "$PSScriptRoot\state.json"
$LastRecords = @{}
if (Test-Path $StateFile) {
    try {
        $LastRecords = Get-Content $StateFile -Raw | ConvertFrom-Json -AsHashtable
    } catch { $LastRecords = @{} }
}

# Syslog-Nachricht senden
function Send-Syslog {
    param([string]$Message, [int]$Severity = 6, [string]$Source = "EventLog")
    
    # Priority = Facility * 8 + Severity (Facility 1 = user)
    $Priority = 8 + $Severity
    
    # Timestamp im BSD-Format
    $Timestamp = Get-Date -Format "MMM dd HH:mm:ss"
    
    # Syslog-Nachricht formatieren
    $SyslogMsg = "<$Priority>$Timestamp $Hostname $Source`: $Message"
    
    try {
        $Bytes = [System.Text.Encoding]::UTF8.GetBytes($SyslogMsg)
        $UdpClient.Send($Bytes, $Bytes.Length, $ServerHost, $ServerPort) | Out-Null
        return $true
    } catch {
        Write-Warning "Sendefehler: $_"
        return $false
    }
}

# Log-Eintrag verarbeiten
function Process-Event {
    param($Event, [string]$LogName)
    
    $Level = $LevelMap[[int]$Event.Level]
    if (-not $Level) { $Level = 6 }
    
    # Level-Filter
    if ($Level -gt $MinLevelNum) { return }
    
    # Nachricht extrahieren
    $Message = $Event.Message
    if (-not $Message) { $Message = "EventID: $($Event.Id)" }
    
    # Auf 1024 Zeichen begrenzen und Zeilenumbrüche entfernen
    $Message = ($Message -replace "`r`n|`n|`r", " ").Substring(0, [Math]::Min(1024, $Message.Length))
    
    # Source zusammensetzen
    $Source = "$LogName/$($Event.ProviderName)"
    
    Send-Syslog -Message $Message -Severity $Level -Source $Source
}

# Hauptschleife
Write-Host "LogBot Agent v$AGENT_VERSION gestartet"
Write-Host "Server: ${ServerHost}:${ServerPort}"
Write-Host "Hostname: $Hostname"
Write-Host "Log-Quellen: $($LogSources -join ', ')"
Write-Host "---"

# Initial: Nur neue Events (letzte 5 Minuten überspringen)
$StartTime = (Get-Date).AddMinutes(-1)

while ($true) {
    foreach ($LogName in $LogSources) {
        try {
            # Neue Events seit letztem Check holen
            $Events = Get-WinEvent -LogName $LogName -MaxEvents 100 -ErrorAction SilentlyContinue | 
                      Where-Object { $_.TimeCreated -gt $StartTime }
            
            foreach ($Event in $Events) {
                Process-Event -Event $Event -LogName $LogName
            }
        } catch {
            # Log existiert nicht oder kein Zugriff - ignorieren
        }
    }
    
    $StartTime = Get-Date
    Start-Sleep -Seconds 5
}
'@

# ==============================================================================
# Installation
# ==============================================================================

function Install-Agent {
    Write-LogInfo "Installiere LogBot Agent..."
    
    # Verzeichnis erstellen
    if (-not (Test-Path $INSTALL_DIR)) {
        New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
    }
    
    # Server abfragen
    if ([string]::IsNullOrEmpty($ServerHost)) {
        $ServerHost = Read-Host "LogBot Server Adresse"
        if ([string]::IsNullOrEmpty($ServerHost)) {
            Write-LogError "Server-Adresse ist erforderlich!"
            exit 1
        }
    }
    
    $PortInput = Read-Host "LogBot Server Port [514]"
    if (-not [string]::IsNullOrEmpty($PortInput)) {
        $ServerPort = [int]$PortInput
    }
    
    Write-Host ""
    Write-Host "Welche Event Logs sollen weitergeleitet werden?"
    Write-Host "  1) Application + System (Standard)"
    Write-Host "  2) Application + System + Security"
    Write-Host "  3) Nur Application"
    $LogChoice = Read-Host "Auswahl [1]"
    
    $LogSources = switch ($LogChoice) {
        "2" { @("Application", "System", "Security") }
        "3" { @("Application") }
        default { @("Application", "System") }
    }
    
    Write-Host ""
    Write-Host "Minimales Log-Level:"
    Write-Host "  1) Alle (info und höher)"
    Write-Host "  2) Nur Warnungen (warning und höher)"
    Write-Host "  3) Nur Fehler (error und höher)"
    $LevelChoice = Read-Host "Auswahl [1]"
    
    $MinLevel = switch ($LevelChoice) {
        "2" { "warning" }
        "3" { "error" }
        default { "info" }
    }
    
    # Agent Script speichern
    $AgentScript | Set-Content "$INSTALL_DIR\$SCRIPT_NAME" -Encoding UTF8
    
    # Konfiguration speichern
    $Config = @{
        server_host = $ServerHost
        server_port = $ServerPort
        hostname = $env:COMPUTERNAME
        log_sources = $LogSources
        min_level = $MinLevel
    }
    $Config | ConvertTo-Json | Set-Content "$INSTALL_DIR\config.json" -Encoding UTF8
    
    Write-LogSuccess "Agent installiert: $INSTALL_DIR"
}

function Install-ScheduledTask {
    Write-LogInfo "Erstelle Scheduled Task..."
    
    # Existierenden Task entfernen
    $Existing = Get-ScheduledTask -TaskName $TASK_NAME -ErrorAction SilentlyContinue
    if ($Existing) {
        Unregister-ScheduledTask -TaskName $TASK_NAME -Confirm:$false
    }
    
    # Task erstellen
    $Action = New-ScheduledTaskAction `
        -Execute "powershell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$INSTALL_DIR\$SCRIPT_NAME`"" `
        -WorkingDirectory $INSTALL_DIR
    
    $Trigger = New-ScheduledTaskTrigger -AtStartup
    
    $Settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 1) `
        -ExecutionTimeLimit (New-TimeSpan -Days 365)
    
    $Principal = New-ScheduledTaskPrincipal `
        -UserId "SYSTEM" `
        -LogonType ServiceAccount `
        -RunLevel Highest
    
    Register-ScheduledTask `
        -TaskName $TASK_NAME `
        -Action $Action `
        -Trigger $Trigger `
        -Settings $Settings `
        -Principal $Principal `
        -Description "LogBot Agent v$AGENT_VERSION - Windows Event Log Forwarder" | Out-Null
    
    Write-LogSuccess "Scheduled Task erstellt"
}

function Start-Agent {
    Write-LogInfo "Starte Agent..."
    Start-ScheduledTask -TaskName $TASK_NAME
    
    Start-Sleep -Seconds 3
    
    $Task = Get-ScheduledTask -TaskName $TASK_NAME
    if ($Task.State -eq "Running") {
        Write-LogSuccess "Agent läuft"
    } else {
        Write-LogWarn "Agent-Status: $($Task.State)"
    }
}

# ==============================================================================
# Test
# ==============================================================================

function Send-TestMessage {
    Write-LogInfo "Sende Test-Nachrichten..."
    
    # Konfiguration laden
    $ConfigFile = "$INSTALL_DIR\config.json"
    if (-not (Test-Path $ConfigFile)) {
        Write-LogError "Agent nicht installiert!"
        exit 1
    }
    
    $Config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
    
    $UdpClient = New-Object System.Net.Sockets.UdpClient
    $Hostname = $env:COMPUTERNAME
    
    $Messages = @(
        @{ Level = 6; Text = "LogBot Agent Test - Info Nachricht" },
        @{ Level = 4; Text = "LogBot Agent Test - Warning Nachricht" },
        @{ Level = 3; Text = "LogBot Agent Test - Error Nachricht" }
    )
    
    foreach ($Msg in $Messages) {
        $Priority = 8 + $Msg.Level
        $Timestamp = Get-Date -Format "MMM dd HH:mm:ss"
        $SyslogMsg = "<$Priority>$Timestamp $Hostname logbot-test: $($Msg.Text)"
        
        try {
            $Bytes = [System.Text.Encoding]::UTF8.GetBytes($SyslogMsg)
            $UdpClient.Send($Bytes, $Bytes.Length, $Config.server_host, $Config.server_port) | Out-Null
            Write-Host "[SENT] $($Msg.Text)" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] $($Msg.Text): $_" -ForegroundColor Red
        }
    }
    
    $UdpClient.Close()
    Write-LogSuccess "Test abgeschlossen - prüfe LogBot Web-Interface"
}

# ==============================================================================
# Deinstallation
# ==============================================================================

function Uninstall-Agent {
    Write-LogInfo "Deinstalliere LogBot Agent..."
    
    # Task stoppen und entfernen
    $Task = Get-ScheduledTask -TaskName $TASK_NAME -ErrorAction SilentlyContinue
    if ($Task) {
        if ($Task.State -eq "Running") {
            Stop-ScheduledTask -TaskName $TASK_NAME
        }
        Unregister-ScheduledTask -TaskName $TASK_NAME -Confirm:$false
        Write-LogInfo "Scheduled Task entfernt"
    }
    
    # Dateien entfernen
    if (Test-Path $INSTALL_DIR) {
        Remove-Item -Path $INSTALL_DIR -Recurse -Force
        Write-LogInfo "Dateien entfernt"
    }
    
    Write-LogSuccess "LogBot Agent deinstalliert"
}

# ==============================================================================
# Zusammenfassung
# ==============================================================================

function Show-Summary {
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host "  LogBot Agent v$AGENT_VERSION installiert!" -ForegroundColor Green
    Write-Host "==============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installation: $INSTALL_DIR"
    Write-Host ""
    Write-Host "Nuetzliche Befehle (PowerShell als Admin):"
    Write-Host "  Get-ScheduledTask -TaskName $TASK_NAME        # Status"
    Write-Host "  Start-ScheduledTask -TaskName $TASK_NAME      # Starten"
    Write-Host "  Stop-ScheduledTask -TaskName $TASK_NAME       # Stoppen"
    Write-Host ""
    Write-Host "Test:"
    Write-Host "  .\install-windows.ps1 -Test"
    Write-Host ""
    Write-Host "Deinstallation:"
    Write-Host "  .\install-windows.ps1 -Uninstall"
    Write-Host ""
}

# ==============================================================================
# Hauptprogramm
# ==============================================================================

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  LogBot Agent v$AGENT_VERSION - Windows" -ForegroundColor Cyan
Write-Host "  (PowerShell Event Log Forwarder)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

if ($Uninstall) {
    Uninstall-Agent
    exit 0
}

if ($Test) {
    Send-TestMessage
    exit 0
}

Install-Agent
Install-ScheduledTask
Start-Agent
Send-TestMessage
Show-Summary
