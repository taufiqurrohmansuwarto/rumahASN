# SIASN Proxy Services - Usage Guide

Complete services untuk SIASN Proxy operations di frontend.

## 📦 Installation

Services sudah tersedia di `services/siasn-proxy.services.js`

## 🚀 Usage Examples

### 1. **Sync Operations**

#### Basic Sync
```javascript
import { 
  syncProxyPangkat, 
  syncProxyPensiun,
  syncProxyPgAkademik,
  syncProxyPgProfesi,
  syncProxySkk
} from "@/services/siasn-proxy.services";

// Sync Pangkat
const result = await syncProxyPangkat();
console.log(result);
// {
//   success: true,
//   jobId: "proxy-pangkat-1763276727257",
//   status: "queued",
//   message: "Sinkronisasi dimulai di background"
// }

// Force re-sync (cleanup old jobs first)
const resultForce = await syncProxyPangkat(true);
// {
//   success: true,
//   jobId: "proxy-pangkat-1763276727257",
//   status: "queued",
//   message: "Semua job sebelumnya dibersihkan. Sinkronisasi baru dimulai",
//   forced: true
// }
```

#### Sync All Proxy Types at Once
```javascript
import { syncAllProxy } from "@/services/siasn-proxy.services";

const results = await syncAllProxy(false); // or true for force
console.log(results);
// {
//   pangkat: { status: "fulfilled", value: {...} },
//   pensiun: { status: "fulfilled", value: {...} },
//   pg_akademik: { status: "fulfilled", value: {...} },
//   pg_profesi: { status: "fulfilled", value: {...} },
//   skk: { status: "rejected", reason: Error(...) } // if failed
// }
```

---

### 2. **Check Job Status**

#### One-time Status Check
```javascript
import { getProxySyncStatus } from "@/services/siasn-proxy.services";

const status = await getProxySyncStatus("proxy-pangkat-1763276727257");
console.log(status);
// {
//   success: true,
//   found: true,
//   jobId: "proxy-pangkat-1763276727257",
//   type: "pangkat",
//   state: "active",
//   progress: 45,
//   progressInfo: {
//     stage: "fetching",
//     message: "Batch 10: offset=5000, fetched=5000/23316 (21%)",
//     offset: 5000,
//     currentTotal: 5000,
//     expectedTotal: 23316
//   },
//   createdAt: 1763276727257,
//   requestedBy: "IPUT TAUFIQURROHMAN SUWARTO S.Kom"
// }
```

#### Poll Status Until Complete
```javascript
import { pollJobStatus } from "@/services/siasn-proxy.services";

const finalStatus = await pollJobStatus(
  "proxy-pangkat-1763276727257",
  {
    interval: 2000,        // Poll every 2 seconds
    maxAttempts: 150,      // Max 5 minutes
    onProgress: (status) => {
      console.log(`Progress: ${status.progress}%`);
      if (status.progressInfo) {
        console.log(status.progressInfo.message);
      }
    }
  }
);

console.log("Job completed!", finalStatus.result);
// {
//   success: true,
//   message: "Data berhasil disinkronisasi",
//   total: 23316,
//   inserted: 23000,
//   duplicates_removed: 316
// }
```

---

### 3. **React Query Integration**

#### useSyncProxy Hook
```javascript
import { useMutation, useQuery } from "@tanstack/react-query";
import { syncProxyPangkat, getProxySyncStatus, pollJobStatus } from "@/services/siasn-proxy.services";
import { message } from "antd";

// Sync mutation
const useSyncProxyPangkat = () => {
  return useMutation({
    mutationFn: (force = false) => syncProxyPangkat(force),
    onSuccess: (data) => {
      message.success(`Sync dimulai! Job ID: ${data.jobId}`);
    },
    onError: (error) => {
      message.error(`Sync gagal: ${error.message}`);
    }
  });
};

// Status query (with polling)
const useProxyJobStatus = (jobId, options = {}) => {
  return useQuery({
    queryKey: ["proxy-job-status", jobId],
    queryFn: () => getProxySyncStatus(jobId),
    enabled: !!jobId,
    refetchInterval: options.autoRefresh ? 2000 : false,
    retry: false,
  });
};

// Usage in component
function ProxyPangkatSync() {
  const [jobId, setJobId] = useState(null);
  const sync = useSyncProxyPangkat();
  const status = useProxyJobStatus(jobId, { autoRefresh: true });

  const handleSync = async (force = false) => {
    const result = await sync.mutateAsync(force);
    setJobId(result.jobId);
  };

  return (
    <div>
      <Button onClick={() => handleSync(false)} loading={sync.isPending}>
        Sync Pangkat
      </Button>
      <Button onClick={() => handleSync(true)} loading={sync.isPending}>
        Force Sync
      </Button>
      
      {status.data && (
        <Progress 
          percent={status.data.progress} 
          status={status.data.state === "failed" ? "exception" : "active"}
        />
      )}
      
      {status.data?.progressInfo && (
        <Text>{status.data.progressInfo.message}</Text>
      )}
    </div>
  );
}
```

