# Komponen Detail Layanan Bank Jatim

Komponen `BankJatimDetailLayanan` adalah komponen React yang dapat digunakan berulang-ulang untuk menampilkan halaman detail layanan perbankan dengan desain yang elegan dan modern.

## Fitur Utama

- ✨ **Desain Modern & Elegan** - Menggunakan gradient, shadow, dan animasi yang halus
- 🔄 **Reusable** - Dapat digunakan untuk berbagai jenis layanan
- 📱 **Responsive** - Menyesuaikan dengan berbagai ukuran layar
- 🎨 **Customizable** - Props yang fleksibel untuk berbagai kebutuhan
- 🚀 **Performance** - Optimized dengan styling yang efisien

## Struktur Komponen

Komponen terdiri dari 3 bagian utama:

1. **Hero Section** - Header dengan judul, subtitle, dan kategori
2. **Description Card** - Deskripsi layanan dan fitur-fitur
3. **Action Cards** - Tombol-tombol aksi (simulasi, pengajuan, cek status)

## Props API

### Props Utama

| Prop          | Type   | Default              | Deskripsi                               |
| ------------- | ------ | -------------------- | --------------------------------------- |
| `title`       | string | "Layanan Bank Jatim" | Judul utama layanan                     |
| `subtitle`    | string | ""                   | Subtitle/tagline layanan                |
| `description` | string | Default description  | Deskripsi lengkap layanan               |
| `category`    | string | ""                   | Kategori layanan (tampil sebagai badge) |
| `features`    | array  | []                   | Array fitur-fitur layanan               |
| `imageUrl`    | string | undefined            | URL gambar background hero section      |

### Props Event Handlers

| Prop          | Type     | Deskripsi                       |
| ------------- | -------- | ------------------------------- |
| `onSimulasi`  | function | Handler untuk tombol simulasi   |
| `onPengajuan` | function | Handler untuk tombol pengajuan  |
| `onCekStatus` | function | Handler untuk tombol cek status |

### Props Customization

| Prop            | Type   | Default | Deskripsi                                    |
| --------------- | ------ | ------- | -------------------------------------------- |
| `customActions` | array  | []      | Array aksi custom (override default actions) |
| `className`     | string | ""      | CSS class tambahan                           |
| `style`         | object | {}      | Inline style tambahan                        |

## Format Custom Actions

Untuk menggunakan `customActions`, gunakan format berikut:

```javascript
const customActions = [
  {
    key: "unique-key",
    label: "Label Tombol",
    icon: <IconComponent />,
    description: "Deskripsi singkat aksi",
    onClick: () => {
      /* handler function */
    },
  },
];
```

## Contoh Penggunaan

### 1. Penggunaan Dasar

```jsx
import BankJatimDetailLayanan from "./BankJatimDetailLayanan";

function MyComponent() {
  return (
    <BankJatimDetailLayanan
      title="Kredit Pemilikan Rumah"
      description="Wujudkan impian rumah dengan KPR Bank Jatim"
      onSimulasi={() => console.log("Simulasi KPR")}
      onPengajuan={() => console.log("Pengajuan KPR")}
      onCekStatus={() => console.log("Cek Status")}
    />
  );
}
```

### 2. Penggunaan Lengkap dengan Fitur

```jsx
<BankJatimDetailLayanan
  title="Kredit Pemilikan Rumah (KPR)"
  subtitle="Wujudkan Impian Rumah Idaman Anda"
  category="Kredit Properti"
  description="KPR Bank Jatim memberikan kemudahan bagi Anda untuk memiliki rumah impian dengan suku bunga kompetitif dan tenor yang fleksibel."
  features={[
    "Suku Bunga Kompetitif",
    "Tenor Hingga 25 Tahun",
    "DP Mulai 10%",
    "Proses Cepat",
    "Asuransi Jiwa & Kebakaran",
  ]}
  imageUrl="/images/kpr-banner.jpg"
  onSimulasi={handleSimulasi}
  onPengajuan={handlePengajuan}
  onCekStatus={handleCekStatus}
/>
```

### 3. Penggunaan dengan Custom Actions

```jsx
import {
  CarOutlined,
  BookOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";

const customActions = [
  {
    key: "simulasi",
    label: "Simulasi Kredit",
    icon: <CarOutlined />,
    description: "Hitung cicilan kendaraan impian Anda",
    onClick: () => console.log("Simulasi kredit kendaraan"),
  },
  {
    key: "katalog",
    label: "Katalog Kendaraan",
    icon: <BookOutlined />,
    description: "Lihat daftar kendaraan yang tersedia",
    onClick: () => console.log("Buka katalog"),
  },
  {
    key: "pengajuan",
    label: "Ajukan Kredit",
    icon: <CreditCardOutlined />,
    description: "Mulai proses pengajuan kredit",
    onClick: () => console.log("Form pengajuan"),
  },
];

<BankJatimDetailLayanan
  title="Kredit Kendaraan Bermotor"
  description="Kredit kendaraan dengan bunga kompetitif"
  customActions={customActions}
/>;
```

## Styling & Tema

Komponen menggunakan sistem styling yang konsisten dengan:

- **Warna Primer**: #dc2626 (Merah Bank Jatim)
- **Gradient**: Berbagai gradient modern untuk visual yang menarik
- **Border Radius**: 12px - 20px untuk tampilan modern
- **Shadow**: Subtle shadow dengan efek hover
- **Typography**: Hierarchy yang jelas dengan Google Sans font family

## Best Practices

### 1. Konten yang Efektif

- **Judul**: Gunakan judul yang jelas dan descriptive (max 60 karakter)
- **Deskripsi**: Tulislah deskripsi yang informatif dan persuasif (150-300 kata)
- **Fitur**: Maksimal 6 fitur utama untuk keterbacaan optimal

### 2. Event Handlers

```javascript
// ✅ Good - Specific and clear
const handleSimulasiKPR = () => {
  router.push("/kpr/simulasi");
};

const handlePengajuanKPR = () => {
  router.push("/kpr/pengajuan");
};

// ❌ Avoid - Generic handlers
const handleClick = (type) => {
  // Logic based on type
};
```

### 3. Custom Actions

```javascript
// ✅ Good - Descriptive and consistent
const customActions = [
  {
    key: "simulasi-kpr",
    label: "Simulasi KPR",
    icon: <CalculatorOutlined />,
    description: "Hitung estimasi cicilan rumah Anda",
    onClick: handleSimulasiKPR,
  },
];

// ❌ Avoid - Vague descriptions
const customActions = [
  {
    key: "action1",
    label: "Action",
    description: "Do something",
    onClick: handleClick,
  },
];
```

## Contoh Implementasi Lengkap

Lihat file `DetailLayananExample.js` untuk contoh implementasi lengkap dengan berbagai use case:

- KPR (Kredit Pemilikan Rumah)
- Kredit Kendaraan
- Tabungan
- Implementasi minimal

## Dependencies

Komponen ini membutuhkan:

- React 16.8+
- Ant Design 5.x
- @ant-design/icons
- styled-jsx (untuk styling)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

---

**Dibuat dengan ❤️ untuk Bank Jatim**
