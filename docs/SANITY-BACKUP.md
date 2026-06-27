# Sanity CMS — Backup Strategy

## Why Backups Matter

Sanity is the **single source of truth** for all content on the GGI website: events, articles, people profiles, Magnalia issues, library items, homepage content, and more. If this data were lost or corrupted, it would mean manually recreating everything.

While Sanity is a reliable hosted service with its own redundancy, having your own backups means:

- **Protection against accidental bulk deletions** (someone accidentally deletes a bunch of documents)
- **Protection against account/billing issues** (if the Sanity account lapses, you still have your data)
- **Ability to roll back** after a bad content migration or import
- **Peace of mind** — you own your data, not just rent access to it

---

## Built-In Protections (What Sanity Already Does)

Before worrying about manual backups, know that Sanity provides some protection out of the box:

1. **Document version history** — Every document in Sanity keeps a revision history. You can view and restore previous versions of any document directly in Sanity Studio. Click on a document → look for the "History" or revision timeline.

2. **Content Lake redundancy** — Sanity's Content Lake (their backend database) is hosted on redundant infrastructure. Your data is replicated across multiple servers.

3. **Soft delete** — When you delete a document in Sanity Studio, it goes through a confirmation step. There is no bulk-delete button in the UI.

**However:** None of this protects against account-level issues, and version history has retention limits on free/lower plans. That's why your own backups matter.

---

## Manual Export (Step by Step)

Sanity provides a built-in CLI command to export your entire dataset as a compressed file.

### Prerequisites

- You need **terminal access** on a machine with the project code
- Navigate to the **`sanity/`** subdirectory within the project (this is where the Sanity configuration lives)

### Steps

1. **Open Terminal** (on Mac: Applications → Utilities → Terminal, or search "Terminal" in Spotlight)

2. **Navigate to the Sanity directory:**
   ```bash
   cd /path/to/ggi-website/sanity
   ```

3. **Run the export command:**
   ```bash
   npx sanity dataset export production ./backups/production-$(date +%Y-%m-%d).tar.gz
   ```

   **What this does:**
   - `npx sanity` — runs the Sanity CLI tool
   - `dataset export` — tells it to export data
   - `production` — the name of our dataset (where all the live content is)
   - The last part — creates a compressed backup file with today's date in the filename

4. **You'll be prompted to log in** if you haven't recently — follow the browser login flow

5. **Wait for the export to complete.** For the GGI site, this should take under a minute. You'll see progress output in the terminal.

6. **Verify the backup exists:**
   ```bash
   ls -lh ./backups/
   ```
   You should see a file like `production-2026-05-08.tar.gz` with a reasonable file size.

### Where Backups Go

Backups are saved to the `sanity/backups/` directory. This directory is **excluded from Git** (via `.gitignore`) so backup files stay local and don't bloat the repository.

---

## Automated Backup Script

A backup script is included in the repository at **`scripts/backup-sanity.sh`**. It automates the export process and keeps only the 5 most recent backups to avoid filling up disk space.

### How to Use It

1. **Navigate to the project root:**
   ```bash
   cd /path/to/ggi-website
   ```

2. **Run the script:**
   ```bash
   bash scripts/backup-sanity.sh
   ```

3. **What it does:**
   - Creates the `sanity/backups/` directory if it doesn't exist
   - Exports the `production` dataset with a timestamped filename
   - Deletes any backups older than the 5 most recent
   - Prints a summary of what's in the backups folder

### Automated Monthly Backup

A cron job runs the backup automatically on the **1st of each month at 7 AM MST**. It exports the production dataset and keeps the last 5 backups. You don't need to do anything — just verify backups exist periodically by checking the `sanity/backups/` directory.

If you need to run a backup manually (e.g., before a major content migration), use the script above.

---

## Recommended Schedule

| When | Action |
|------|--------|
| **Monthly** | Run the backup script (or manual export). A calendar reminder is sufficient. |
| **Before any major content migration** | Always export first. If you're importing data, restructuring document types, or making bulk changes, back up before you start. |
| **Before upgrading Sanity** | If Evan upgrades the Sanity CLI or schema, export beforehand. |
| **Before switching hosting/DNS** | An extra backup before any infrastructure change never hurts. |

---

## Restore Process

If you need to restore from a backup, here's how. **⚠️ This should be done by Evan or someone comfortable with the terminal — restoring overwrites data.**

### Steps

1. **Navigate to the Sanity directory:**
   ```bash
   cd /path/to/ggi-website/sanity
   ```

2. **Check what backups are available:**
   ```bash
   ls -lh ./backups/
   ```

3. **Option A — Restore to a test dataset first (recommended):**

   Create a temporary dataset to verify the backup before overwriting production:
   ```bash
   npx sanity dataset create restore-test
   npx sanity dataset import ./backups/production-2026-05-08.tar.gz restore-test
   ```

   Then check the data in Sanity Studio by switching to the `restore-test` dataset. If it looks good, proceed to restore production.

   Clean up the test dataset afterward:
   ```bash
   npx sanity dataset delete restore-test
   ```

4. **Option B — Restore directly to production:**

   ```bash
   npx sanity dataset import ./backups/production-2026-05-08.tar.gz production --replace
   ```

   **⚠️ The `--replace` flag overwrites all existing data in the production dataset with the backup contents.** Only use this if you're sure.

5. **After restoring:** Trigger a site rebuild so the website reflects the restored content.

---

## Summary

- Sanity has built-in version history and redundancy — you're not unprotected by default
- Monthly manual backups add an extra safety net that you fully control
- Use the provided script (`scripts/backup-sanity.sh`) to make it easy
- Always back up before major changes
- Test restores on a separate dataset before touching production
- Backup files stay local (excluded from Git) — consider copying important backups to a USB drive or cloud storage for extra safety
