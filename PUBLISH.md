# 🚀 Publishing to npm - Automated Workflow

This project uses **automated publishing** with GitHub Actions and semantic versioning. No manual npm commands needed!

## 📋 Setup Checklist (One-time setup)

### 1. GitHub Repository Setup
- [x] Repository created at `https://github.com/giovannymassuia/terminal-graph`
- [x] Package.json updated with correct repository URLs
- [x] GitHub Actions workflow configured

### 2. npm Account Setup
1. **Create npm account**: https://www.npmjs.com/signup
2. **Create npm automation token** (bypasses 2FA):
   - Go to https://www.npmjs.com/settings/tokens
   - Click "Generate New Token" → "Granular Access Token"
   - **OR** use CLI:
   ```bash
   npm login
   npm token create --type=automation --access=public --publish
   ```
3. **Add token to GitHub Secrets**:
   - Go to `https://github.com/giovannymassuia/terminal-graph/settings/secrets/actions`
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm **automation** access token

### 3. Install Development Dependencies
```bash
npm install
```

## 🔄 Automated Publishing Workflow

### How It Works
1. **Commit with conventional format** → Triggers analysis
2. **Push to main/master** → Runs tests and creates release
3. **Semantic-release analyzes commits** → Determines version bump
4. **Automatically publishes** → Updates npm, GitHub releases, and changelog

### Commit Message Format (Conventional Commits)
Use the commitizen helper for perfect formatting:

```bash
# Install and commit using commitizen
npm run commit

# Or manually follow this format:
# <type>(<scope>): <description>
#
# Examples:
feat: add new graph style 'gradient'
fix: resolve X-axis timestamp alignment issue  
docs: update installation instructions
perf: optimize graph rendering performance
```

### Release Types
| Commit Type | Version Bump | Release |
|-------------|--------------|---------|
| `feat:` | Minor (1.0.0 → 1.1.0) | ✅ |
| `fix:` | Patch (1.0.0 → 1.0.1) | ✅ |
| `docs:` | Patch (1.0.0 → 1.0.1) | ✅ |
| `perf:` | Patch (1.0.0 → 1.0.1) | ✅ |
| `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | ✅ |
| `chore:`, `test:` | Patch (1.0.0 → 1.0.1) | ✅ |

## 🎯 Publishing Steps

### Normal Development Flow
```bash
# 1. Make your changes
git add .

# 2. Commit using conventional format (recommended)
npm run commit

# 3. Push to main/master
git push origin main

# 4. 🎉 Automatic publishing happens!
# - Tests run
# - Version is bumped based on commits
# - Package published to npm
# - GitHub release created with changelog
# - CHANGELOG.md updated
```

### Emergency Manual Release
If automation fails, you can still publish manually:
```bash
# Only use if GitHub Actions fails
npm version patch  # or minor/major
npm publish
git push --follow-tags
```

## 📊 Monitoring Releases

### GitHub Actions
- View workflow status: `https://github.com/giovannymassuia/terminal-graph/actions`
- Check logs for any publishing issues

### npm Package
- Package page: `https://www.npmjs.com/package/terminal-graph`
- Download stats and version history

### GitHub Releases
- Releases page: `https://github.com/giovannymassuia/terminal-graph/releases`
- Automatically generated changelogs

## 🧪 Testing Before Publishing

The workflow runs these tests automatically:

```bash
# Local testing (same as CI)
npm test
npm run test:cli
npm run test:functionality

# Test CLI commands
terminal-graph demo
terminal-graph --version
tgraph-monitor node --version
```

## 📝 Changelog

The `CHANGELOG.md` is automatically generated from commit messages. It includes:
- 🚀 Features
- 🐛 Bug Fixes  
- 📚 Documentation
- ⚡ Performance Improvements
- 🔧 Maintenance

## 🚨 Troubleshooting

### Publishing Fails
1. **Check npm token**: Ensure `NPM_TOKEN` secret is valid
2. **Package name conflict**: npm might require scoped package `@yourname/terminal-graph`
3. **Test failures**: Fix failing tests before merge

### No Release Created
1. **No conventional commits**: Ensure commits follow `feat:`, `fix:` format
2. **Wrong branch**: Publishing only works on `main`/`master`
3. **CI skip**: Commits with `[skip ci]` won't trigger release

### Version Not Bumped
1. **Check commit messages**: Use `npm run commit` for proper format
2. **Force release**: Add `feat: force release` commit

## 📦 After First Publication

Once published, users can install with:

```bash
# Global install
npm install -g terminal-graph

# Use with npx (no install needed)
npx terminal-graph demo

# Use with pnpm
pnpx terminal-graph demo

# Local project dependency
npm install terminal-graph
```

## 🔄 Package Name Alternatives

If `terminal-graph` is taken on npm:
- `@giovannymassuia/terminal-graph` (scoped)
- `terminal-ascii-graph`
- `cli-graph-monitor` 
- `console-line-graph`
- `term-graph-viz`

Update `package.json` name field and try again.

---

**Ready to publish?** Just commit with conventional format and push to main! 🚀