---

### 4. **Queue Management**

#### Debug Queue
```javascript
import { debugProxyQueue } from "@/services/siasn-proxy.services";

const queueInfo = await debugProxyQueue();
console.log(queueInfo);
// {
//   success: true,
//   summary: {
//     total: 5,
//     byStatus: { active: 1, waiting: 0, completed: 3, failed: 1 },
//     byType: { pangkat: 3, pensiun: 1, skk: 1 }
//   },
//   jobs: [
//     {
//       id: "proxy-pangkat-xxx",
//       type: "pangkat",
//       state: "active",
//       progress: 45,
//       createdAt: "2025-11-16T14:00:00.000Z",
//       requestedBy: "USER"
//     },
//     // ... more jobs
//   ]
// }
```

#### Cleanup Queue
```javascript
import { cleanupProxyQueue } from "@/services/siasn-proxy.services";

// Cleanup completed jobs only
const result = await cleanupProxyQueue({
  states: ["completed"]
});
console.log(result);
// { success: true, message: "Cleanup completed", removed: 5 }

// Cleanup all failed pangkat jobs
const result2 = await cleanupProxyQueue({
  states: ["failed"],
  type: "pangkat"
});
console.log(result2);
// { success: true, message: "Cleanup completed", removed: 2 }

// Cleanup all (active, waiting, completed, failed)
const result3 = await cleanupProxyQueue({
  states: ["active", "waiting", "completed", "failed"]
});
```

---

### 5. **Data Fetching**

#### Get List with Pagination
```javascript
import { getProxyPangkatList } from "@/services/siasn-proxy.services";

const data = await getProxyPangkatList({
  page: 1,
  limit: 10,
  nip: "198403182015031002",
  nama: "IQBAL",
  periode: "12-2025",
  skpd_id: "123"
});

console.log(data);
// {
//   success: true,
//   data: [...],
//   pagination: {
//     total: 100,
//     page: 1,
//     limit: 10,
//     totalPages: 10
//   }
// }
```

#### React Query Hook
```javascript
import { useQuery } from "@tanstack/react-query";
import { getProxyPangkatList } from "@/services/siasn-proxy.services";

const useProxyPangkatList = (params) => {
  return useQuery({
    queryKey: ["proxy-pangkat-list", params],
    queryFn: () => getProxyPangkatList(params),
    keepPreviousData: true,
  });
};

// Usage
function ProxyPangkatTable() {
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const { data, isLoading } = useProxyPangkatList(filters);

  return (
    <Table
      dataSource={data?.data}
      loading={isLoading}
      pagination={{
        current: data?.pagination.page,
        pageSize: data?.pagination.limit,
        total: data?.pagination.total,
        onChange: (page, limit) => setFilters({ ...filters, page, limit })
      }}
    />
  );
}
```

---

### 6. **Complete Admin Dashboard Example**

