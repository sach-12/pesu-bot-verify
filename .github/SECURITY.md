# Security Policy

## Supported Versions

We actively maintain security patches for the current stable version of the Auth Link Portal. Please use the latest release to ensure you have the latest security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in Auth Link Portal, please follow these guidelines to report it responsibly:

- **Do NOT open a public issue** to report security problems.
- Instead, send a confidential message to the maintainers via the PESU Developer Group channel (`#pesu-dev`) on [PESU Discord](https://discord.gg/eZ3uFs2), or email the maintainers directly.
- Include as much detail as possible:
  - Steps to reproduce the issue
  - Impact of the vulnerability
  - Any suggested mitigations or fixes

We will acknowledge your report within 48 hours and keep you updated on the progress.

## Important Disclaimer

Auth Link Portal acts as a secure gateway for authenticating PESU students via Discord OAuth and linking their Discord and PESU accounts.

- We **do not control or take responsibility** for any third-party applications or services that use this portal.
- Users and developers should exercise caution when using or integrating with applications built on top of this portal.
- Always verify the trustworthiness and security practices of any client application using Auth Link Portal.

## Security Best Practices for Users

- Always use HTTPS to access the portal.
- Never share your Discord or PESU credentials.
- Keep your browser and dependencies up to date.
- Use strong passwords and enable two-factor authentication on Discord and PESU accounts.

## Security Best Practices for Developers

- Do not log or store sensitive information (e.g., passwords, tokens).
- Use environment variables for secrets and never commit them to version control.
- Regularly update dependencies to patch known vulnerabilities.
- Follow the [Contribution Guide](CONTRIBUTING.md) and review code for security issues before submitting pull requests.

## Third-Party Dependencies

Auth Link Portal uses several open-source dependencies. We regularly monitor and update dependencies to patch known vulnerabilities.

## Disclaimer

While we strive to maintain high security standards, no software is entirely free from vulnerabilities. Use this software at your own risk.

Thank you for helping us keep Auth Link Portal secure !
