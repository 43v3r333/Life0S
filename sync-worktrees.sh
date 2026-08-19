#!/usr/bin/env bash
set -e

PROJECT_ROOT="$HOME/projects/Life0S"
WORKTREES_DIR="$PROJECT_ROOT/.orca/worktrees"
AGENTS=("claude" "mimo" "hermes" "antigravity")

echo "=== Life0S Worktree Sync Manager ==="

# 1. Ensure main branch is clean
cd "$PROJECT_ROOT"
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Main project directory has uncommitted changes. Please commit or stash them first."
  exit 1
fi

git checkout main

# 2. Merge each agent branch into main
for agent in "${AGENTS[@]}"; do
  branch="agent/${agent}-dev"

  if git rev-parse --verify "$branch" >/dev/null 2>&1; then
    echo "--> Merging $branch into main..."
    git merge "$branch" --no-edit -m "chore(sync): auto-merge $branch into main" || {
      echo "Conflict detected during merge of $branch! Resolve conflicts in main, then re-run script."
      exit 1
    }
  fi
done

# 3. Sync updated main back into each worktree branch
for agent in "${AGENTS[@]}"; do
  wt_path="$WORKTREES_DIR/$agent"
  branch="agent/${agent}-dev"

  if [[ -d "$wt_path" ]]; then
    echo "--> Syncing main into $agent worktree..."
    cd "$wt_path"

    # Clean up any untracked conflicting documentation files that would block merge
    CONFLICT_FILES=("MIMO.md" "HERMES.md" "ANIGRAVITY.md" "CLAUDE.md")
    for file in "${CONFLICT_FILES[@]}"; do
      if [[ -f "$file" && -z $(git ls-files --error-unmatch "$file" 2>/dev/null) ]]; then
        echo "Removing untracked conflicting file: $file"
        rm "$file"
      fi
    done

    # Check if worktree has uncommitted work
    if [[ -n $(git status --porcelain) ]]; then
      echo "Warning: Worktree $agent has uncommitted changes. Stashing before sync..."
      git stash push --include-untracked -m "pre-sync stash for $agent"
      git merge main --no-edit -m "chore(sync): update $branch with main"
      git stash pop || true
    else
      git merge main --no-edit -m "chore(sync): update $branch with main"
    fi
  fi
done

cd "$PROJECT_ROOT"
echo "=== Sync Complete! All worktrees updated with main. ==="