# NearDrop — Git repository root

All product code, CI workflow definitions, and ignore rules live under **`project_scaffolding/`**.

```bash
cd project_scaffolding
npm install
cp .env.example .env   # if needed
npm run build
```

**Why symlinks at this level?** Git and **GitHub Actions** expect `.github/` and `.gitignore` at the **repository root**. This folder therefore contains:

- **`.github`** → `project_scaffolding/.github` (workflows are maintained inside `project_scaffolding`)
- **`.gitignore`** → `project_scaffolding/.gitignore`

Edit workflows and ignore rules in **`project_scaffolding/.github`** and **`project_scaffolding/.gitignore`** only.

Full documentation: [project_scaffolding/README.md](project_scaffolding/README.md)
