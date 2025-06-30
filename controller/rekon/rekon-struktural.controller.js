import { handleError } from "@/utils/helper/controller-helper";
const { siasnQueue } = require("@/jobs/queue");

const SiasnEmployee = require("@/models/siasn-employees.model");

// ========================================
// HELPER FUNCTIONS - Reusable Utilities
// ========================================

/**
 * Validate SIASN request instance from middleware
 * @param {Object} req - Express request object
 * @returns {Object|null} siasnRequest instance or null if invalid
 */
const validateSiasnRequest = (req) => {
  const { siasnRequest } = req;
  
  if (!siasnRequest) {
    console.error("❌ [SIASN] SIASN request not available from middleware");
    return null;
  }
  
  return siasnRequest;
};

/**
 * Extract serializable config from axios instance
 * @param {Object} siasnRequest - Axios instance from middleware
 * @returns {Object} Serializable configuration object
 */
const extractSiasnConfig = (siasnRequest) => {
  return {
    baseURL: siasnRequest.defaults.baseURL,
    timeout: siasnRequest.defaults.timeout,
    headers: {
      'User-Agent': siasnRequest.defaults.headers['User-Agent'] || 'SIASN-Client'
    }
  };
};

/**
 * Get structural employees count and validate
 * @returns {Promise<Object>} { total, isValid, message }
 */
const getStructuralEmployeesCount = async () => {
  try {
    const totalCount = await SiasnEmployee.query()
      .where("jenis_jabatan_id", "=", "1")
      .whereNotNull("eselon_id")
      .count("* as count")
      .first();
    
    const total = parseInt(totalCount.count);
    
    if (total === 0) {
      return {
        total: 0,
        isValid: false,
        message: "No structural employees found to sync"
      };
    }
    
    return {
      total,
      isValid: true,
      message: `Found ${total} structural employees`
    };
  } catch (error) {
    console.error("❌ [STRUKTURAL] Error getting employees count:", error);
    throw error;
  }
};

/**
 * Create batch job data for queue processing
 * @param {Object} params - Job parameters
 * @returns {Object} Job data object
 */
const createBatchJobData = (params) => {
  const {
    batchSize,
    startIndex,
    totalRecords,
    batchNumber,
    totalBatches,
    siasnConfig,
    requestedBy,
  } = params;
  
  return {
    batchSize,
    startIndex,
    totalRecords,
    batchNumber,
    totalBatches,
    siasnConfig,
    requestedBy: requestedBy || 'system',
    requestedAt: new Date().toISOString()
  };
};

/**
 * Create batch job options for Bull queue
 * @param {number} batchIndex - Current batch index for delay calculation
 * @returns {Object} Bull job options
 */
const createBatchJobOptions = (batchIndex) => {
  return {
    priority: 10, // High priority for structural sync
    delay: batchIndex * 5000, // 5 second delay between batch starts
    attempts: 3,
    backoff: "exponential",
    removeOnComplete: 5,
    removeOnFail: 10,
  };
};

/**
 * Process batch jobs creation with proper error handling
 * @param {Object} params - Processing parameters
 * @returns {Promise<Array>} Array of created jobs
 */
const processBatchJobsCreation = async (params) => {
  const { total, batchSize, siasnConfig, requestedBy } = params;
  const totalBatches = Math.ceil(total / batchSize);
  const jobs = [];
  
  console.log(`📊 [STRUKTURAL] Creating ${totalBatches} batch jobs`);
  
  for (let i = 0; i < totalBatches; i++) {
    const startIndex = i * batchSize;
    
    const jobData = createBatchJobData({
      batchSize,
      startIndex,
      totalRecords: total,
      batchNumber: i + 1,
      totalBatches,
      siasnConfig,
      requestedBy
    });
    
    const jobOptions = createBatchJobOptions(i);
    
    try {
      const job = await siasnQueue.add("sync-structural-batch", jobData, jobOptions);
      
      jobs.push({
        jobId: job.id,
        batchNumber: i + 1,
        startIndex,
        endIndex: Math.min(startIndex + batchSize - 1, total - 1),
        status: 'queued'
      });
      
      console.log(`✅ [STRUKTURAL] Created job ${job.id} for batch ${i + 1}/${totalBatches}`);
    } catch (error) {
      console.error(`❌ [STRUKTURAL] Failed to create job for batch ${i + 1}:`, error);
      throw error;
    }
  }
  
  return jobs;
};

/**
 * Format response for successful job creation
 * @param {Object} params - Response parameters
 * @returns {Object} Formatted response object
 */
