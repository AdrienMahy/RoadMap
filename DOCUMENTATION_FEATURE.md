# Documentation Feature - Implementation Plan

## 📋 Vision

Ajouter une fonctionnalité de **Documentation** pour Projects et Modules permettant:
- Créer plusieurs documents par Project/Module (Présentation, Changelog, Description d'outil, custom)
- Rich text editor (type Linear/Notion) avec images
- Upload de fichiers images
- **BOARD:** Lecture seule (vue rendue)
- **DEV/Admin:** Création, édition, suppression

---

## 🏗️ Architecture

### Database Schema

```sql
-- Types de documentation prédéfinis avec templates
CREATE TABLE doc_types (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE,
  label VARCHAR(100),
  description TEXT,
  template TEXT
);

-- Documentation (Project ou Module)
CREATE TABLE documentation (
  id SERIAL PRIMARY KEY,
  projectId INT REFERENCES projects(id) ON DELETE CASCADE,
  moduleId INT REFERENCES modules(id) ON DELETE CASCADE,
  typeId INT REFERENCES doc_types(id),
  title VARCHAR(255),
  content TEXT, -- Rich HTML from Tiptap
  createdBy INT REFERENCES users(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_project_or_module CHECK (
    (projectId IS NOT NULL AND moduleId IS NULL) OR 
    (projectId IS NULL AND moduleId IS NOT NULL)
  )
);

-- Assets (images/fichiers)
CREATE TABLE documentation_assets (
  id SERIAL PRIMARY KEY,
  docId INT REFERENCES documentation(id) ON DELETE CASCADE,
  fileName VARCHAR(255),
  fileSize INT,
  fileType VARCHAR(50),
  urlPath VARCHAR(500), -- /uploads/docs/{projectId|moduleId}/{docId}/image.png
  uploadedAt TIMESTAMP DEFAULT NOW()
);
```

### Backend Routes

```
# Projects Documentation
GET    /api/projects/:projectId/documentation        -- List all docs
POST   /api/projects/:projectId/documentation        -- Create doc
PUT    /api/projects/:projectId/documentation/:docId -- Update doc
DELETE /api/projects/:projectId/documentation/:docId -- Delete doc

# Modules Documentation
GET    /api/modules/:moduleId/documentation
POST   /api/modules/:moduleId/documentation
PUT    /api/modules/:moduleId/documentation/:docId
DELETE /api/modules/:moduleId/documentation/:docId

# Doc Types (templates)
GET    /api/documentation/types                      -- List templates

# Assets
POST   /api/documentation/:docId/assets              -- Upload image
DELETE /api/documentation/assets/:assetId            -- Delete image
```

### Frontend Components

```
src/components/Documentation/
  ├── DocumentationTabs.tsx      -- Display doc list (tabs/cards)
  ├── DocumentationEditor.tsx    -- Tiptap editor for admin
  ├── DocumentationViewer.tsx    -- Read-only rendered view for board
  ├── DocumentationForm.tsx      -- Modal to create/select type
  └── DocumentationUploader.tsx  -- Image upload handler

src/lib/
  └── documentation.ts           -- API calls
```

### UI Flow

```
ProjectDetail / ModuleDetail
├── Tab: Timeline
├── Tab: Documentation ← NEW
│   ├── Doc List
│   │   - "Présentation"
│   │   - "Changelog"
│   │   - "Description d'outil"
│   │   - "+ Ajouter"
│   │
│   ├── (Admin) Click → Edit Mode
│   │   ├── Title
│   │   ├── Tiptap Editor (BOLD, ITALIC, H1-H3, LIST, LINK, IMAGE)
│   │   ├── Save / Cancel / Delete
│   │
│   └── (Board) Click → Read-only View
│       └── Rendered HTML
```

### Predefined Doc Types (Templates)

```typescript
const docTypes = [
  {
    id: 1,
    slug: "presentation",
    label: "Présentation",
    description: "Vue générale du projet/module",
    template: "<h2>Vue d'ensemble</h2><p>Décrivez l'objectif principal...</p>"
  },
  {
    id: 2,
    slug: "changelog",
    label: "Changelog",
    description: "Historique des mises à jour",
    template: "<h2>Dernières mises à jour</h2><ul><li>Version X.X</li></ul>"
  },
  {
    id: 3,
    slug: "tool_description",
    label: "Description d'outil",
    description: "Documentation technique",
    template: "<h2>Outils & Technos</h2><p>Listez les ressources...</p>"
  }
];
```

---

## 🚀 Implementation Steps

### Phase 1: Database & Backend Infrastructure

#### Step 1.1: Database Migration
- [ ] Create Drizzle migration file
  - File: `backend/src/db/migrations/XXXX_add_documentation.sql`
  - Create `doc_types` table
  - Create `documentation` table
  - Create `documentation_assets` table
  - Create indexes on `projectId`, `moduleId`, `docId`

#### Step 1.2: Update Schema (Drizzle)
- [ ] Update `backend/src/db/schema.ts`
  - Add `docTypes`, `documentation`, `documentationAssets` schemas
  - Add relations between tables

#### Step 1.3: Seed Initial Doc Types
- [ ] Update `backend/src/scripts/seed.ts`
  - Insert predefined doc_types with templates

---

### Phase 2: Backend Services & Routes

#### Step 2.1: Documentation Service
- [ ] Create `backend/src/services/documentation.service.ts`
  - `getProjectDocs(projectId)`
  - `getModuleDocs(moduleId)`
  - `createDoc(projectId|moduleId, typeId, content, createdBy)`
  - `updateDoc(docId, content)`
  - `deleteDoc(docId)`
  - `getDocTypes()`

#### Step 2.2: Assets (Upload) Service
- [ ] Create `backend/src/services/assets.service.ts`
  - `uploadImage(docId, file, parentType: 'project'|'module', parentId)`
  - `deleteAsset(assetId)`
  - Create `/uploads/docs/` directory structure
  - File validation (images only, max 5MB)
  - Generate unique file names

#### Step 2.3: Documentation Routes
- [ ] Create `backend/src/routes/documentation.ts`
  - GET `/api/projects/:projectId/documentation`
  - POST `/api/projects/:projectId/documentation`
  - PUT `/api/projects/:projectId/documentation/:docId`
  - DELETE `/api/projects/:projectId/documentation/:docId`
  - Same for `/api/modules/:moduleId/documentation`
  - GET `/api/documentation/types`
  - POST `/api/documentation/:docId/assets` (upload)
  - DELETE `/api/documentation/assets/:assetId`

#### Step 2.4: Integrate Routes
- [ ] Update `backend/src/index.ts`
  - Import and register documentation routes
  - Setup upload middleware (multer or similar)

#### Step 2.5: Middleware
- [ ] Auth middleware already in place
  - Verify user is admin for POST/PUT/DELETE
  - Allow all for GET (Board can read)

---

### Phase 3: Frontend Components & Integration

#### Step 3.1: Tiptap Setup
- [ ] Install packages
  ```bash
  npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
  ```

#### Step 3.2: Documentation Components
- [ ] Create `frontend/src/components/Documentation/DocumentationTabs.tsx`
  - Display list of docs (Présentation, Changelog, etc)
  - "Add new" button
  - Click to select doc

- [ ] Create `frontend/src/components/Documentation/DocumentationEditor.tsx`
  - Tiptap editor with toolbar
  - Toolbar: BOLD, ITALIC, H1, H2, H3, BULLET LIST, NUMBER LIST, LINK, IMAGE
  - Image upload button
  - Save / Cancel / Delete buttons

- [ ] Create `frontend/src/components/Documentation/DocumentationViewer.tsx`
  - Read-only rendered HTML
  - Images display correctly

- [ ] Create `frontend/src/components/Documentation/DocumentationForm.tsx`
  - Modal to create new doc
  - Select doc type (radio buttons with descriptions)
  - Auto-fill template content

- [ ] Create `frontend/src/components/Documentation/DocumentationUploader.tsx`
  - Handle image drag & drop
  - File validation
  - Show loading state

#### Step 3.3: API Library
- [ ] Create `frontend/src/lib/documentation.ts`
  ```typescript
  export const getDocTypes = () => {}
  export const getProjectDocs = (projectId: number) => {}
  export const getModuleDocs = (moduleId: number) => {}
  export const createDoc = (parentId, parentType, typeId, content) => {}
  export const updateDoc = (docId, content) => {}
  export const deleteDoc = (docId) => {}
  export const uploadAsset = (docId, file) => {}
  export const deleteAsset = (assetId) => {}
  ```

#### Step 3.4: Integrate into Pages
- [ ] Update `frontend/src/pages/BoardPage.tsx`
  - Add Documentation Tab to ProjectDetail / ModuleDetail
  - Show DocumentationTabs component

#### Step 3.5: Styling
- [ ] Style components with Tailwind CSS
  - Editor toolbar styling
  - Read-only view styling
  - Upload area styling

---

### Phase 4: Testing & Polish

#### Step 4.1: Functional Tests
- [ ] Test creating doc with template
- [ ] Test editing and saving
- [ ] Test image upload (drag & drop)
- [ ] Test delete doc
- [ ] Test admin-only access (board can't edit)
- [ ] Test rendering images in viewer

#### Step 4.2: Edge Cases
- [ ] Upload file size validation
- [ ] File type validation
- [ ] Missing projectId/moduleId handling
- [ ] Concurrent edits (last write wins)
- [ ] Delete cascade (doc deleted → assets deleted)

#### Step 4.3: UI/UX Polish
- [ ] Loading states
- [ ] Error messages
- [ ] Success confirmations
- [ ] Tab transition animation
- [ ] Responsive on mobile

---

## 📝 Implementation Order (Recommended)

1. **Backend First** (DB + Services + Routes)
   - Ensures API is ready for frontend testing
   
2. **Frontend UI** (Components)
   - Build components with hardcoded data first
   
3. **Integration** (Connect frontend to backend)
   - Wire API calls
   
4. **Testing** (Manual + automated)
   - Full end-to-end flow

---

## 🎯 Success Criteria

- ✅ Admin can create/edit/delete documentation
- ✅ Board can view documentation (read-only)
- ✅ Images upload and display correctly
- ✅ Templates pre-fill content
- ✅ UI matches Linear/Notion aesthetic
- ✅ No breaking changes to existing features
- ✅ Migrations run successfully
- ✅ API routes are secured (auth middleware)

---

## 📦 Dependencies to Add

**Backend:**
- `multer` - File upload handling
- Drizzle already included

**Frontend:**
- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-image`
- `@tiptap/extension-link`

---

## 🔧 Notes

- Use existing auth middleware (already in place)
- Use existing types/utils where possible
- Follow existing code patterns (services, routes, components)
- Keep it simple - don't add unnecessary complexity
- Images stored on disk (`/uploads/docs/`), URLs returned to frontend

---

## 📅 Timeline Estimate

| Phase | Estimate | Status |
|-------|----------|--------|
| Phase 1 (DB) | 1-2 hours | ⏳ |
| Phase 2 (Backend) | 2-3 hours | ⏳ |
| Phase 3 (Frontend) | 3-4 hours | ⏳ |
| Phase 4 (Testing) | 1-2 hours | ⏳ |
| **Total** | **7-11 hours** | ⏳ |

---

## 🚀 Ready to Start?

Next step: Start with **Phase 1 - Database Migration**

Questions? Clarifications needed?
