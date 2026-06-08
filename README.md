# Media files (don't commit videos)
*.mp4
*.mov
*.m4v
*.mkv
*.webm
*.wav
*.mp3

# Virtual environment
venv/
*.venv

# Secrets & local config (keys live here -- never commit)
.env
project_settings.json
broll_rules.yaml

# Python cache
__pycache__/
*.pyc
*.pyo
*.pyd

# Build artifacts
build/
dist/
*.egg-info/

# Runtime folders (live on the local machine, not in git)
/assets/
/output/
/stems/
/uploads/
/local_broll/
/.work/

# Keep the example/template files though
!broll_rules.example.yaml
!.env.example

# Editor noise
.DS_Store