```javascript
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Progress, Tabs, Table, Modal, message } from "antd";
import {
  syncProxyPangkat,
  syncProxyPensiun,
  syncProxyPgAkademik,
  syncProxyPgProfesi,
  syncProxySkk,
  syncAllProxy,
  getProxySyncStatus,
  debugProxyQueue,
  cleanupProxyQueue,
  pollJobStatus,
} from "@/services/siasn-proxy.services";

function ProxyAdminDashboard() {
  const [activeJobs, setActiveJobs] = useState({});
  
  // Debug query
  const debugQuery = useQuery({
    queryKey: ["proxy-debug"],
    queryFn: debugProxyQueue,
    refetchInterval: 5000, // Auto-refresh every 5s
  });

  // Sync mutations
  const syncMutations = {
    pangkat: useMutation({ mutationFn: (force) => syncProxyPangkat(force) }),
    pensiun: useMutation({ mutationFn: (force) => syncProxyPensiun(force) }),
    pg_akademik: useMutation({ mutationFn: (force) => syncProxyPgAkademik(force) }),
    pg_profesi: useMutation({ mutationFn: (force) => syncProxyPgProfesi(force) }),
    skk: useMutation({ mutationFn: (force) => syncProxySkk(force) }),
    all: useMutation({ mutationFn: (force) => syncAllProxy(force) }),
  };

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: cleanupProxyQueue,
    onSuccess: () => {
      message.success("Cleanup berhasil!");
      debugQuery.refetch();
    },
  });

  const handleSync = async (type, force = false) => {
    try {
      const result = await syncMutations[type].mutateAsync(force);
      setActiveJobs(prev => ({ ...prev, [type]: result.jobId }));
      message.success(`Sync ${type} dimulai!`);
      
      // Start polling
      pollJobStatus(result.jobId, {
        onProgress: (status) => {
          // Update UI with progress
          console.log(`${type}: ${status.progress}%`);
        }
      }).then(() => {
        message.success(`Sync ${type} selesai!`);
        debugQuery.refetch();
      }).catch(err => {
        message.error(`Sync ${type} gagal: ${err.message}`);
      });
    } catch (error) {
      message.error(`Gagal memulai sync: ${error.message}`);
    }
  };

  const handleCleanup = (states, type = null) => {
    Modal.confirm({
      title: "Konfirmasi Cleanup",
      content: `Cleanup ${states.join(", ")} jobs${type ? ` untuk ${type}` : ""}?`,
      onOk: () => cleanupMutation.mutate({ states, type }),
    });
  };

  return (
    <div>
      <Card title="Proxy Sync Dashboard">
        <Tabs>
          <Tabs.TabPane tab="Sync" key="sync">
            <Button onClick={() => handleSync("pangkat")} loading={syncMutations.pangkat.isPending}>
              Sync Pangkat
            </Button>
            <Button onClick={() => handleSync("pensiun")} loading={syncMutations.pensiun.isPending}>
              Sync Pensiun
            </Button>
            <Button onClick={() => handleSync("pg_akademik")} loading={syncMutations.pg_akademik.isPending}>
              Sync PG Akademik
            </Button>
            <Button onClick={() => handleSync("pg_profesi")} loading={syncMutations.pg_profesi.isPending}>
              Sync PG Profesi
            </Button>
            <Button onClick={() => handleSync("skk")} loading={syncMutations.skk.isPending}>
              Sync SKK
            </Button>
            <Button 
              type="primary" 
              onClick={() => handleSync("all")} 
              loading={syncMutations.all.isPending}
            >
              Sync All
            </Button>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Queue Status" key="status">
            {debugQuery.isLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <p>Total Jobs: {debugQuery.data?.summary.total}</p>
                <p>Active: {debugQuery.data?.summary.byStatus.active}</p>
                <p>Completed: {debugQuery.data?.summary.byStatus.completed}</p>
                <p>Failed: {debugQuery.data?.summary.byStatus.failed}</p>
                
                <Table
                  dataSource={debugQuery.data?.jobs}
                  columns={[
                    { title: "Job ID", dataIndex: "id" },
                    { title: "Type", dataIndex: "type" },
                    { title: "State", dataIndex: "state" },
                    { 
                      title: "Progress", 
                      dataIndex: "progress",
                      render: (val) => <Progress percent={val} size="small" />
                    },
                    { title: "User", dataIndex: "requestedBy" },
                  ]}
                />
              </>
            )}
          </Tabs.TabPane>

          <Tabs.TabPane tab="Cleanup" key="cleanup">
            <Button onClick={() => handleCleanup(["completed"])}>
              Cleanup Completed
            </Button>
            <Button onClick={() => handleCleanup(["failed"])}>
              Cleanup Failed
            </Button>
            <Button danger onClick={() => handleCleanup(["active", "waiting", "completed", "failed"])}>
              Cleanup All
            </Button>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default ProxyAdminDashboard;
```

---

## 📚 API Reference

### Sync Operations
- `syncProxyPangkat(force?: boolean)` - Sync Kenaikan Pangkat
- `syncProxyPensiun(force?: boolean)` - Sync Pemberhentian/Pensiun
- `syncProxyPgAkademik(force?: boolean)` - Sync Peremajaan Gelar Akademik
- `syncProxyPgProfesi(force?: boolean)` - Sync Peremajaan Gelar Profesi
- `syncProxySkk(force?: boolean)` - Sync Surat Keterangan Kerja
- `syncAllProxy(force?: boolean)` - Sync all types at once

### Job Management
- `getProxySyncStatus(jobId: string)` - Get job status
- `pollJobStatus(jobId, options)` - Poll until complete/failed
- `debugProxyQueue()` - Get all jobs info
- `cleanupProxyQueue(options)` - Cleanup jobs

### Data Fetching
- `getProxyPangkatList(params)` - Get paginated list
- `getProxyPensiunList(params)` - Get paginated list
- `getProxyPgAkademikList(params)` - Get paginated list
- `getProxyPgProfesiList(params)` - Get paginated list
- `getProxySkkList(params)` - Get paginated list

---

## 🎯 Best Practices

1. **Always handle errors** with try-catch or React Query's error handling
2. **Use polling for long operations** instead of waiting synchronously
3. **Cleanup old jobs** regularly to prevent queue bloat
4. **Use force=true** only when necessary (clears all old jobs)
5. **Monitor progress** with `onProgress` callback or refetchInterval
6. **Provide user feedback** with loading states and messages

---

**Services siap digunakan! 🚀**

