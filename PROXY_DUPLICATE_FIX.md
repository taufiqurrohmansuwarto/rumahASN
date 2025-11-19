# Fix Duplikasi Proxy dengan Nanoid + Fetch Until Empty

## Masalah
Saat sync proxy pangkat, ditemukan **129 duplicate IDs** yang menyebabkan data hilang karena hanya record pertama yang di-keep.

**Root Cause:**
1. **API SIASN Pagination Issue** - Offset-based pagination (`meta.total`) tidak konsisten
2. **Data Overlap** - Record yang sama muncul di offset berbeda (double fetch)
3. **Data Loss** - Duplicate records di-buang, data hilang

## Solusi

### 1. Ganti Fetching Method: `fetchAllBatches` → `fetchAllBatchesUntilEmpty`
**Mencegah duplikasi dari sumber** - fetch sampai empty array daripada rely on `meta.total`

### 2. Auto-generate Nanoid untuk Duplicate
**Backup protection** - jika masih ada duplicate, generate nanoid baru

## Perubahan

### 0. Fetching Method (`controller/siasn/proxy-siasn/proxy-pangkat.controller.js`)

**SEBELUM - fetchAllBatches (meta.total based):**
```javascript
const allResults = await fetchAllBatches(
  (params) => getKenaikanPangkatProxy(token, params),
  {
    batchSize: BATCH_FETCH_LIMIT,
    initialLimit: INITIAL_FETCH_LIMIT,
    onProgress: progressCallback,
  }
);
// Problem:
// - Fetch berdasarkan meta.total (misal: 23000)
// - Offset: 0, 500, 1000, 1500... sampai 23000
// - Jika data berubah saat fetching → overlap/duplicate
```

**SESUDAH - fetchAllBatchesUntilEmpty:**
```javascript
const allResults = await fetchAllBatchesUntilEmpty(
  (params) => getKenaikanPangkatProxy(token, params),
  {
    batchSize: BATCH_FETCH_LIMIT,
    delayBetweenBatches: 500,
    maxRetries: 3,
    dataKey: "data", // Response key
    incrementalOffset: false, // Offset: 0, 500, 1000...
  }
);
// Solution:
// - Fetch sampai response.data = [] (empty array)
// - Tidak rely on meta.total yang bisa berubah
// - Lebih reliable untuk API yang tidak konsisten
```

### 1. Duplicate Validator (`utils/siasn-proxy/validators/duplicate-validator.js`)

**SEBELUM:**
```javascript
// Filter duplicate - BUANG record ke-2 dan seterusnya
const uniqueData = data.filter(
  (item, index, self) =>
    item[idField] &&
    index === self.findIndex((t) => t[idField] === item[idField])
);

// Stats:
// - total: 23319
// - unique: 23190 (data yang di-keep)
// - duplicates: 129 (data yang DIHAPUS)
```

**SESUDAH:**
```javascript
// Generate nanoid untuk duplicate - SEMUA data di-keep
const processedData = data.map((item, index) => {
  const originalId = item[idField];
  
  if (seenIds.has(originalId)) {
    // Duplicate! Generate nanoid baru
    const newId = nanoid();
    return { ...item, [idField]: newId };
  }
  
  seenIds.add(originalId);
  return item;
});

// Stats:
// - total: 23319
// - unique: 23319 (SEMUA data di-keep)
// - duplicates: 129 (jumlah ID yang di-replace)
```

### 2. Controller (`controller/siasn/proxy-siasn/proxy-pangkat.controller.js`)

**Update log message:**
```javascript
log.info(
  `[PROXY PANGKAT] Processing completed! Total records: ${stats.unique}, Duplicates replaced: ${stats.duplicates}, Null IDs replaced: ${stats.nullIds}`
);
```

**Update result response:**
```javascript
const result = {
  success: true,
  message: "Data berhasil disinkronisasi",
  total: allResults.length,
  inserted: insertStats.inserted,
  duplicates_replaced: stats.duplicates, // Bukan duplicates_removed
  null_ids_replaced: stats.nullIds,
};
```

## Log Output Baru

Sekarang log akan menampilkan detail replacement:

