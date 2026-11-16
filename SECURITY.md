# Security Policy

## Supported versions

RuntimeEnglish is under active development. Security fixes are generally applied to the latest code on the default branch (`main`) and to current deployed/released versions when applicable.

| Version / Branch       | Supported   |
| ---------------------- | ----------- |
| `main` (latest)        | Yes         |
| Older commits/releases | Best effort |

## Reporting a vulnerability

If you discover a security vulnerability, please report it responsibly and **do not open a public issue**.

### Preferred reporting method

- Use **GitHub Private Vulnerability Reporting / Security Advisories** for this repository (if enabled):
  - Go to the repository's **Security** tab and choose **Report a vulnerability**.

### If private reporting is not available

- Contact the repository maintainer/owner directly through a private channel (for example, via GitHub profile contact options) with the details below.
- If you are unsure how to reach the maintainer privately, open a minimal issue requesting a secure contact method **without disclosing vulnerability details**.

## What to include in your report

Please provide as much detail as possible to help reproduce and fix the issue:

- A clear description of the vulnerability and potential impact
- Affected component(s), route(s), file(s), or feature(s)
- Steps to reproduce (proof of concept if available)
- Environment details (browser/device/OS/app version, web vs Android, etc.)
- Any suggested mitigation or fix ideas (optional)

## Scope notes (project-specific)

Examples of security-relevant areas in this project may include:

- Authentication/session handling and Supabase integration
- Progress sync and certificate issuance/verification flows
- Edge functions and database policies/migrations (`supabase/`)
- Client-side data handling (local storage, import/export)
- PWA/service worker behavior and caching
- Android/Capacitor bridge behavior and deep links

## Disclosure process

After receiving a report, maintainers will aim to:

1. **Acknowledge** receipt of the report
2. **Assess** severity and impact
3. **Reproduce and validate** the issue
4. **Develop and test** a fix or mitigation
5. **Coordinate disclosure** and release/deploy the fix when appropriate

Timelines may vary depending on severity, complexity, and maintainer availability.

## Safe harbor

We support good-faith security research and responsible disclosure. Please:

- Avoid privacy violations, data destruction, and service disruption
- Only test against systems/data you own or have explicit permission to test
- Give maintainers a reasonable opportunity to investigate and remediate before public disclosure
