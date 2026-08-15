<#
.SYNOPSIS
    Publishes this repository to GitHub.

.DESCRIPTION
    Signs in to GitHub if needed, creates the remote repository, and pushes
    the current branch. Safe to re-run: it never force-pushes and never
    rewrites history. If the repository already exists it only adds the
    remote and pushes.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/publish-to-github.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File scripts/publish-to-github.ps1 -RepoName my-site -Private
#>
[CmdletBinding()]
param(
    [string] $RepoName = 'aldamrany-website',
    [switch] $Private
)

$ErrorActionPreference = 'Stop'

# Resolve tooling: prefer whatever is on PATH, fall back to the known
# install locations so a fresh terminal is not required.
function Resolve-Tool {
    param([string] $Name, [string[]] $Fallbacks)

    $onPath = Get-Command $Name -ErrorAction SilentlyContinue
    if ($onPath) { return $onPath.Source }

    foreach ($candidate in $Fallbacks) {
        if ($candidate -and (Test-Path $candidate)) { return $candidate }
    }

    throw "$Name was not found. Install it and try again."
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$git = Resolve-Tool -Name 'git' -Fallbacks @(
    "$env:ProgramFiles\Git\cmd\git.exe",
    "${env:ProgramFiles(x86)}\Git\cmd\git.exe"
)
$gh = Resolve-Tool -Name 'gh' -Fallbacks @(
    (Join-Path $repoRoot '.tools\bin\gh.exe'),
    "$env:ProgramFiles\GitHub CLI\gh.exe"
)

Write-Host "git : $git"
Write-Host "gh  : $gh"
Write-Host ''

# --- Refuse to publish an unsafe tree ---------------------------------------
# A committed .env would leak the database URL, session secret and admin
# password, so stop before anything reaches GitHub.
$tracked = & $git ls-files
if ($tracked -contains '.env') {
    throw 'ABORTED: .env is tracked by git. Remove it with "git rm --cached .env" before publishing.'
}
Write-Host '[ok] .env is not tracked' -ForegroundColor Green

if (-not (& $git log -1 --oneline 2>$null)) {
    throw 'ABORTED: this repository has no commits yet.'
}

$branch = (& $git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "[ok] on branch '$branch'" -ForegroundColor Green

# --- Sign in ----------------------------------------------------------------
& $gh auth status 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host ''
    Write-Host '--------------------------------------------------------------' -ForegroundColor Cyan
    Write-Host ' GitHub authorisation' -ForegroundColor Cyan
    Write-Host '--------------------------------------------------------------' -ForegroundColor Cyan
    Write-Host ' Being signed in to github.com in your browser is NOT enough.'
    Write-Host ' This step gives the command line its own authorisation.'
    Write-Host ''
    Write-Host ' What happens next:'
    Write-Host '   1. A one-time code is printed below, e.g. ABCD-1234'
    Write-Host '   2. COPY IT, then press Enter to open the browser'
    Write-Host '   3. Paste the code and confirm'
    Write-Host '   4. Click "Authorize github"'
    Write-Host '   5. Come back here — it continues on its own'
    Write-Host '--------------------------------------------------------------' -ForegroundColor Cyan
    Write-Host ''

    & $gh auth login --hostname github.com --git-protocol https --web

    # Trust the reported state, not the exit code: an abandoned browser step
    # can still exit zero.
    & $gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'Sign-in did not complete — the one-time code was never confirmed. Re-run this script and finish all five steps above.'
    }
}

$account = (& $gh api user --jq '.login').Trim()
Write-Host "[ok] signed in as $account" -ForegroundColor Green

# Let gh act as the credential helper so the push does not prompt again.
& $gh auth setup-git 2>$null | Out-Null

# --- Create the repository ---------------------------------------------------
$visibility = if ($Private) { '--private' } else { '--public' }
$target = "$account/$RepoName"

& $gh repo view $target 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[..] $target already exists — reusing it" -ForegroundColor Yellow
} else {
    Write-Host "[..] creating $target ($($visibility.TrimStart('-')))"
    & $gh repo create $RepoName $visibility --source . --remote origin --disable-wiki
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the repository.' }
}

# --- Wire up the remote ------------------------------------------------------
$remoteUrl = "https://github.com/$target.git"
$existing = (& $git remote 2>$null)
if ($existing -contains 'origin') {
    & $git remote set-url origin $remoteUrl
} else {
    & $git remote add origin $remoteUrl
}
Write-Host "[ok] origin -> $remoteUrl" -ForegroundColor Green

# --- Push --------------------------------------------------------------------
Write-Host ''
Write-Host "[..] pushing '$branch'"
& $git push -u origin $branch
if ($LASTEXITCODE -ne 0) { throw 'The push failed. Nothing was force-pushed; resolve the error and re-run.' }

Write-Host ''
Write-Host '================================================' -ForegroundColor Green
Write-Host " Published: https://github.com/$target" -ForegroundColor Green
Write-Host '================================================' -ForegroundColor Green
Write-Host ''
Write-Host 'Next: set DATABASE_URL, AUTH_SECRET and NEXT_PUBLIC_SITE_URL on your host.'
Write-Host 'See the Deployment section of README.md.'
