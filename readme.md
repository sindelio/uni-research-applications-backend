<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [BACKEND IN DEVELOPMENT](#backend-in-development)
  - [1. REQUISITES](#1-requisites)
  - [2. SETUP](#2-setup)
    - [2.1. ENABLE RESUME PARSING](#21-enable-resume-parsing)
    - [2.2. ENABLE SEARCH](#22-enable-search)
  - [3. STARTUP](#3-startup)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# BACKEND IN DEVELOPMENT

## 1. REQUISITES

- **Operating System - OS: Ubuntu 24 LTS.**
- Bun v1.x
- Node.js v20.x (to use pm2)
- Docker v27.x
- Docker Compose v2.x
- Stripe CLI v1.x
- Insomnia v2022.7.5
- Poppler utils (to use pdftotext)

These requirements are pretty simple to install on Ubuntu, hence we won't cover their installation in this document.
Make sure to have all the requisites before proceeding.
Beware, the following instructions may not work in a different OS.

## 2. SETUP

Clone the repository from GitHub:

```bash
git clone git@github.com:TalentSourcery/backend.git
```

From the root of the project, install the Bun modules:

```bash
bun install
```

Start the database:

```bash
docker compose up -d
```

Seed the initial admin to the database:

```bash
bun src/database/seeds/seed-first-admin.js
```

Seed the email and data source accounts to the database:

```bash
bun src/database/seeds/seed-accounts.js email
bun src/database/seeds/seed-accounts.js linkedin
```

These accounts are used to copy data from websites such as LinkedIn.
To scrape LinkedIn in development, we use only one account and you will need to authorize it in your browser. Do so by signing in to the LinkedIn account. You can find the account at `src/database/scripts/accounts/linkedin/dev.js`.

### 2.1. ENABLE RESUME PARSING

In order to enable the resume parsing functionality, install `pdftotext`, which is part of the OS package `poppler-utils`:

```bash
sudo apt install poppler-utils
pdftotext -v
```

### 2.2. ENABLE SEARCH

To enable the search functionality, ask Sindélio for the Application Default Credentials - ADC, used by Google Cloud - GC.
Copy the ADC file to `~/.config/gcloud`.

## 3. STARTUP

The Stripe CLI will be used to simulate payment events locally.
If it's the first time running Stripe, or it has been more than 90 days, you will need to authenticate:

```bash
stripe login
```

Press ENTER to open a browser tab, check the access code and allow access.
Now authenticated, start Stripe locally to listen for payments:

```bash

stripe listen --forward-to http://localhost:5000/v1/webhook/payment
```

Start the database, if not already running:

```bash
docker compose up -d
```

Start the HTTP server:

```bash
bun dev
```

Check a response from `http://localhost/v1/health` with Insomnia and voilà!
