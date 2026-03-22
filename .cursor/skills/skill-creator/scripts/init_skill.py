#!/usr/bin/env python3
import sys
import os
from pathlib import Path
import re

SKILL_TEMPLATE = """---
name: {title}
description: Description of what this skill does.
disable-model-invocation: false
---

# {title}

## Purpose
Describe the purpose of this skill and when the agent should use it.

## Trigger
Describe the user intents that should activate this skill.

## Usage
Describe how to use this skill.

## Quick checklist
- [ ] Step 1
- [ ] Step 2

## Output format
Use concise, actionable outputs with explicit next steps.
"""

def init_skill(skill_name):
    # Validate name
    if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", skill_name):
        print("Error: Skill name must be kebab-case (lowercase, no spaces).")
        sys.exit(1)

    # Determine paths.
    base_dir = Path(__file__).resolve().parent.parent.parent
    target_dir = base_dir / skill_name

    create_scripts = len(sys.argv) > 2 and sys.argv[2] == "--with-scripts"
    
    if target_dir.exists():
        print(f"Error: Skill '{skill_name}' already exists at {target_dir}")
        sys.exit(1)

    # Create directories.
    target_dir.mkdir(parents=True)
    if create_scripts:
        (target_dir / "scripts").mkdir()

    # Create SKILL.md
    title = skill_name.replace("-", " ").title()
    skill_md = target_dir / "SKILL.md"
    skill_md.write_text(SKILL_TEMPLATE.format(title=title))

    # Create placeholder script for optional automation when requested.
    if create_scripts:
        script_file = target_dir / "scripts" / "example.py"
        script_file.write_text(
            "#!/usr/bin/env python3\n# Replace with utility scripts used by this skill.\nprint(\"Hello from " + skill_name + "\")\n"
        )
        script_file.chmod(0o755)

    print(f"✅ Skill '{skill_name}' created successfully!")
    print(f"   Location: {target_dir}")
    print(f"   Action: Edit {skill_md} to define your skill.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: init_skill.py <skill-name> [--with-scripts]")
        sys.exit(1)
    
    init_skill(sys.argv[1])
