const { log } = require("@/utils/logger");

/**
 * Get proxy queue instance
 * Lazy load to avoid circular dependency
 */
const getProxyQueue = () => {
  const { proxyQueue } = require("@/jobs/queue");
  return proxyQueue;
};

/**
 * Check if sync is already running for this type
 * @param {string} type - Proxy type (pangkat, pensiun, etc)
 * @returns {Promise<Object|null>} Running job or null
 */
const getRunningSync = async (type) => {
  try {
    const proxyQueue = getProxyQueue();

    const [activeJobs, waitingJobs] = await Promise.all([
      proxyQueue.getActive(),
      proxyQueue.getWaiting(),
    ]);

    log.info(
      `[PROXY] Checking running sync for ${type}: ${activeJobs.length} active, ${waitingJobs.length} waiting`
    );

    const allJobs = [...activeJobs, ...waitingJobs];
    const runningJob = allJobs.find((job) => job.data.type === type);

    if (runningJob) {
      log.info(
        `[PROXY] Found existing ${type} job ${runningJob.id}, returning it`
      );
      return runningJob;
    }

    log.info(`[PROXY] No running/waiting ${type} job found`);
    return null;
  } catch (error) {
    log.error(`[PROXY] Error checking running sync for ${type}`, error);
    return null;
  }
};

/**
 * Get last sync job (completed or failed) for this type
 * @param {string} type - Proxy type (pangkat, pensiun, etc)
 * @returns {Promise<Object|null>} Last job or null
 */
const getLastSyncJob = async (type) => {
  try {
    const proxyQueue = getProxyQueue();

    const [completed, failed] = await Promise.all([
      proxyQueue.getCompleted(),
      proxyQueue.getFailed(),
    ]);

    // Get all jobs of this type
    const allJobs = [...completed, ...failed]
      .filter((job) => job.data.type === type)
      .sort((a, b) => b.finishedOn - a.finishedOn); // Sort by finished time, newest first

    return allJobs[0] || null; // Return most recent job
  } catch (error) {
    log.error(`[PROXY] Error getting last sync job for ${type}`, error);
    return null;
  }
};

/**
 * Create proxy sync job
 * @param {string} type - Proxy type
 * @param {Object} params - Job parameters
 * @returns {Promise<Object>} Created job
 */
const createProxySyncJob = async (type, { token, user }) => {
  try {
    const proxyQueue = getProxyQueue();

    const job = await proxyQueue.add(
      "sync-proxy",
      {
        type,
        token,
        requestedBy: {
          id: user.id,
          username: user.username,
          current_role: user.current_role,
          organization_id: user.organization_id,
        },
      },
      {
        attempts: 3,
        timeout: 1800000, // 30 minutes
        removeOnComplete: 10,
        removeOnFail: 50,
        jobId: `proxy-${type}-${Date.now()}`, // Unique job ID
      }
    );

    log.info(`[PROXY] Created ${type} sync job`, {
      jobId: job.id,
      requestedBy: user.username,
    });

    return job;
  } catch (error) {
    log.error(`[PROXY] Error creating ${type} sync job`, error);
    throw error;
  }
};

/**
 * Get job status by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object>} Job status
 */
const getJobStatus = async (jobId) => {
  try {
    const proxyQueue = getProxyQueue();
    const job = await proxyQueue.getJob(jobId);

    if (!job) {
      log.warn(`[PROXY] Job ${jobId} not found in queue`);
      return {
        found: false,
        jobId,
        message:
          "Job tidak ditemukan. Mungkin sudah di-cleanup atau tidak pernah ada.",
      };
    }

    const [state, progressData] = await Promise.all([
      job.getState(),
      job.progress(),
    ]);

    // Extract progress info
    const progress =
      typeof progressData === "number"
        ? progressData
        : progressData?.progress || 0;
    const progressInfo = typeof progressData === "object" ? progressData : {};

    const result = {
      found: true,
      jobId: job.id,
      type: job.data.type,
      state,
      progress,
      progressInfo, // Include detailed progress info (stage, message, offset, currentTotal, etc)
      createdAt: job.timestamp,
      requestedBy: job.data.requestedBy?.username,
    };

    // Add result if completed
    if (state === "completed") {
      result.result = job.returnvalue;
      result.completedAt = job.finishedOn;
    }

    // Add error if failed
    if (state === "failed") {
      result.error = job.failedReason;
      result.failedAt = job.finishedOn;
      result.stackTrace = job.stacktrace;
    }

    return result;
  } catch (error) {
    log.error(`[PROXY] Error getting job status for ${jobId}`, error);
    throw error;
  }
};

/**
 * Get all proxy jobs (active, waiting, completed, failed)
 * @param {string} type - Optional: filter by proxy type
 * @returns {Promise<Object>} All jobs grouped by status
 */
