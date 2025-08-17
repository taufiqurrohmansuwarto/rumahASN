# Knowledge Management Components

Komponen-komponen untuk mengelola konten knowledge berdasarkan schema database `knowledge_content`.

## Komponen Yang Tersedia

### 1. KnowledgeFormUserContents

Form untuk membuat dan mengedit konten knowledge dengan fitur lengkap.

**Props:**

- `initialData` (object, optional): Data awal untuk mode edit
- `onSuccess` (function, optional): Callback saat berhasil submit
- `onCancel` (function, optional): Callback saat batal

**Fitur:**

- ✅ Form dengan validasi sesuai schema database
- ✅ Rich text editor dengan ReactQuill
- ✅ Upload file dengan validasi tipe dan ukuran
- ✅ Manajemen tags dengan UI interaktif
- ✅ Dropdown kategori dinamis dari API
- ✅ Mode draft, pending, dan published
- ✅ UI responsif dengan Ant Design
- ✅ Loading states dan error handling
- ✅ React Query untuk state management

### 2. KnowledgeUserContents

Komponen untuk menampilkan daftar konten knowledge dengan fitur CRUD.

**Fitur:**

- ✅ List dengan pagination
- ✅ Search dan filter berdasarkan status
- ✅ Actions: View, Edit, Delete
- ✅ Preview konten dengan strip HTML
- ✅ Indikator file lampiran
- ✅ Counter views, likes, comments
- ✅ Loading states dan empty states
- ✅ Responsive design

## Contoh Penggunaan

```jsx
import KnowledgeUserContents from "@/components/KnowledgeManagements/KnowledgeUserContents";

function KnowledgePage() {
  return (
    <div style={{ padding: 24 }}>
      <KnowledgeUserContents />
    </div>
  );
}
```

## Dependencies

- `@tanstack/react-query`: State management dan caching
- `antd`: UI components
- `react-quill`: Rich text editor
- `moment`: Date formatting
- `next/dynamic`: Dynamic imports

## API Services

Service functions yang digunakan:

- `getKnowledgeContents(query)`: Mengambil list konten
- `getKnowledgeContent(id)`: Mengambil detail konten
- `createKnowledgeContent(data)`: Membuat konten baru
- `updateKnowledgeContent({id, data})`: Update konten
- `deleteKnowledgeContent(id)`: Hapus konten
- `getKnowledgeCategories()`: Mengambil daftar kategori

## Schema Database

Komponen ini dibuat berdasarkan schema:

```sql
CREATE TABLE knowledge_content (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  content      TEXT NOT NULL,
  category_id  INT NOT NULL REFERENCES knowledge_category(id) ON DELETE RESTRICT,
  tags         TEXT[],
  file_url     TEXT,
  author_id    UUID NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'draft',
  CHECK (status IN ('draft','pending','published')),
  views_count  INT NOT NULL DEFAULT 0,
  likes_count  INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
```
