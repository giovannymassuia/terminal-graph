# Publishing to npm

## Pre-publish Checklist

1. **Update package.json**
   - [ ] Set your npm username in the `author` field
   - [ ] Update repository URLs to your GitHub repo
   - [ ] Bump version number if needed

2. **Test locally**
   ```bash
   npm link
   terminal-graph demo
   terminal-graph monitor --simulate
   terminal-graph view --style lean --accumulate
   tgraph-monitor node examples/test-pnpm-style.js
   ```

3. **Create npm account** (if you don't have one)
   ```bash
   npm adduser
   ```

## Publishing Steps

1. **Login to npm**
   ```bash
   npm login
   ```

2. **Publish the package**
   ```bash
   npm publish
   ```

   For scoped package (e.g., @yourname/terminal-graph):
   ```bash
   npm publish --access public
   ```

3. **Test with npx**
   ```bash
   npx terminal-graph demo
   ```

## After Publishing

Users can now install and use your package:

```bash
# Global install
npm install -g terminal-graph

# Use with npx (no install)
npx terminal-graph demo

# Use with pnpm
pnpx terminal-graph demo

# Use with yarn
yarn global add terminal-graph
```

## Version Updates

When making changes:

1. Update code
2. Bump version: `npm version patch` (or minor/major)
3. Publish: `npm publish`

## Package Name Alternatives

If `terminal-graph` is taken, consider:
- `@yourname/terminal-graph` (scoped)
- `terminal-ascii-graph`
- `cli-graph-monitor`
- `console-line-graph`
- `term-graph-viz`