const formatSuccessResponse = (params) => {
  const { total, batchSize, jobs } = params;
  const totalBatches = jobs.length;
  
  return {
    message: "Structural sync jobs created successfully",
    total,
    batchSize,
    totalBatches,
    jobs: jobs.map(j => ({
      jobId: j.jobId,
      batch: `${j.batchNumber}/${totalBatches}`,
      range: `${j.startIndex}-${j.endIndex}`,
      status: j.status
    })),
    estimatedDuration: `${Math.ceil(totalBatches * 2)} minutes`,
    status: "queued",
    timestamp: new Date().toISOString()
  };
};

// ========================================
// MAIN CONTROLLER FUNCTIONS
// ========================================

/**
 * Main controller for syncing structural employee data via queue
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const syncRekonStruktural = async (req, res) => {
  try {
    console.log("🚀 [STRUKTURAL] Starting sync rekon struktural via queue");
    
    // Step 1: Validate SIASN request
    const siasnRequest = validateSiasnRequest(req);
    if (!siasnRequest) {
      return res.status(500).json({ 
        message: "SIASN request not available. Ensure siasnMiddleware is properly configured." 
      });
    }
    
    // Step 2: Get employees count and validate
    const { total, isValid, message } = await getStructuralEmployeesCount();
    
    if (!isValid) {
      return res.json({ 
        message,
        total: 0,
        batches: 0
      });
    }
    
    console.log(`📊 [STRUKTURAL] ${message}`);
    
    // Step 3: Extract SIASN config
    const siasnConfig = extractSiasnConfig(siasnRequest);
    
    // Step 4: Process batch jobs creation
    const batchSize = 10; // Configurable batch size
    const requestedBy = req.user?.custom_id || 'system';
    
    const jobs = await processBatchJobsCreation({
      total,
      batchSize,
      siasnConfig,
      requestedBy
    });
    
    console.log(`✅ [STRUKTURAL] Successfully created ${jobs.length} batch jobs`);
    
    // Step 5: Format and send response
    const response = formatSuccessResponse({ total, batchSize, jobs });
    res.json(response);
    
  } catch (error) {
    console.error("❌ [STRUKTURAL] Error in syncRekonStruktural:", error);
    handleError(res, error);
  }
};

// ========================================
// JOB STATUS UTILITIES
// ========================================

/**
 * Validate job ID parameter
 * @param {string} jobId - Job ID from request params
 * @returns {Object} { isValid, message }
 */
const validateJobId = (jobId) => {
  if (!jobId) {
    return { isValid: false, message: "Job ID is required" };
  }
  
  if (typeof jobId !== 'string' || jobId.trim() === '') {
    return { isValid: false, message: "Invalid job ID format" };
  }
  
  return { isValid: true, message: "Valid job ID" };
};

/**
 * Determine job status based on job properties
 * @param {Object} job - Bull job object
 * @returns {string} Job status
 */
const determineJobStatus = (job) => {
  if (job.finishedOn) {
    return job.failedReason ? "failed" : "completed";
  } else if (job.processedOn) {
    return "active";
  } else {
    return "waiting";
  }
};

/**
 * Format job data for response
 * @param {Object} job - Bull job object
 * @returns {Object} Formatted job data
 */
const formatJobData = (job) => {
  const status = determineJobStatus(job);
  
  return {
    id: job.id,
    name: job.name,
    data: {
      batchNumber: job.data.batchNumber,
      totalBatches: job.data.totalBatches,
      batchSize: job.data.batchSize,
      startIndex: job.data.startIndex,
      totalRecords: job.data.totalRecords,
      requestedBy: job.data.requestedBy,
      requestedAt: job.data.requestedAt
    },
    progress: job.progress(),
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    failedReason: job.failedReason,
    returnvalue: job.returnvalue,
    opts: {
      priority: job.opts.priority,
      attempts: job.opts.attempts,
      delay: job.opts.delay
    },
    status,
    timestamp: new Date().toISOString()
  };
};

