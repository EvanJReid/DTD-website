# Full feature test checklist

Run automated tests (no backend required): **`npm test`**

When your **Oracle backend is running** on `http://localhost:8080/ords/api`, use this checklist to verify all features.

---

## Home (`/`)

- [ ] **Header** – Logo, Browse / Courses / Analytics nav, Upload and Collection buttons work
- [ ] **Hero** – Search bar and quick filter chips (e.g. CS2000) update search
- [ ] **Stats** – Documents, Professors, Courses, Downloads counts load from backend
- [ ] **Documents tab** – List shows only root-level documents (no folderId); search filters by title/course/professor
- [ ] **Collections tab** – List of folders; badge shows count; click opens folder view
- [ ] **Upload** – Open modal, fill title/course/professor, attach file (PDF/Excel/Python/Java/PPT), submit; new doc appears in list
- [ ] **Create collection** – Open modal, add name/description/course/professor, add files, submit; new folder appears in Collections

## Document card & preview

- [ ] **Card** – Click opens preview modal
- [ ] **Preview** – Shows details, comments section, Download button
- [ ] **Comments** – Add comment (author + content), submit; delete comment
- [ ] **Download** – Click Download calls track download and closes modal

## Courses (`/courses`)

- [ ] **Stats** – Total courses, documents, professors from analytics
- [ ] **Search** – Filter by course code or professor
- [ ] **Course list** – Cards show course code, doc count, professor count; click goes to home with search pre-filled

## Dashboard (`/dashboard`)

- [ ] **Time range** – Week / Month / Year switches update all charts
- [ ] **Stat cards** – Total documents, downloads, unique professors, courses covered
- [ ] **Uploads over time** – Area chart (or empty state)
- [ ] **Downloads** – Bar chart (or empty state)
- [ ] **Top courses** – Bar list by document count
- [ ] **Document types** – Pie chart + legend
- [ ] **Top instructors** – List with professor, course, doc count
- [ ] **Recent activity** – List of uploads/downloads with time

## Folder view (`/folder/:folderId`)

- [ ] **Header** – Back to Documents, folder name, description, course, professor, doc count, created date
- [ ] **Documents** – Grid of documents in folder; card click opens preview; Download tracks and refreshes
- [ ] **Not found** – Invalid `folderId` shows “Collection Not Found” and Back button

## 404

- [ ] **Unknown route** – Shows “404” and “Page not found” with link to home

---

## API coverage (Oracle)

| Feature           | Endpoint(s) / method        |
|------------------|-----------------------------|
| List documents   | `GET /documents`            |
| Add document     | `POST /documents`           |
| Increment download | `POST /downloads`, `PUT /documents/:id/increment-download` |
| List folders     | `GET /folders`              |
| Get folder       | `GET /folders/:id`          |
| Create folder    | `POST /folders`             |
| Delete folder    | `DELETE /folders/:id`       |
| Folder documents | `GET /folders/:id/documents`, `POST /folders/:id/documents` |
| Comments         | `GET /comments?document_id=`, `POST /comments`, `DELETE /comments/:id` |
| Analytics        | `GET /analytics?time_range=` |
| Download events  | `GET /downloads`            |

All of the above are exercised by the UI when the backend is available.
