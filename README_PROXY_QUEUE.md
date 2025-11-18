# 🔄 Proxy Queue System

Sistem background job untuk sinkronisasi data SIASN Proxy menggunakan Bull Queue + Redis.

---

## 📁 File Structure

```
jobs/
├── queue.js                  # proxyQueue definition
├── worker.js                 # All processors (seal, siasn, proxy)
└── processors/
    └── proxy.js              # Generic proxy processor

utils/
└── proxy-queue-helper.js     # getRunningSync, createProxySyncJob, getJobStatus

controller/siasn/proxy-siasn/
└── proxy-pangkat.controller.js # syncProxyPangkatQueue, getProxySyncStatus

pages/api/siasn/ws/admin/proxy/
├── pangkat/sync.js           # POST → queue
├── status.js                 # GET → status (query param)
├── debug.js                  # GET → all jobs
└── cleanup.js                # POST → cleanup stuck jobs
```

---

## 🚀 Cara Menjalankan

### Development:
```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Worker (includes proxy processor)
npm run worker:dev
```

### Production (PM2):
```bash
pm2 start ecosystem.config.js  # rasn-worker sudah include proxy
```

---

## 🚀 How It Works

### 📋 Sync Behavior

| Condition | Behavior | Response |
|-----------|----------|----------|
| **First sync** | Create job A | `{ jobId: "A", status: "queued" }` |
| **Sync again (A running)** | Return job A | `{ jobId: "A", status: "running", progress: 50 }` |
| **Sync again (A completed)** | Return job A info | `{ jobId: "A", status: "completed", lastSync: {...} }` |
| **Sync with `force=true`** | Delete all jobs, create job B | `{ jobId: "B", status: "queued", forced: true }` |

**Key Point:** JobId **TIDAK berubah** kecuali menggunakan `force=true`!

---

## 📡 API Usage

### **1. Start Sync (First time):**
```bash
POST /api/siasn/ws/admin/proxy/pangkat/sync
```
**Response:**
```json
{
  "success": true,
  "message": "Sinkronisasi dimulai di background",
  "status": "queued",
  "jobId": "proxy-pangkat-1234567890"
}
```

### **2. Sync Again (Job Still Running):**
```bash
POST /api/siasn/ws/admin/proxy/pangkat/sync
```
**Response (Same JobId!):**
```json
{
  "success": false,
  "message": "Sinkronisasi masih berjalan. Gunakan force=true untuk mengulang.",
  "status": "running",
  "jobId": "proxy-pangkat-1234567890",
  "progress": 65
}
```

### **3. Sync Again (Job Completed):**
```bash
POST /api/siasn/ws/admin/proxy/pangkat/sync
```
**Response (Last Job Info):**
```json
{
  "success": true,
  "message": "Sinkronisasi terakhir berhasil 5 menit yang lalu. Gunakan force=true untuk sync ulang.",
  "status": "completed",
  "jobId": "proxy-pangkat-1234567890",
  "lastSync": {
    "finishedAt": 1699999999999,
    "minutesAgo": 5,
    "result": {
      "success": true,
      "message": "Sync completed",
      "total": 1000
    }
  }
}
```

### **4. Force Re-Sync:**
```bash
POST /api/siasn/ws/admin/proxy/pangkat/sync?force=true
```
**Response (New JobId!):**
```json
{
  "success": true,
  "message": "Semua job sebelumnya dibersihkan. Sinkronisasi baru dimulai di background",
  "status": "queued",
  "jobId": "proxy-pangkat-9999999999",
  "forced": true
}
```

### **5. Check Status:**
```bash
GET /api/siasn/ws/admin/proxy/status?jobId=proxy-pangkat-1234567890
```
**Response:**
```json
{
  "found": true,
  "jobId": "proxy-pangkat-1234567890",
  "type": "pangkat",
  "state": "active",
  "progress": 65,
  "progressInfo": {
    "stage": "fetching",
    "message": "Fetching batch 52: offset 52, limit 100",
    "offset": 52,
    "currentTotal": 5200,
    "expectedTotal": 10000
  },
  "createdAt": 1699999999999,
  "requestedBy": "admin"
}
```

---

