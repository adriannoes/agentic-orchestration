---
name: Skill Creator
description: Create new Cursor Skills following the standard directory structure.
disable-model-invocation: false
---

# Skill Creator

Use this skill to create new skills for the ASAP Protocol agents.

## Usage

To create a new skill, run the initialization script:

```bash
python3 .cursor/skills/skill-creator/scripts/init_skill.py <skill-name> [--with-scripts]
```

**Example:**

```bash
python3 .cursor/skills/skill-creator/scripts/init_skill.py my-new-feature
```

```bash
python3 .cursor/skills/skill-creator/scripts/init_skill.py my-new-feature --with-scripts
```

## What it does

1.  Creates `.cursor/skills/<skill-name>/`
2.  Generates `SKILL.md` template
3.  Optionally creates `scripts/` directory with a sample script when `--with-scripts` is used

## Standards

- **Naming**: Kebab-case (`my-skill-name`)
- **Structure**: Always use the directory structure.
- **Scripts**: Python scripts should use `uv` or standard lib.

## Project patterns

When creating or updating workflow skills for this repo, use the existing skills as a template baseline:

- `.cursor/skills/git-commits/SKILL.md` → commit and push workflow (Conventional Commits + pre-push validation).
- `.cursor/skills/code-quality-review/SKILL.md` → quality review workflow.
- `.cursor/skills/security-review/SKILL.md` → security audit workflow.

If you are creating a workflow governance skill (commit, PR, release, validation), start from the `git-commits` pattern and tailor scope to your needs.
