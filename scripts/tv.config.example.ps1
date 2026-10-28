# Copy this file to scripts\tv.config.ps1 (git-ignored) and fill in your values.
@{
  # The TV's LAN address: TV Settings > General > Network > Network Status > IP Settings
  TvIp        = '192.168.1.100'

  # Name of the Tizen security profile created in docs\setup.md (step 3)
  Profile     = 'my-tv'

  # Where the Tizen CLI is installed
  TizenStudio = 'C:\tizen-studio'
}
