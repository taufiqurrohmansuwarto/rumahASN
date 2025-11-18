import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

const cleanupProxyQueue = async (req, res) => {
  try {
    const { proxyQueue } = require("@/jobs/queue");
    const { type } = req.query; // Optional: cleanup specific type only

    const [active, waiting, completed, failed] = await Promise.all([
      proxyQueue.getActive(),
      proxyQueue.getWaiting(),
      proxyQueue.getCompleted(),
      proxyQueue.getFailed(),
    ]);

    // Filter by type if provided
    const filterByType = (jobs) => {
      if (!type) return jobs;
      return jobs.filter((job) => job.data?.type === type);
    };

    const activeToClean = filterByType(active);
    const waitingToClean = filterByType(waiting);
    const completedToClean = filterByType(completed);
    const failedToClean = filterByType(failed);

    const allJobsToClean = [
      ...activeToClean,
      ...waitingToClean,
      ...completedToClean,
      ...failedToClean,
    ];

    if (allJobsToClean.length === 0) {
      return res.json({
        success: true,
        message: type
          ? `Tidak ada job ${type} untuk dibersihkan`
          : "Tidak ada job untuk dibersihkan",
        cleaned: 0,
      });
    }

    // Remove all jobs
    await Promise.all(allJobsToClean.map((job) => job.remove()));

    res.json({
      success: true,
      message: type
        ? `Berhasil membersihkan ${allJobsToClean.length} job ${type}`
        : `Berhasil membersihkan ${allJobsToClean.length} job`,
      cleaned: allJobsToClean.length,
      breakdown: {
        active: activeToClean.length,
        waiting: waitingToClean.length,
        completed: completedToClean.length,
        failed: failedToClean.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

router.use(auth).use(adminMiddleware).get(cleanupProxyQueue);

export default router.handler();