/**
 * Get specific job status with detailed information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Validate job ID
    const { isValid, message } = validateJobId(jobId);
    if (!isValid) {
      return res.status(400).json({ message });
    }
    
    console.log(`🔍 [STRUKTURAL] Getting status for job: ${jobId}`);
    
    // Get job from queue
    const job = await siasnQueue.getJob(jobId);
    
    if (!job) {
      console.warn(`⚠️ [STRUKTURAL] Job not found: ${jobId}`);
      return res.status(404).json({ 
        message: "Job not found",
        jobId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Format and return job data
    const jobData = formatJobData(job);
    
    console.log(`✅ [STRUKTURAL] Job status retrieved: ${jobId} - ${jobData.status}`);
    res.json(jobData);
    
  } catch (error) {
    console.error(`❌ [STRUKTURAL] Error getting job status for ${req.params.jobId}:`, error);
    handleError(res, error);
  }
};

// ========================================
// BULK JOB STATUS UTILITIES
// ========================================

/**
 * Retrieve all jobs from different queue states
 * @returns {Promise<Array>} Array of all jobs from all states
 */
const getAllQueueJobs = async () => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      siasnQueue.getWaiting(),
      siasnQueue.getActive(),
      siasnQueue.getCompleted(),
      siasnQueue.getFailed()
    ]);
    
    return [...waiting, ...active, ...completed, ...failed];
  } catch (error) {
    console.error("❌ [STRUKTURAL] Error getting queue jobs:", error);
    throw error;
  }
};

/**
 * Filter and format structural jobs
 * @param {Array} allJobs - Array of all jobs
 * @returns {Array} Filtered and formatted structural jobs
 */
const filterStructuralJobs = (allJobs) => {
  return allJobs
    .filter(job => job.name === "sync-structural-batch")
    .map(job => ({
      id: job.id,
      name: job.name,
      batchNumber: job.data.batchNumber || 0,
      totalBatches: job.data.totalBatches || 0,
      startIndex: job.data.startIndex || 0,
      batchSize: job.data.batchSize || 0,
      requestedBy: job.data.requestedBy,
      requestedAt: job.data.requestedAt,
      progress: job.progress(),
      status: determineJobStatus(job),
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      result: job.returnvalue
    }))
    .sort((a, b) => (a.batchNumber || 0) - (b.batchNumber || 0));
};

/**
 * Calculate summary statistics for jobs
 * @param {Array} jobs - Array of formatted jobs
 * @returns {Object} Summary statistics
 */
const calculateJobsSummary = (jobs) => {
  const totalJobs = jobs.length;
  
  if (totalJobs === 0) {
    return {
      total: 0,
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      overallProgress: 0
    };
  }
  
  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});
  
  const completedJobs = statusCounts.completed || 0;
  const overallProgress = Math.floor((completedJobs / totalJobs) * 100);
  
  return {
    total: totalJobs,
    waiting: statusCounts.waiting || 0,
    active: statusCounts.active || 0,
    completed: completedJobs,
    failed: statusCounts.failed || 0,
    overallProgress
  };
};

/**
 * Get estimated completion time based on current progress
 * @param {Object} summary - Jobs summary object
 * @param {Array} jobs - Array of jobs
 * @returns {Object} Estimation data
 */
const calculateEstimation = (summary, jobs) => {
  if (summary.total === 0) {
    return { estimatedCompletion: null, remainingJobs: 0 };
  }
  
  const remainingJobs = summary.waiting + summary.active;
  const avgProcessingTimePerJob = 2; // minutes per job (configurable)
  const estimatedMinutes = remainingJobs * avgProcessingTimePerJob;
  
  let estimatedCompletion = null;
  if (remainingJobs > 0) {
    estimatedCompletion = new Date(Date.now() + estimatedMinutes * 60 * 1000).toISOString();
  }
  
  return {
    estimatedCompletion,
    remainingJobs,
    estimatedMinutes
  };
};

/**
 * Get comprehensive status of all structural sync jobs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllJobsStatus = async (req, res) => {
  try {
    console.log("📊 [STRUKTURAL] Getting status for all structural jobs");
    
    // Get all jobs from queue
    const allJobs = await getAllQueueJobs();
    
    // Filter and format structural jobs
    const structuralJobs = filterStructuralJobs(allJobs);
    
    // Calculate summary statistics
    const summary = calculateJobsSummary(structuralJobs);
    
    // Calculate estimations
    const estimation = calculateEstimation(summary, structuralJobs);
    
    console.log(`📈 [STRUKTURAL] Found ${structuralJobs.length} structural jobs - Progress: ${summary.overallProgress}%`);
    
    res.json({
      summary,
      estimation,
      jobs: structuralJobs,
      metadata: {
        totalJobsInQueue: allJobs.length,
        structuralJobsCount: structuralJobs.length,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ [STRUKTURAL] Error getting all jobs status:", error);
    handleError(res, error);
  }
};
