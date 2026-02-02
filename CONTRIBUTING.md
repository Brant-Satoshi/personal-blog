# Contributing

Thanks for contributing. This project values clarity, stability, and maintainability over cleverness. Please read and follow the guidelines below.

## Scope

- Keep changes focused; ship the smallest change that solves the problem.
- Prefer incremental improvements to large rewrites.
- Avoid introducing new dependencies unless there is a clear, documented need.

## Workflow

1) Create a branch from `main`.
2) Make a focused change with tests or verification steps when applicable.
3) Run checks locally before opening a PR.
4) Open a PR with a clear description and rationale.

## Development

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Code Style

- Follow existing patterns in the codebase.
- Keep modules small and single-purpose.
- Prefer explicitness over implicit behavior.
- Use TypeScript types to document contracts and prevent bugs.
- Avoid over-abstracting; optimize for readability.

## Tests and Verification

- Add or update tests when behavior changes.
- If no automated tests exist for the change, document manual verification steps in the PR.
- Avoid merging changes that have not been verified.

## Documentation

- Update relevant docs when behavior, config, or workflows change.
- Prefer short, task-focused documentation.
- Keep examples minimal and correct.

## Commits

- Write clear, imperative commit messages.
- Keep commits logically grouped; avoid unrelated changes in the same commit.

## Pull Requests

Include the following in the PR description:

- What changed and why.
- How to verify the change.
- Any tradeoffs or risks.

## Security and Reliability

- Do not include secrets in code, config, or commits.
- Treat user-facing content as untrusted input.
- Prefer safe defaults and explicit error handling.

## Questions

If you are unsure about a direction or tradeoff, open an issue or ask in the PR early.
