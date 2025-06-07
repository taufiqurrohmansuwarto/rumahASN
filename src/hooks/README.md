# useScrollRestoration Hook

Custom hook untuk mengelola scroll restoration yang dapat digunakan berulang kali di berbagai komponen.

## ✨ Features

- 🔄 Otomatis menyimpan posisi scroll sebelum navigasi
- 📍 Mengembalikan posisi scroll setelah navigasi selesai
- 🛡️ Error handling yang aman
- ⚙️ Konfigurasi storage key dan enable/disable
- 🎯 Manual control functions

## 📖 Usage

### Basic Usage

```javascript
import useScrollRestoration from "@/hooks/useScrollRestoration";

const MyComponent = () => {
  // Menggunakan default storage key "scrollPosition"
  useScrollRestoration();

  return (
    <div>
      <h1>My Component</h1>
      {/* konten komponen */}
    </div>
  );
};
```

### Advanced Usage

```javascript
import useScrollRestoration from "@/hooks/useScrollRestoration";

const MyDetailPage = () => {
  // Menggunakan custom storage key dan manual control
  const { saveScrollPosition, restoreScrollPosition, clearScrollPosition } =
    useScrollRestoration("myPageScrollPosition", true);

  const handleCustomSave = () => {
    saveScrollPosition();
    console.log("Scroll position saved manually");
  };

  const handleCustomRestore = () => {
    restoreScrollPosition();
    console.log("Scroll position restored manually");
  };

  const handleClear = () => {
    clearScrollPosition();
    console.log("Scroll position cleared");
  };

  return (
    <div>
      <button onClick={handleCustomSave}>Save Scroll</button>
      <button onClick={handleCustomRestore}>Restore Scroll</button>
      <button onClick={handleClear}>Clear Scroll</button>

      {/* konten panjang */}
    </div>
  );
};
```

### Conditional Usage

```javascript
import useScrollRestoration from "@/hooks/useScrollRestoration";

const ConditionalComponent = ({ enableScrollRestore }) => {
  // Hanya aktif jika enableScrollRestore true
  useScrollRestoration("conditionalScroll", enableScrollRestore);

  return <div>Content...</div>;
};
```

## 📋 Parameters

| Parameter    | Type      | Default            | Description                                         |
| ------------ | --------- | ------------------ | --------------------------------------------------- |
| `storageKey` | `string`  | `"scrollPosition"` | Key untuk menyimpan posisi scroll di sessionStorage |
| `enabled`    | `boolean` | `true`             | Apakah scroll restoration diaktifkan                |

## 🔄 Return Values

Hook mengembalikan object dengan fungsi-fungsi berikut:

| Function                  | Description                                              |
| ------------------------- | -------------------------------------------------------- |
| `saveScrollPosition()`    | Menyimpan posisi scroll saat ini secara manual           |
| `restoreScrollPosition()` | Mengembalikan posisi scroll yang tersimpan secara manual |
| `clearScrollPosition()`   | Menghapus posisi scroll yang tersimpan                   |

## 🛡️ Error Handling

Hook ini dilengkapi dengan error handling yang aman:

- Try-catch untuk operasi sessionStorage
- Validasi untuk nilai yang tersimpan
- Warning di console jika terjadi error

## 💡 Tips

1. **Gunakan storage key yang unik** untuk setiap halaman/komponen agar tidak bentrok
2. **Matikan sementara** dengan parameter `enabled={false}` jika diperlukan
3. **Manual control** berguna untuk custom scenarios seperti infinite scroll
4. **Perhatikan memory usage** - sessionStorage akan dibersihkan otomatis saat tab ditutup

## 🔗 Example Files

- `pages/asn-connect/asn-updates/all/[id]/index.js` - Basic usage
- `src/components/Discussions/DetailDiscussion.js` - Advanced usage (coming soon)

## 🚀 Integration Examples

### Dengan List/Grid Components

```javascript
const ProductList = () => {
  useScrollRestoration("productListScroll");

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Dengan Infinite Scroll

```javascript
const InfiniteList = () => {
  const { saveScrollPosition } = useScrollRestoration("infiniteListScroll");

  const handleLoadMore = () => {
    saveScrollPosition(); // Save sebelum load data baru
    loadMoreData();
  };

  return (
    <div>
      {/* list items */}
      <button onClick={handleLoadMore}>Load More</button>
    </div>
  );
};
```
