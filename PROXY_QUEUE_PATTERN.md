# Pattern untuk Proxy Queue System

Pattern ini digunakan untuk semua proxy sync operations (pangkat, pensiun, pg_akademik, pg_profesi, skk).

## ✅ Status Implementation

- ✅ **pangkat** - Fully implemented with queue
- ✅ **pensiun** - Fully implemented with queue  
- ⚠️  **pg_akademik** - Need to update (follow steps below)
- ⚠️  **pg_profesi** - Need to update (follow steps below)
- ⚠️  **skk** - Need to update (follow steps below)

---

## 📋 Implementation Pattern

### 1. **Update Controller** (`controller/siasn/proxy-siasn/proxy-[type].controller.js`)

#### A. Update sync function signature
```javascript
// BEFORE:
const syncProxy[Type] = async (req, res) => {
  try {
    const { token } = req;
    // ...
  } catch (error) {
    // ...
  }
};

// AFTER:
const syncProxy[Type] = async (req, res, job = null) => {
  const startTime = Date.now();
  try {
    const { token } = req;
    
    log.info("[PROXY [TYPE]] Starting synchronization");
    if (job) await job.progress(5);
    
    // ... your sync logic with progress updates
    
    const result = {
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    };
    
    if (job) await job.progress(100, result);
    return result;
  } catch (error) {
    log.error("[PROXY [TYPE]] ❌ Error syncing data", error);
    if (job)
      await job.progress(100, {
        success: false,
        message: "Gagal sinkronisasi",
        error: error.message,
      });
    throw error;
  }
};
```

#### B. Add progress tracking at key stages
```javascript
if (job) await job.progress(5);   // Starting
if (job) await job.progress(10);  // Table cleared
if (job) await job.progress(60);  // Fetch completed
if (job) await job.progress(70);  // Transform completed
if (job) await job.progress(80);  // Dedup completed
if (job) await job.progress(95);  // Insert completed
if (job) await job.progress(100, result); // Final
```

#### C. Update logging with proper prefix
```javascript
// Use consistent prefix throughout
log.info("[PROXY [TYPE]] Clearing existing data...");
log.info("[PROXY [TYPE]] Starting data fetch...");
log.info(`[PROXY [TYPE]] Fetch completed! Total: ${allResults.length} records`);
log.info(`[PROXY [TYPE]] Transforming ${allResults.length} records...`);
// ... etc
log.info("[PROXY [TYPE]] ✅ Sync Completed Successfully!");
```

#### D. Add queue handlers at end of file
```javascript
// Queue handlers (reuse generic pattern)
const {
  handleSyncQueue,
  handleGetStatus,
} = require("@/utils/proxy-queue-helper");

const syncProxy[Type]Queue = (req, res) => {
  return handleSyncQueue("[type]", req, res);
};

const getProxySyncStatus = (req, res) => {
  return handleGetStatus(req, res);
};

module.exports = {
  syncProxy[Type],
  getProxy[Type],
  syncProxy[Type]Queue,
  getProxySyncStatus,
};
```

---

### 2. **Update API Route** (`pages/api/siasn/ws/admin/proxy/[type]/sync.js`)

```javascript
// BEFORE:
import { syncProxy[Type] } from "@/controller/siasn/proxy-siasn/proxy-[type].controller";
// ...
router.get(syncProxy[Type]);

// AFTER:
import { syncProxy[Type]Queue } from "@/controller/siasn/proxy-siasn/proxy-[type].controller";
// ...
// GET untuk queue-based sync (non-blocking)
router.get(syncProxy[Type]Queue);
```

---

### 3. **Update Processor** (`jobs/processors/proxy.js`)

Already done! Just add import:

```javascript
const {
  syncProxy[Type],
} = require("@/controller/siasn/proxy-siasn/proxy-[type].controller");

const PROXY_SYNC_HANDLERS = {
  [type]: syncProxy[Type],
  // ... other types
};
```

---

## 🎯 Example: Pensiun Implementation

### Controller (`proxy-pensiun.controller.js`)