## 🔧 Extend ke Proxy Lain (Pensiun, PG, SKK)

### Pattern Super Simpel (3 langkah)!

**Step 1:** Di `jobs/processors/proxy.js`, tambahkan handler:
```javascript
const PROXY_SYNC_HANDLERS = {
  pangkat: syncProxyPangkat,
  pensiun: syncProxyPensiun,  // ADD THIS
  pg_akademik: syncProxyPgAkademik,  // ADD THIS
  pg_profesi: syncProxyPgProfesi,  // ADD THIS
  skk: syncProxySkk,  // ADD THIS
};
```

**Step 2:** Di controller `proxy-pensiun.controller.js` (copy & ganti type!):
```javascript
const { handleSyncQueue, handleGetStatus } = require("@/utils/proxy-queue-helper");

// Ganti "pangkat" dengan "pensiun"
const syncProxyPensiunQueue = (req, res) => {
  return handleSyncQueue("pensiun", req, res);
};

const getProxySyncStatus = (req, res) => {
  return handleGetStatus(req, res);
};

module.exports = {
  syncProxyPensiun, // Direct sync function (sudah ada)
  syncProxyPensiunQueue, // Queue version (NEW!)
  getProxySyncStatus,
};
```

**Step 3:** Di API route `pages/api/siasn/ws/admin/proxy/pensiun/sync.js`:
```javascript
import { syncProxyPensiunQueue } from "@/controller/siasn/proxy-siasn/proxy-pensiun.controller";

router.post(syncProxyPensiunQueue);
```

**SELESAI!** ✅ Semua logic sudah ada di `handleSyncQueue`, tinggal ganti type!

### Untuk PG Akademik:
```javascript
const syncProxyPgAkademikQueue = (req, res) => {
  return handleSyncQueue("pg_akademik", req, res);
};
```

### Untuk PG Profesi:
```javascript
const syncProxyPgProfesiQueue = (req, res) => {
  return handleSyncQueue("pg_profesi", req, res);
};
```

### Untuk SKK:
```javascript
const syncProxySkkQueue = (req, res) => {
  return handleSyncQueue("skk", req, res);
};
```

**Semua logic (check running, check last, cleanup, create job) sudah ada di `handleSyncQueue`!**

---

## ✅ Key Features

- ✅ Non-blocking (return jobId immediately)
- ✅ Smart sync prevention (reuse completed jobs, return existing jobId)
- ✅ Force re-sync with `force=true` query param
- ✅ No auto-cleanup (jobs persist until force sync)
- ✅ Real-time progress tracking with detailed info
- ✅ Auto retry (3x, exponential backoff)
- ✅ 30min timeout per job
- ✅ Graceful shutdown

---

## 🧹 Cleanup & Troubleshooting

### Cleanup Stuck Jobs

Jika ada banyak jobs stuck di waiting (karena worker mati):

```bash
# Cleanup semua proxy jobs
POST /api/siasn/ws/admin/proxy/cleanup

# Cleanup job pangkat saja
POST /api/siasn/ws/admin/proxy/cleanup?type=pangkat

Response:
{
  "success": true,
  "message": "Berhasil membersihkan 17 job pangkat",
  "cleaned": 17,
  "breakdown": {
    "active": 0,
    "waiting": 17,
    "completed": 0,
    "failed": 0
  }
}
```

### Check Worker Status

```bash
# Development
ps aux | grep "worker:dev"

# Production
pm2 list
pm2 logs rasn-worker
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **17+ jobs di waiting** | Worker tidak running | 1. Start worker: `npm run worker:dev`<br>2. Cleanup: `POST /cleanup` |
| **JobId berubah terus** | Logic bug (sudah fixed) | Update code terbaru |
| **Job stuck forever** | Worker crash | Check logs: `pm2 logs rasn-worker` |

---

## 📊 Status

- ✅ **proxy_pangkat** - Implemented
- ⏳ **proxy_pensiun** - Tinggal extend
- ⏳ **proxy_pg_akademik** - Tinggal extend
- ⏳ **proxy_pg_profesi** - Tinggal extend
- ⏳ **proxy_skk** - Tinggal extend

Pattern sudah clear, tinggal replicate! 🚀

