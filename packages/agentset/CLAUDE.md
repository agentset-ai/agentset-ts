# CLAUDE.md - Development Guide for agentset

## Build Commands
- `pnpm build` - Build the package
- `pnpm dev` - Watch mode for development
- `pnpm lint` - Run ESLint on source files
- `pnpm clean` - Clean build artifacts and node_modules

## Code Style Guidelines
- **TypeScript**: Use strict typing (follows @agentset/tsconfig)
- **Formatting**: Prettier (follows @agentset/prettier-config)
- **ESLint**: Follow @agentset/eslint-config rules
- **Imports**: Use named imports, group and sort alphabetically
- **Naming**: 
  - camelCase for variables/functions
  - PascalCase for classes/interfaces/types
  - UPPER_CASE for constants
- **Error Handling**: Use typed errors, avoid generic catch blocks
- **File Structure**: One component per file, follow domain-driven organization

## Package Structure
- TypeScript source in `src/` directory
- Build outputs to `dist/` in ESM and CJS formats
- Types generated with build (dts: true)