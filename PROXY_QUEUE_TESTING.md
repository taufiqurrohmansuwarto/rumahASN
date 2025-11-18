# 🧪 Testing Proxy Queue System

## 📋 Pre-requisites

1. ✅ Redis running
2. ✅ Worker running: `npm run worker:dev`
3. ✅ Next.js running: `npm run dev`

---

## 🧹 Step 1: Cleanup Stuck Jobs (17 jobs waiting)

```bash
POST http://localhost:3000/api/siasn/ws/admin/proxy/cleanup?type=pangkat

Expected Response:
{
  "success": true,
  "message": "Berhasil membersihkan 17 job pangkat",
  "cleaned": 17,
  "breakdown": {
    "waiting": 17
  }
}
```

---

## ✅ Step 2: Test Sync Behavior (JobId TIDAK berubah!)

### Test 2.1: First Sync
```bash
POST http://localhost:3000/api/siasn/ws/admin/proxy/pangkat/sync

Expected:
{
  "success": true,
  "jobId": "proxy-pangkat-AAA",  # Note this ID!
  "status": "queued"
}
```

### Test 2.2: Sync Again (Immediately, while running)
```bash
POST http://localhost:3000/api/siasn/ws/admin/proxy/pangkat/sync

Expected:
{
  "success": false,  # Note: false karena masih running
  "jobId": "proxy-pangkat-AAA",  # SAME ID! ✅
  "status": "running",
  "progress": 30
}
```

### Test 2.3: Check Status
```bash
GET http://localhost:3000/api/siasn/ws/admin/proxy/status?jobId=proxy-pangkat-AAA

Expected:
{
  "found": true,
  "jobId": "proxy-pangkat-AAA",
  "state": "active",
  "progress": 50,
  "progressInfo": {
    "stage": "fetching",
    "message": "...",
    "currentTotal": 500
  }
}
```

### Test 2.4: Sync Again (After completed)
```bash
POST http://localhost:3000/api/siasn/ws/admin/proxy/pangkat/sync

Expected:
{
  "success": true,
  "jobId": "proxy-pangkat-AAA",  # STILL SAME ID! ✅
  "status": "completed",
  "message": "Sinkronisasi terakhir berhasil 2 menit yang lalu. Gunakan force=true untuk sync ulang.",
  "lastSync": {
    "finishedAt": 1699999999999,
    "minutesAgo": 2,
    "result": { "success": true, "total": 1000 }
  }
}
```

### Test 2.5: Force Sync (Create NEW job)
```bash
POST http://localhost:3000/api/siasn/ws/admin/proxy/pangkat/sync?force=true

Expected:
{
  "success": true,
  "jobId": "proxy-pangkat-BBB",  # NEW ID! ✅
  "status": "queued",
  "forced": true,
  "message": "Semua job sebelumnya dibersihkan. Sinkronisasi baru dimulai di background"
}
```

---

## 🔍 Step 3: Debug Check (Should be clean!)

```bash
GET http://localhost:3000/api/siasn/ws/admin/proxy/debug

Expected:
{
  "summary": {
    "total": 1,  # Only 1 job! Not 17! ✅
    "active": 1,
    "waiting": 0
  },
  "byType": {
    "pangkat": {
      "active": 1,
      "waiting": 0,
      "completed": 0
    }
  },
  "jobs": {
    "active": [
      {
        "id": "proxy-pangkat-BBB",
        "type": "pangkat",
        "progress": 30
      }
    ]
  }
}
```

---

## ✅ Success Criteria

| Test | Expected | Pass/Fail |
|------|----------|-----------|
| Cleanup 17 jobs | `cleaned: 17` | ⬜ |
| First sync creates jobId A | `jobId: "AAA"` | ⬜ |
| Second sync returns SAME jobId | `jobId: "AAA"` | ⬜ |
| Status check found | `found: true` | ⬜ |
| Sync after completed returns info | `status: "completed"`, same jobId | ⬜ |
| Force sync creates NEW jobId | `jobId: "BBB"` (different) | ⬜ |
| Debug shows only 1-2 jobs | `total: 1-2` (not 17!) | ⬜ |

---

## 🐛 Troubleshooting

### Worker Not Running?
```bash
# Check if worker is running
ps aux | grep "worker:dev"

# If not, start it
npm run worker:dev

# In another terminal, check logs
tail -f logs/worker.log
```

### Jobs Still Stuck?
```bash
# Nuclear option: cleanup ALL jobs
POST /api/siasn/ws/admin/proxy/cleanup

# Then start fresh
POST /api/siasn/ws/admin/proxy/pangkat/sync
```

### Redis Issues?
```bash
# Check Redis
redis-cli ping
# Expected: PONG

# Clear all queue data (careful!)
redis-cli FLUSHDB
```

---

## 🎯 Key Behavior

✅ **JobId TIDAK berubah** kecuali menggunakan `force=true`  
✅ **Hanya 1 job** per type pada saat yang sama  
✅ **Worker harus running** agar jobs diproses  
✅ **Completed jobs** tetap bisa dicek status-nya  

🚫 **TIDAK akan ada 17 jobs lagi** karena smart sync prevention!

---

Silakan ikuti test steps di atas dan tandai ✅ jika berhasil!

