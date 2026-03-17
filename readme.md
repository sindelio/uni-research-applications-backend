TODO:
- Add images to emails
- FInish delete update routes for project
- Create project status logic

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
- Insomnia v2022.7.5

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

## 3. STARTUP

Start the database, if not already running:

```bash
docker compose up -d
```

Start the HTTP server:

```bash
bun dev
```

Check a response from `http://localhost/v1/health` with Insomnia and voilà!
