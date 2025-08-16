# Auth Link Portal

[![License](https://img.shields.io/github/license/pesu-dev/auth-link-portal)](https://github.com/pesu-dev/auth-link-portal/blob/main/LICENSE)
[![Contributors](https://img.shields.io/github/contributors/pesu-dev/auth-link-portal)](https://github.com/pesu-dev/auth-link-portal/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/pesu-dev/auth-link-portal)](https://github.com/pesu-dev/auth-link-portal/issues)
[![Project Board](https://img.shields.io/badge/project-board-blue)](https://github.com/orgs/pesu-dev/projects/4)

This is a website that handles verification of the students joining PESU Discord Server, by authenticating them using Discord OAuth thus providing access to the rest of the server. This project is currently, actively maintained and updated.

The application is built with security and privacy in mind, ensuring safe and effective community management while maintaining user confidentiality.

me
## Getting Started

### For Users

This is currently active in the [PESU Discord Server](https://discord.gg/eZ3uFs2). You can click on [this link](https://pesudiscord.netlify.app/link) to get verified.

Using this, will redirect you to a site where you can login via Discord and then you will be authenticated

### For Developers and Contributors

1. For current work, make sure to refer the [Project Board](https://github.com/orgs/pesu-dev/projects/4) to track ongoing work, issues and feature requests.
2. Read the [contribution guidelines](.github/CONTRIBUTING.md) to understand our standards & workflow before submitting changes.
3. In order to contribute:
   - Make changes in a new branch.
   - Open a pull request with a clear description.
   - Reference related issues or discussions.

For detailed development setup and contribution instructions, see our [Contribution Guide](.github/CONTRIBUTING.md).

## Architecture and setup


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Project Structure

```
auth-link-portal/
├── .env.example        # Environment variables template
├── .gitignore          # Files/folders to ignore in git
├── package.json        # Project dependencies and scripts
├── README.md           # Project documentation
├── next.config.mjs     # Next.js configuration
├── src/
│   ├── app/            # Next.js app directory (routing, pages, API)
│   │   ├── api/        # API routes (authentication, user, etc.)
│   │   ├── auth/       # Auth page (Discord OAuth flow)
│   │   ├── link/       # Link page (verification UI)
│   │   ├── login/      # Login page
│   │   ├── placements/ # Placement info page
│   │   ├── layout.js   # Root layout for all pages
│   │   ├── page.js     # Main landing page
│   │   ├── globals.css # Global styles
│   ├── assets/         # Static assets (SVGs, images)
│   ├── components/     # Reusable React components (e.g., navbar)
│   ├── utils/          # Utility functions and store setup
│   │   ├── config.js   # App configuration
│   │   ├── helpers.js  # Helper functions
│   │   └── store/      # State management (provider, stores)
│   ├── middleware.js   # Custom Next.js middleware
├── public/             # Public static files (served as-is)
├── .github/            # GitHub workflows, templates, and docs
│   ├── CONTRIBUTING.md # Contribution guidelines
│   ├── SECURITY.md     # Security policy
```

---

### Codebase Coverage

#### `src/app/` (Pages & API)

- **Pages**:
  - `page.js`: Main landing page (user state, login/dashboard UI)
  - `auth/page.js`: Discord OAuth callback and session setup
  - `login/page.js`: Initiates Discord OAuth login flow
  - `link/page.js`: UI and logic for linking Discord & PESU accounts
  - `placements/page.js`, `placements/[year]/page.js`: Placement info and redirects

- **API Routes**:
  - `api/user/route.js`, `api/token/route.js`, `api/logout/route.js`, `api/link/authenticate/route.js`, `api/link/complete/route.js`:
    Handle authentication, user info, linking, logout, and backend updates

- **Shared Layout & Styles**:
  - `layout.js`, `globals.css`: Root layout and global styles

#### `src/components/`

- **Reusable Components**:
  - `navbar.jsx`: Responsive navigation bar (shows options based on user state)

#### `src/utils/`

- **Utilities & State Management**:
  - `config.js`, `helpers.js`: App constants and helper functions
  - `store/` (`provider.js`, `stores.js`): Zustand-based state management

#### `src/middleware.js`

- **Middleware**:
  - Handles authentication, CORS, and JWT session verification for API routes



## Running locally

First, run the below command to install necessary dependencies -


```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the webpage running locally.



**👉 [Read our detailed Contributing Guide](.github/CONTRIBUTING.md)** for complete setup instructions and development workflow.

## 🔐 Security and Privacy

- **No Credential Storage**: The website does not store Discord or PESU passwords
- **Secure Database**: All data is stored securely in MongoDB with proper access controls
- **Role-based Access**: Commands are restricted based on user permissions and server roles

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

For questions, support, or feature requests, please visit our [project board](https://github.com/orgs/pesu-dev/projects/4) or join the discussion on the PESU Discord server.
