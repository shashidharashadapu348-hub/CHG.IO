
# Academic Calendar Analyzer

A web app where users upload an academic calendar and get an AI-extracted summary of all holidays, breaks, and non-instructional days — displayed visually and exportable.

## Page 1: Landing / Upload Page
- Clean hero section with academic-inspired styling (navy blues, serif accents, university feel)
- Brief explanation of what the tool does with a sample output preview
- Three input options as tabs:
  - **Upload PDF** — drag-and-drop zone or file picker for .pdf files
  - **Upload Image** — drag-and-drop zone or file picker for .jpg, .png, .webp
  - **Paste Text** — textarea for directly pasting calendar text
- Big "Analyze Calendar" call-to-action button

## Page 2: Loading / Processing State
- Animated progress indicator while parsing and analyzing
- Friendly rotating messages ("Reading your calendar...", "Identifying holidays...", "Building your summary...")

## Page 3: Results Page
- **Summary Header** — Detected semester name, date range, total holiday count, and quick stats
- **Visual Calendar** — Monthly calendar grid with holidays highlighted and color-coded by type (Federal Holiday, Break, University Closure, etc.)
- **Holiday Table** — Sortable table with columns: Date(s), Name, Description, Type
- **Export Options:**
  - Download as .ics file (Google Calendar, Outlook, Apple Calendar)
  - Download as .csv file (spreadsheet-friendly)
- "Analyze Another" button to start over

## Backend (Lovable Cloud)
- **File processing edge function** — Receives uploaded PDF/image files, extracts text content
- **AI analysis edge function** — Uses Lovable AI (Gemini) to process calendar text with a server-side prompt, returning structured JSON with all holidays, breaks, and non-instructional days
- Stateless — no database, no auth required

## Design Direction
- Academic/institutional aesthetic: navy blues, warm gold accents, clean serif + sans-serif typography
- Color-coded holiday types consistently across calendar and table views
- Fully responsive for desktop and mobile
- No login required — one-time use tool
