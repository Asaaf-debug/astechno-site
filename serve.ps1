param(
  [int]$Port = 8080,
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = "Stop"
$rootFull = [System.IO.Path]::GetFullPath($Root)
$prefix = "http://localhost:$Port/"

$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".txt"  = "text/plain; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".ico"  = "image/x-icon"
  ".map"  = "application/json; charset=utf-8"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()
$script:StopRequested = $false

$cancelHandler = [ConsoleCancelEventHandler]{
  param($sender, $eventArgs)
  $eventArgs.Cancel = $true
  $script:StopRequested = $true
  try {
    if ($listener.IsListening) {
      $listener.Stop()
    }
  } catch {
  }
}

[System.Console]::add_CancelKeyPress($cancelHandler)

Write-Host "Serving $rootFull at $prefix"
Write-Host "Press Ctrl+C to stop."

try {
  while ($listener.IsListening -and -not $script:StopRequested) {
    $task = $listener.GetContextAsync()
    while (-not $task.Wait(200)) {
      if ($script:StopRequested -or -not $listener.IsListening) {
        break
      }
    }

    if ($script:StopRequested -or -not $listener.IsListening -or -not $task.IsCompleted) {
      continue
    }

    $context = $task.Result
    $requestPath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "index.html"
    }

    $candidate = [System.IO.Path]::GetFullPath((Join-Path $rootFull $requestPath))

    if (-not $candidate.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
      $context.Response.StatusCode = 403
      $context.Response.Close()
      continue
    }

    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
      $bytes = [System.IO.File]::ReadAllBytes($candidate)
      $context.Response.ContentType = $contentTypes[$ext]
      if (-not $context.Response.ContentType) {
        $context.Response.ContentType = "application/octet-stream"
      }
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.OutputStream.Close()
    } else {
      $context.Response.StatusCode = 404
      $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $context.Response.ContentType = "text/plain; charset=utf-8"
      $context.Response.ContentLength64 = $notFound.Length
      $context.Response.OutputStream.Write($notFound, 0, $notFound.Length)
      $context.Response.OutputStream.Close()
    }
  }
} finally {
  try {
    [System.Console]::remove_CancelKeyPress($cancelHandler)
  } catch {
  }
  try {
    if ($listener.IsListening) {
      $listener.Stop()
    }
  } catch {
  }
  $listener.Close()
}