const getAllProxyJobs = async (type = null) => {
  try {
    const proxyQueue = getProxyQueue();

    const [active, waiting, completed, failed] = await Promise.all([
      proxyQueue.getActive(),
      proxyQueue.getWaiting(),
      proxyQueue.getCompleted(),
      proxyQueue.getFailed(),
    ]);

    const filterByType = (jobs) => {
      if (!type) return jobs;
      return jobs.filter((job) => job.data.type === type);
    };

    return {
      active: filterByType(active).map((j) => ({
        id: j.id,
        type: j.data.type,
        progress: j._progress,
      })),
      waiting: filterByType(waiting).map((j) => ({
        id: j.id,
        type: j.data.type,
      })),
      completed: filterByType(completed).map((j) => ({
        id: j.id,
        type: j.data.type,
        finishedOn: j.finishedOn,
      })),
      failed: filterByType(failed).map((j) => ({
        id: j.id,
        type: j.data.type,
        failedReason: j.failedReason,
      })),
    };
  } catch (error) {
    log.error("[PROXY] Error getting all proxy jobs", error);
    throw error;
  }
};

/**
 * Generic sync queue handler untuk semua proxy types
 * @param {string} type - Proxy type (pangkat, pensiun, pg_akademik, pg_profesi, skk)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const handleSyncQueue = async (type, req, res) => {
  try {
    const { token, user, query } = req;
    const force = query?.force === "true" || query?.force === true;

    log.info(
      `[PROXY] Sync request: type=${type}, user=${user?.username}, force=${force}`
    );

    // Check running/waiting job
    const runningJob = await getRunningSync(type);
    if (runningJob && !force) {
      const jobState = await runningJob.getState();
      log.info(
        `[PROXY] Found existing job: ${runningJob.id}, state=${jobState}`
      );

      return res.status(409).json({
        success: false,
        message:
          "Sinkronisasi masih berjalan. Gunakan force=true untuk mengulang.",
        status: jobState,
        jobId: runningJob.id,
      });
    }

    // Check last completed/failed job
    const lastJob = await getLastSyncJob(type);
    if (lastJob && !force) {
      const jobState = await lastJob.getState();
      const minutesAgo = Math.floor(
        (Date.now() - lastJob.finishedOn) / 1000 / 60
      );

      log.info(`[PROXY] Last sync ${jobState} ${minutesAgo} minutes ago`);

      return res.status(200).json({
        success: true,
        message: `Sinkronisasi terakhir ${
          jobState === "completed" ? "berhasil" : "gagal"
        } ${minutesAgo} menit yang lalu. Gunakan force=true untuk sync ulang.`,
        status: jobState,
        jobId: lastJob.id,
        lastSync: {
          finishedAt: lastJob.finishedOn,
          minutesAgo,
          result: lastJob.returnvalue,
        },
      });
    }

    // Force cleanup
    if (force) {
      log.info(`[PROXY] Force sync, cleaning up all ${type} jobs`);

      const proxyQueue = getProxyQueue();
      const [active, waiting, completed, failed] = await Promise.all([
        proxyQueue.getActive(),
        proxyQueue.getWaiting(),
        proxyQueue.getCompleted(),
        proxyQueue.getFailed(),
      ]);

      const allJobs = [...active, ...waiting, ...completed, ...failed].filter(
        (job) => job.data.type === type
      );

      if (allJobs.length > 0) {
        await Promise.all(allJobs.map((job) => job.remove()));
        log.info(`[PROXY] Removed ${allJobs.length} old ${type} jobs`);
      }
    }

    // Create new job
    const job = await createProxySyncJob(type, { token, user });

    log.info(`[PROXY] Created new job: ${job.id}`);

    return res.json({
      success: true,
      message: force
        ? "Semua job sebelumnya dibersihkan. Sinkronisasi baru dimulai di background"
        : "Sinkronisasi dimulai di background",
      status: "queued",
      jobId: job.id,
      forced: force,
    });
  } catch (error) {
    log.error(`[PROXY] Error in sync queue for ${type}`, error);
    return res.status(500).json({
      success: false,
      message: "Gagal memulai sinkronisasi",
      error: error.message,
    });
  }
};

/**
 * Generic status handler untuk semua proxy types
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const handleGetStatus = async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId parameter required",
      });
    }

    const status = await getJobStatus(jobId);

    if (!status.found) {
      return res.status(404).json({
        success: false,
        message: "Job tidak ditemukan",
        jobId,
      });
    }

    return res.json({
      success: true,
      ...status,
    });
  } catch (error) {
    log.error("[PROXY] Error getting status", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil status",
      error: error.message,
    });
  }
};

module.exports = {
  getRunningSync,
  getLastSyncJob,
  createProxySyncJob,
  getJobStatus,
  getAllProxyJobs,
  handleSyncQueue,
  handleGetStatus,
};
