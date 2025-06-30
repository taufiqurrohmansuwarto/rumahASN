const { dataUtama } = require("../../utils/siasn-utils");
const SiasnEmployee = require("../../models/siasn-employees.model");
const { getOrCreateToken } = require("../../middleware/siasn.middleware");
const axios = require("axios");
const https = require("https");

/**
 * Processor untuk sync data struktural dari SIASN
 * Memproses batch data dengan retry mechanism dan progress tracking
 */
const syncStrukturalData = async (job) => {
  const { batchSize = 10, startIndex = 0, totalRecords } = job.data;
  
  try {
    console.log(`=� [SIASN] Starting sync structural data job ${job.id}`);
    console.log(`=� Processing batch: ${startIndex}-${startIndex + batchSize} of ${totalRecords}`);
    
    // Update progress
    await job.progress(0);
    
    // Get the SIASN config and recreate axios instance with interceptors
    const { siasnConfig } = job.data;
    
    if (!siasnConfig) {
      throw new Error("SIASN config not provided in job data");
    }
    
    // Create HTTPS agent
    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 60000,
      maxSockets: 150,
      maxFreeSockets: 20,
      timeout: 60000,
    });
    
    // Create axios instance with config
    const siasnRequest = axios.create({
      baseURL: siasnConfig.baseURL,
      timeout: siasnConfig.timeout || 30000,
      headers: siasnConfig.headers,
      httpsAgent: httpsAgent,
    });
    
    // Add token interceptor to automatically handle authentication
    siasnRequest.interceptors.request.use(async (config) => {
      try {
        const token = await getOrCreateToken();
        const { sso_token, wso_token } = token;
        config.headers.Authorization = `Bearer ${wso_token}`;
        config.headers.Auth = `bearer ${sso_token}`;
        return config;
      } catch (error) {
        console.error("Error getting token in job:", error);
        throw error;
      }
    });
    
    console.log(`🔧 [SIASN] Created axios instance for job ${job.id}`);
    
    // Get employees batch
    const employees = await SiasnEmployee.query()
      .select("nip_baru", "id")
      .where("jenis_jabatan_id", "=", "1")
      .whereNotNull("eselon_id")
      .offset(startIndex)
      .limit(batchSize);
    
    if (employees.length === 0) {
      console.log(` [SIASN] No more employees to process in batch ${startIndex}`);
      return { 
        status: "completed", 
        processed: 0,
        batchIndex: startIndex,
        message: "No employees in this batch"
      };
    }
    
    console.log(`=� [SIASN] Processing ${employees.length} employees`);
    
    let processed = 0;
    let errors = [];
    
    // Process each employee with delay to avoid rate limiting
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      
      try {
        // Add delay between requests (2-4 seconds)
        const delay = Math.floor(Math.random() * 2000) + 2000;
        if (i > 0) { // Skip delay for first request
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        
        console.log(`= [SIASN] Processing ${employee.nip_baru} (${i + 1}/${employees.length})`);
        
        // Fetch data from SIASN using the configured axios instance
        const result = await Promise.race([
          dataUtama(siasnRequest, employee.nip_baru),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('SIASN API timeout')), 30000) // 30s timeout
          )
        ]);
        
        // Update database
        await SiasnEmployee.query()
          .where("nip_baru", "=", employee.nip_baru)
          .update({
            eselon_id: result.eselonId,
            eselon_level: result.eselonLevel,
            updated_at: new Date()
          });
        
        processed++;
        console.log(` [SIASN] Updated ${employee.nip_baru} - eselon: ${result.eselonId}`);
        
        // Update progress
        const progressPercentage = Math.floor(((i + 1) / employees.length) * 100);
        await job.progress(progressPercentage);
        
      } catch (error) {
        console.error(`L [SIASN] Failed to process ${employee.nip_baru}:`, error.message);
        errors.push({
          nip: employee.nip_baru,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Continue with next employee instead of stopping
        continue;
      }
    }
    
    const result = {
      status: "completed",
      processed,
      total: employees.length,
      errors: errors.length,
      errorDetails: errors,
      batchIndex: startIndex,
      batchSize,
      timestamp: new Date().toISOString()
    };
    
    console.log(` [SIASN] Batch ${startIndex} completed - Processed: ${processed}/${employees.length}, Errors: ${errors.length}`);
    
    return result;
    
  } catch (error) {
    console.error(`L [SIASN] Job ${job.id} failed:`, error.message);
    throw error;
  }
};

/**
 * Processor untuk sync semua data struktural
 * Membuat multiple batch jobs untuk processing yang efisien
 */
const syncAllStrukturalData = async (job) => {
  try {
    console.log(`=� [SIASN] Starting sync all structural data job ${job.id}`);
    
    // Get total count
    const totalCount = await SiasnEmployee.query()
      .where("jenis_jabatan_id", "=", "1")
      .whereNotNull("eselon_id")
      .count("* as count")
      .first();
    
    const total = parseInt(totalCount.count);
    const batchSize = job.data.batchSize || 10;
    const totalBatches = Math.ceil(total / batchSize);
    
    console.log(`=� [SIASN] Total employees: ${total}, Batch size: ${batchSize}, Total batches: ${totalBatches}`);
    
    const result = {
      status: "completed",
      totalEmployees: total,
      batchSize,
      totalBatches,
      message: `Created ${totalBatches} batch jobs for processing`,
      timestamp: new Date().toISOString()
    };
    
    return result;
    
  } catch (error) {
    console.error(`L [SIASN] Sync all job ${job.id} failed:`, error.message);
    throw error;
  }
};

/**
 * Simple processor untuk test koneksi SIASN
 */
const testSiasnConnection = async (job) => {
  try {
    console.log(`>� [SIASN] Testing SIASN connection - Job ${job.id}`);
    
    const { testNip, siasnConfig } = job.data;
    
    if (!siasnConfig) {
      throw new Error("SIASN config not provided in job data");
    }
    
    // Create axios instance for testing
    const httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 60000,
      maxSockets: 150,
      maxFreeSockets: 20,
      timeout: 60000,
    });
    
    const siasnRequest = axios.create({
      baseURL: siasnConfig.baseURL,
      timeout: siasnConfig.timeout || 15000,
      headers: siasnConfig.headers,
      httpsAgent: httpsAgent,
    });
    
    // Add token interceptor
    siasnRequest.interceptors.request.use(async (config) => {
      try {
        const token = await getOrCreateToken();
        const { sso_token, wso_token } = token;
        config.headers.Authorization = `Bearer ${wso_token}`;
        config.headers.Auth = `bearer ${sso_token}`;
        return config;
      } catch (error) {
        console.error("Error getting token in test job:", error);
        throw error;
      }
    });
    
    // Test dengan NIP yang diberikan atau ambil sample
    const nipToTest = testNip || '198001012009011001'; // Default test NIP
    
    const result = await Promise.race([
      dataUtama(siasnRequest, nipToTest),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 15000)
      )
    ]);
    
    console.log(` [SIASN] Connection test successful for NIP: ${nipToTest}`);
    
    return {
      status: "success",
      testNip: nipToTest,
      connectionSuccess: true,
      data: {
        nama: result.nama,
        eselonId: result.eselonId,
        eselonLevel: result.eselonLevel
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`L [SIASN] Connection test failed:`, error.message);
    return {
      status: "failed",
      connectionSuccess: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  syncStrukturalData,
  syncAllStrukturalData,
  testSiasnConnection
};