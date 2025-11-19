import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

const debugProxyQueue = async (req, res) => {
  try {
    const { getAllProxyJobs } = require("@/utils/proxy-queue-helper");

    // Get all jobs
    const allJobs = await getAllProxyJobs();

    // Group by type
    const byType = {};
    const allJobsList = [
      ...allJobs.active,
      ...allJobs.waiting,
      ...allJobs.completed,
      ...allJobs.failed,
    ];

    allJobsList.forEach((job) => {
      const type = job.data?.type || "unknown";
      if (!byType[type]) {
        byType[type] = { active: 0, waiting: 0, completed: 0, failed: 0 };
      }
      byType[type][job.state]++;
    });

    // Format jobs as flat array with state
    const jobsArray = [
      ...allJobs.active.map((j) => ({
        id: j.id,
        type: j.data?.type,
        state: "active",
        progress: j.progress || 0,
        requestedBy: j.data?.requestedBy?.username || j.data?.requestedBy || "System",
        createdAt: j.timestamp,
      })),
      ...allJobs.waiting.map((j) => ({
        id: j.id,
        type: j.data?.type,
        state: "waiting",
        progress: 0,
        requestedBy: j.data?.requestedBy?.username || j.data?.requestedBy || "System",
        createdAt: j.timestamp,
      })),
      ...allJobs.completed.map((j) => ({
        id: j.id,
        type: j.data?.type,
        state: "completed",
        progress: 100,
        requestedBy: j.data?.requestedBy?.username || j.data?.requestedBy || "System",
        finishedAt: j.finishedOn,
      })),
      ...allJobs.failed.map((j) => ({
        id: j.id,
        type: j.data?.type,
        state: "failed",
        progress: j.progress || 0,
        requestedBy: j.data?.requestedBy?.username || j.data?.requestedBy || "System",
        finishedAt: j.finishedOn,
        error: j.failedReason,
      })),
    ];

    res.json({
      success: true,
      summary: {
        total: allJobsList.length,
        byStatus: {
          active: allJobs.active.length,
          waiting: allJobs.waiting.length,
          completed: allJobs.completed.length,
          failed: allJobs.failed.length,
        },
      },
      byType,
      jobs: jobsArray,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

router.use(auth).use(adminMiddleware).get(debugProxyQueue);

export default router.handler();
