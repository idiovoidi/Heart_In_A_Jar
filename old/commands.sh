# Remove __pycache__ directories from git tracking
git rm -r --cached __pycache__/
git rm -r --cached */__pycache__/

# Remove .venv directory from git tracking if it exists
git rm -r --cached .venv/

# Remove any .pyc files
git rm --cached *.pyc

# Commit these changes
git add .gitignore
git commit -m "Remove __pycache__ and virtual environment from git tracking" 