```javascript
const syncProxyPensiun = async (req, res, job = null) => {
  const startTime = Date.now();
  try {
    const { token } = req;
    const knex = PensiunProxy.knex();
    const tableName = `${PROXY_SCHEMA}.${TABLES.PENSIUN}`;

    log.info("[PROXY PENSIUN] Starting synchronization");
    if (job) await job.progress(5);

    // Clear
    log.info("[PROXY PENSIUN] Clearing existing data...");
    await clearTable(knex, tableName);
    log.info("[PROXY PENSIUN] Table cleared successfully");
    if (job) await job.progress(10);

    // Fetch
    log.info("[PROXY PENSIUN] Starting data fetch...");
    const allResults = await fetchAllBatches(/* ... */);
    log.info(`[PROXY PENSIUN] Fetch completed! Total: ${allResults.length} records`);
    if (job) await job.progress(60);

    // Transform
    log.info(`[PROXY PENSIUN] Transforming ${allResults.length} records...`);
    const transformedData = transformPensiunData(allResults);
    log.info(`[PROXY PENSIUN] Transform completed!`);
    if (job) await job.progress(70);

    // Dedup
    const { uniqueData, stats } = removeDuplicates(transformedData);
    log.info(`[PROXY PENSIUN] Dedup completed! Unique: ${stats.unique}`);
    if (job) await job.progress(80);

    // Insert
    const insertStats = await batchInsert(knex, tableName, uniqueData, {/*...*/});
    if (job) await job.progress(95);

    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    log.info("[PROXY PENSIUN] ✅ Sync Completed Successfully!");
    log.info(`[PROXY PENSIUN] Total duration: ${totalDuration}s`);

    const result = {
      success: true,
      message: "Data berhasil disinkronisasi",
      total: allResults.length,
      inserted: insertStats.inserted,
      duplicates_removed: stats.duplicates,
    };
    
    if (job) await job.progress(100, result);
    return result;
  } catch (error) {
    log.error("[PROXY PENSIUN] ❌ Error syncing data", error);
    if (job)
      await job.progress(100, {
        success: false,
        message: "Gagal sinkronisasi",
        error: error.message,
      });
    throw error;
  }
};

// Queue handlers
const { handleSyncQueue, handleGetStatus } = require("@/utils/proxy-queue-helper");

const syncProxyPensiunQueue = (req, res) => {
  return handleSyncQueue("pensiun", req, res);
};

module.exports = {
  syncProxyPensiun,
  getProxyPensiun,
  syncProxyPensiunQueue,
  getProxySyncStatus: handleGetStatus,
};
```

### API Route (`pages/api/siasn/ws/admin/proxy/pensiun/sync.js`)

```javascript
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { syncProxyPensiunQueue } from "@/controller/siasn/proxy-siasn/proxy-pensiun.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

// GET untuk queue-based sync (non-blocking)
router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnTokenMiddleware)
  .get(syncProxyPensiunQueue);

export default router.handler();
```

---

## 🚀 How to Use

### Trigger Sync (with queue)
```bash
GET /api/siasn/ws/admin/proxy/[type]/sync
GET /api/siasn/ws/admin/proxy/[type]/sync?force=true  # Force re-sync
```

### Check Status
```bash
GET /api/siasn/ws/admin/proxy/status?jobId=proxy-[type]-xxx
```

### Debug Queue
```bash
GET /api/siasn/ws/admin/proxy/debug
```

---

## 📊 Expected Output

### Worker Console
```
🔔 [PROXY WORKER] Picked up [type] sync job: proxy-[type]-xxx
📋 [PROXY PROCESSOR] Received job proxy-[type]-xxx (type: [type], user: USER)
2025-11-16 14:00:00 [INFO]: [PROXY [TYPE]] Starting synchronization
2025-11-16 14:00:00 [INFO]: [PROXY [TYPE]] Clearing existing data...
2025-11-16 14:00:01 [INFO]: [PROXY [TYPE]] Table cleared successfully
2025-11-16 14:00:01 [INFO]: [PROXY [TYPE]] Starting data fetch...
2025-11-16 14:05:00 [INFO]: [PROXY [TYPE]] Fetch completed! Total: 23316 records
...
2025-11-16 14:10:00 [INFO]: [PROXY [TYPE]] ✅ Sync Completed Successfully!
✅ [PROXY PROCESSOR] Completed [type] sync job | Total: 23316, Inserted: 23000
✅ [PROXY WORKER] Completed [type] sync | Duration: 600s, Memory: 250MB
```

---

## 🔥 Quick Apply for Remaining Controllers

Untuk `pg_akademik`, `pg_profesi`, `skk`:

1. Copy pattern dari `proxy-pensiun.controller.js`
2. Find & replace:
   - `Pensiun` → `PgAkademik` / `PgProfesi` / `Skk`
   - `pensiun` → `pg_akademik` / `pg_profesi` / `skk`
   - `PENSIUN` → `PG AKADEMIK` / `PG PROFESI` / `SKK`
3. Update API routes (`sync.js`) untuk import queue handlers
4. Done! Test dengan `GET /api/siasn/ws/admin/proxy/[type]/sync`

---

## ⚙️ Configuration

### Redis Config (`jobs/config.js`)
```javascript
const redisConfig = {
  // ...
  // commandTimeout: 5000, // DISABLED - untuk long operations
};
```

### Queue Config
```javascript
{
  attempts: 3,
  timeout: 1800000, // 30 minutes
  backoff: { type: "exponential", delay: 5000 },
}
```

---

## 🐛 Troubleshooting

### Job stuck in "waiting" state
- Check if worker is running: `yarn worker:dev`
- Check Redis connection
- Check `proxyQueue.resume()` in `jobs/queue.js`

### Job ID changes every sync
- Use `force=true` to cleanup old jobs
- Check `getRunningSync` logic in `proxy-queue-helper.js`

### `[object Object]` in logs
- Already fixed in `jobs/queue.js` with `JSON.stringify`

### Command timeout errors
- Disabled `commandTimeout` in `jobs/config.js`
- Use smaller batch sizes for API calls

---

## 📚 Related Files

- `utils/proxy-queue-helper.js` - Generic queue handlers
- `jobs/queue.js` - Queue setup & graceful shutdown  
- `jobs/worker.js` - Worker process
- `jobs/processors/proxy.js` - Proxy job processor
- `README_PROXY_QUEUE.md` - Full documentation

---

**Pattern siap digunakan! Copy template di atas untuk implement remaining proxy types.** 🎉

