# PlastiVista Waitlist Google Sheets Setup

This site is designed for GitHub Pages static hosting, so the production waitlist flow is:

`GitHub Pages form -> Google Apps Script web app -> Google Sheet`

That keeps private Google credentials out of the frontend while still saving real business interest into a spreadsheet.

## Sheet Columns

Create a Google Sheet named `PlastiVista Waitlist Leads` with a tab named `Waitlist`.

Use this exact header row:

```csv
timestamp,name,email,company_or_organization,role_or_title,interest_type,message_or_notes,source_page,campaign,submission_id
```

## Apps Script Setup

1. Open the Google Sheet.
2. Go to `Extensions -> Apps Script`.
3. Replace the starter code with the contents of `google-apps-script/waitlist.gs`.
4. Click `Save`.
5. Click `Deploy -> New deployment`.
6. Choose `Web app`.
7. Set `Execute as` to `Me`.
8. Set `Who has access` to `Anyone`.
9. Deploy and approve permissions.
10. Copy the Web app URL. It should end with `/exec`.

## Local Build Setup

Create or update `.env.local`:

```env
NEXT_PUBLIC_WAITLIST_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Then run:

```powershell
npm run dev
```

Open `http://localhost:3000/waitlist`, submit a test record, and confirm it appears in the Sheet.

## GitHub Pages Build Setup

Before building the static export, set the same endpoint in PowerShell:

```powershell
$env:NEXT_PUBLIC_WAITLIST_ENDPOINT="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
npm run github-pages:build
```

Upload the contents of `github-pages-out` to the GitHub Pages publishing branch or folder.

## Fallback Behavior

- If the site is running in Mac presentation mode, entries save locally and can be exported as CSV.
- If the GitHub Pages build does not include `NEXT_PUBLIC_WAITLIST_ENDPOINT`, the live site will not expose credentials and will fall back to local CSV capture instead of crashing.
- If Apps Script is configured, live submissions are sent to the Sheet in spreadsheet-friendly rows.

## Exporting Leads Later

Open the Google Sheet and use `File -> Download -> Comma Separated Values (.csv)` or `File -> Download -> Microsoft Excel (.xlsx)`.
