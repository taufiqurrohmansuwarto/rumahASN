# Demo Simulasi Form Pengajuan Kredit Bank Jatim

## 🚀 Fitur Multi-Step Form

### Step 1: Informasi Pegawai (Otomatis)

- **Data Dummy Pegawai:**

  - NIP: 198501012010011001
  - Nama: Ahmad Suryanto, S.Kom
  - Tempat/Tanggal Lahir: Surabaya, 1985-01-01
  - Pangkat/Golongan: Penata Tk. I / III.d
  - Perangkat Daerah: Badan Kepegawaian Daerah Provinsi Jawa Timur
  - Alamat KTP: Jl. Pemuda No. 123, Surabaya, Jawa Timur 60271

- **Action:** User klik "Selanjutnya" untuk ke Step 2

### Step 2: Data Pinjaman

**Field yang tersedia:**

1. **Jenis Pengajuan Kredit** (Required)

   - KKB (Kredit Kendaraan Bermotor)
   - KPR (Kredit Pemilikan Rumah)
   - Multiguna (Kredit Multiguna)

2. **Plafond Pinjaman** (Required)

   - Range: Rp 5.000.000 - Rp 2.000.000.000
   - Format: Currency dengan separator

3. **Jangka Waktu** (Required)
   - Options: 12, 24, 36, 48, 60, 72 Bulan

**Action:** User isi form dan klik "Submit Pengajuan"

### Step 3: Hasil Pengajuan

**Simulasi Random Result (70% success rate):**

#### ✅ **Success Scenario:**

- Status: "Pengajuan Berhasil Disubmit!"
- Nomor Pengajuan: Auto-generated (contoh: KKB-2024-123)
- Message: "Pengajuan kredit Anda telah berhasil disubmit dan sedang dalam proses review."
- Estimasi Proses: "7-14 hari kerja"
- Actions: ["Pengajuan Baru", "Cek Status"]

#### ❌ **Error Scenario:**

- Status: "Pengajuan Gagal"
- Message: "Maaf, pengajuan Anda tidak dapat diproses saat ini. Silakan periksa kembali data Anda atau hubungi customer service."
- Actions: ["Coba Lagi", "Hubungi CS"]

## 🎨 Styling Features

### Design Elements:

- **Color Scheme:** Bank Jatim Red (#dc2626)
- **Modern Cards:** Rounded corners, shadows, gradients
- **Responsive Layout:** Mobile-first design
- **Smooth Animations:** Hover effects, transitions
- **Progress Indicator:** Step navigation dengan icons

### Button Styling:

- **Primary Button:** Red gradient, white text, hover effects
- **Secondary Button:** White background, red border, hover transform

### Form Styling:

- **Input Fields:** Rounded borders, focus states
- **Select Dropdowns:** Custom styling dengan icons
- **Validation:** Real-time error messages

## 🔄 Navigation Flow

```
Dashboard → Pengajuan Baru → Multi-Step Form
   ↑                              ↓
   ←─── [Success] ← Submit ← Form Fill
```

## 📱 Responsive Breakpoints

- **Mobile (xs):** Single column layout
- **Tablet (md):** 2 columns for form fields
- **Desktop (lg+):** Optimized spacing

## 🎯 Integration Points

1. **Dashboard Integration:** "Pengajuan Baru" button navigates to form
2. **Status Check:** Modal untuk cek status existing applications
3. **Form Submission:** Simulated API call dengan loading states
4. **Success Handling:** Message notifications dan navigation options

## 🛠️ Technical Implementation

- **React Hooks:** useState untuk step management
- **Ant Design:** UI components dengan custom styling
- **Form Validation:** Real-time validation dengan error handling
- **CSS-in-JS:** antd-style untuk styling consistency
- **Router Integration:** Next.js routing untuk navigation

## 🔄 Demo Steps

1. **Akses:** `/layanan-keuangan/bank-jatim/pengajuan`
2. **Step 1:** Review data pegawai otomatis
3. **Step 2:** Isi 3 field: jenis kredit, plafond, jangka waktu
4. **Submit:** Klik "Submit Pengajuan" (loading 2 detik)
5. **Result:** Lihat hasil success/error dengan appropriate actions
