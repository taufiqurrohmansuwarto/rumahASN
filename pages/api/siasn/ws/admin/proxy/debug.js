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

    res.json({
      success: true,
      summary: {
        total: allJobsList.length,
        active: allJobs.active.length,
        waiting: allJobs.waiting.length,
        completed: allJobs.completed.length,
        failed: allJobs.failed.length,
      },
      byType,
      jobs: {
        active: allJobs.active.map((j) => ({
          id: j.id,
          type: j.data?.type,
          progress: j.progress,
          createdAt: j.timestamp,
        })),
        waiting: allJobs.waiting.map((j) => ({
          id: j.id,
          type: j.data?.type,
          createdAt: j.timestamp,
        })),
        completed: allJobs.completed.map((j) => ({
          id: j.id,
          type: j.data?.type,
          finishedAt: j.finishedOn,
        })),
        failed: allJobs.failed.map((j) => ({
          id: j.id,
          type: j.data?.type,
          finishedAt: j.finishedOn,
          error: j.failedReason,
        })),
      },
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
