# Email Thread Component Update

## Perubahan yang Dilakukan

### 1. UI Matching dengan EmailDetailComponent

- Menggunakan struktur yang sama dengan `EmailDetailComponent`
- Mengintegrasikan komponen yang sama:
  - `EmailDetailHeader` - untuk header email dengan action buttons
  - `EmailContentDisplay` - untuk menampilkan konten email
  - `EmailAttachmentsDisplay` - untuk menampilkan lampiran
  - `EmailActionButtons` - untuk tombol aksi

### 2. Gmail-style Quoted Content

- Menambahkan format quoted content seperti Gmail
- Format: `On [Tanggal] [Pengirim] <email> wrote:`
- Konten sebelumnya ditampilkan dengan border kiri dan warna abu-abu
- Menggunakan locale Indonesia untuk format tanggal

### 3. Fitur Collapse/Expand

- Setiap email dalam thread dapat di-collapse atau expand
- Email terkini dan terbaru secara default dalam keadaan expanded
- Tombol collapse tersedia di header email saat expanded

### 4. Improved Styling

- Margin dan padding yang konsisten
- Border styling untuk email terkini
- Max height yang lebih besar untuk scroll area
- Styling yang mirip dengan EmailDetailComponent

## Komponen yang Diperbarui

### EmailThreadComponent.js

- Struktur ThreadEmailItem menggunakan komponen yang sama dengan EmailDetailComponent
- Menambahkan logic untuk quoted content
- Handler untuk aksi-aksi email (placeholder untuk implementasi)

### EmailDetailHeader.js

- Menambahkan props `showCollapseButton` dan `onCollapse`
- Tombol collapse dengan icon `UpOutlined`

### EmailContentDisplay.js

- Menambahkan fungsi `processContent()` untuk memisahkan quoted content
- Fungsi `renderProcessedContent()` untuk styling quoted content
- Border kiri untuk quoted content
- Warna abu-abu untuk quote header dan content

## Cara Penggunaan

```jsx
<EmailThreadComponent
  emailId={emailId}
  threadData={threadData}
  onReply={handleReply}
  onReplyAll={handleReplyAll}
/>
```

## Screenshot/Preview

(Akan mirip dengan Gmail dengan quoted content yang memiliki border kiri dan warna abu-abu)

## Todo/Improvement

- Implementasi handler aksi yang sebenarnya (star, archive, delete, dll)
- Integrasi dengan API backend
- Loading states untuk aksi-aksi
- Error handling