```
[PROXY PANGKAT] Processing duplicates in 23319 records...
[DEDUP] Duplicate ID found (index: 5421): LINDRIYAWATI (197011122000032007) - Original ID: b33df7bf... -> New ID: xK9s2pL...
[DEDUP] Duplicate ID found (index: 8932): NURUL HIDAYATI (197708012009032005) - Original ID: 61d20ffe... -> New ID: mP4t9qW...
...
[DEDUP] Total 129 duplicate IDs replaced with nanoid
[DEDUP] Sample duplicates (first 5):
  LINDRIYAWATI (197011122000032007) - b33df7bf... -> xK9s2pL...
  NURUL HIDAYATI (197708012009032005) - 61d20ffe... -> mP4t9qW...
  ...
[PROXY PANGKAT] Processing completed! Total records: 23319, Duplicates replaced: 129, Null IDs replaced: 0
```

## Impact

### Fix 1: Fetch Until Empty
✅ **Mencegah duplikasi dari sumber** - API tidak overlap data  
✅ **Lebih reliable** - Tidak depend on `meta.total` yang bisa berubah  
✅ **Mengurangi/eliminasi duplicate** - Dari 129 mungkin jadi 0-10  

### Fix 2: Nanoid untuk Duplicate (Backup)
✅ **Semua data disimpan** - Tidak ada data yang hilang (jika masih ada duplicate)  
✅ **ID tetap unique** - Tidak ada constraint violation  
✅ **Data NAILUL MAZIDAH akan tersimpan** - Meskipun ID duplicate  
✅ **Detail logging** - Mudah tracking ID mana yang di-replace  

### Expected Result
**SEBELUMNYA:**
- Fetch: 23,319 (dengan ~129 duplicate karena API overlap)
- After dedup: 23,190 (129 data hilang)

**SEKARANG:**
- Fetch: ~23,190-23,200 (minimal/no duplicate dari API)
- After nanoid: 23,190-23,200 (SEMUA data tersimpan)  

## Testing

### 1. Sync Ulang
```bash
# Trigger sync dari UI atau API
# Perhatikan log untuk:
# - Jumlah data yang di-fetch (seharusnya ~23,190, bukan 23,319)
# - Jumlah duplicate yang di-replace (seharusnya 0-10, bukan 129)
```

**Expected Log:**
```
[PROXY PANGKAT] Starting data fetch (batch size: 500, fetch until empty)...
[PROXY PANGKAT] Fetching batch: offset 0, limit 500, page 0
[PROXY PANGKAT] Fetching batch: offset 500, limit 500, page 1
...
[PROXY PANGKAT] No more data to fetch (empty array received)
[PROXY PANGKAT] Fetch completed! Total: 23190 records  <- BUKAN 23319!
[PROXY PANGKAT] Processing duplicates in 23190 records...
[DEDUP] Total 0 duplicate IDs replaced with nanoid  <- SEHARUSNYA 0 atau sangat kecil!
[PROXY PANGKAT] Processing completed! Total records: 23190, Duplicates replaced: 0
```

### 2. Verifikasi Data
```bash
# Check data NAILUL MAZIDAH
curl "http://localhost:3088/helpdesk/api/siasn/ws/admin/proxy/pangkat/debug?nip=198206302006042021"

# Atau query database
SELECT * FROM siasn_proxy.proxy_pangkat 
WHERE nip = '198206302006042021';
```

### 3. Expected Result
```json
{
  "success": true,
  "found": 1,
  "data": [{
    "id": "xK9s2pLqR...", // Nanoid baru (jika duplicate)
    "nip": "198206302006042021",
    "nama": "NAILUL MAZIDAH",
    // ... rest of data
  }]
}
```

## Notes

### Tentang Fetching Method
- **Fetch until empty** lebih reliable untuk API yang tidak konsisten
- **Trade-off**: Sedikit lebih lambat (harus fetch sampai empty), tapi lebih accurate
- **Benefit**: Menghindari duplikasi dari sumber

### Tentang Nanoid
- **ID bukan dari SIASN** untuk record duplicate (jika masih ada)
- **Tidak perlu ubah database schema** - tetap gunakan kolom `id` existing
- **Backward compatible** - data lama tetap valid
- **Automatic** - tidak perlu manual intervention

### Monitoring
Setelah implement, monitor:
1. **Jumlah fetch** - seharusnya ~23,190 (bukan 23,319)
2. **Jumlah duplicate** - seharusnya 0 atau sangat kecil (<10)
3. **Total inserted** - seharusnya sama dengan jumlah fetch

## Rollback (jika perlu)

Jika ada masalah, rollback dengan:
```bash
git checkout HEAD~1 -- utils/siasn-proxy/validators/duplicate-validator.js
git checkout HEAD~1 -- controller/siasn/proxy-siasn/proxy-pangkat.controller.js
```

Kemudian sync ulang.

