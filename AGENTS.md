# GTBS Repository Working Agreement

These instructions apply to the entire repository.

## Documentation is part of every change

Any feature, fix, refactor, dependency, configuration, security, or architectural change is incomplete until the relevant files in `docs/` are updated in the same change.

Always update:

1. `docs/PROGRESS.md` with the date, status, affected areas, validation performed, and remaining work.
2. Every affected topic document:
   - `PROJECT_OVERVIEW.md` for scope, routes, features, setup, dependencies, or limitations.
   - `ARCHITECTURE.md` for data flow, boundaries, APIs, persistence, or decisions.
   - `RULES.md` for workflow or product rules.
   - `CODE_STANDARDS.md` for implementation conventions or tooling.
   - `SECURITY.md` for auth, cookies, secrets, validation, dependencies, or risk.
   - `TROUBLESHOOTING.md` whenever an error is discovered or solved.

## Documentation quality

- Document implemented behavior, not intended behavior.
- Label mock, placeholder, incomplete, and planned functionality.
- Include exact verification commands and outcomes in `PROGRESS.md`.
- Never put passwords, session secrets, API keys, tokens, personal data, or real `.env` values in Markdown.
- Record recurring errors with symptoms, cause, solution, and prevention.
- Keep links and file paths current.
- Use ISO dates (`YYYY-MM-DD`).

## Definition of done

A development task is done only when code, appropriate verification, and documentation updates are complete. If a check is blocked by existing debt or the environment, record that fact instead of claiming full validation.
