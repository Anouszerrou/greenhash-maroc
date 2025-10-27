# Maintenance Guide

This document explains how to run tests locally, audit and update dependencies safely, and handle future upgrades for the frontend portion of this repository.

## Test setup (frontend)

- Test runner: Vitest (configured to use `jsdom` environment)
- Utilities: @testing-library/react, @testing-library/jest-dom
- Tests live under `frontend/src/__tests__`, `frontend/src/tests` (including `frontend/src/tests/e2e`)

To run all frontend tests locally:

```powershell
cd "frontend"
npm ci
npm test
```

Notes:
- Vitest is configured via `frontend/vitest.setup.js` (setup imports for jest-dom/whatwg-fetch).
- Tests are designed to be offline-friendly by mocking blockchain providers (ethers and Solana) where needed.

## Dependency audit & safe update steps

1. Inspect vulnerabilities:

```powershell
cd "frontend"
npm audit
```

2. Apply non-breaking fixes automatically:

```powershell
npm audit fix
npm update
```

3. For remaining vulnerabilities that require major upgrades (breaking changes):

- Create a new branch (e.g. `chore/upgrade-vite`) and update the relevant packages (e.g. `vite`, `esbuild`) in `package.json`.
- Run `npm ci` and the full test suite. Fix any breaking changes or adjust configs.
- Make smaller incremental changes where possible (update major versions one at a time if multiple packages need upgrades).

4. If you must use `npm audit fix --force` note that this will upgrade packages across major versions and can break the build. Always run tests and prefer doing this in a feature branch with CI enabled.

## CI

- A GitHub Actions workflow was added at `.github/workflows/ci.yml` that runs on `push` and `pull_request` to `main` and `feature/**` branches. It performs `npm ci` and `npm test` in the `frontend` folder.

## Recommendations for future upgrades

- Keep tests fast and hermetic: mock external RPCs and wallets for unit/E2E tests.
- When upgrading major tooling (Vite, Node, esbuild):
  - Do it in a dedicated branch and run the entire test suite.
  - Update config files (`vite.config.js`, test setup) and check for breaking plugin changes.
  - If upgrading Node, consult `actions/setup-node` in the CI workflow and align versions.

- Consider adding a CI gate that fails PRs with high-severity vulnerabilities (optional).

## Troubleshooting

- If tests fail after dependency updates, check the transformed code errors. Vite can fail to resolve certain imports during transform time; converting static imports to dynamic imports (as done for the Solana provider) mitigates some transform-time mock issues.
- If the CI runner times out or fails on installing packages, check Node version compatibility and increase job timeout in workflow if needed.

## Contacts

For questions about the frontend or test setup, please contact the repository maintainers.
