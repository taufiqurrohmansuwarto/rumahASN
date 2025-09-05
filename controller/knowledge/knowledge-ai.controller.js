import { handleError } from "@/utils/helper/controller-helper";
import {
  generateSummary,
  extractKeywords,
  calculateReadabilityScore,
  generateAITags,
  processContentWithAI
} from "@/utils/services/ai-processing.services";

const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeAiMetadata = require("@/models/knowledge/knowledge-ai-metadata.model");

// ===== TEST ENDPOINTS (Development) =====

/**
 * Test AI summary generation
 * POST /api/knowledge/ai/test-summary
 */
export const testSummaryGeneration = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title dan content diperlukan untuk testing"
      });
    }

    const summary = await generateSummary(title, content);

    res.json({
      success: true,
      message: "Test summary generation berhasil",
      data: {
        input: { title, content: content.substring(0, 100) + "..." },
        output: { summary },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in testSummaryGeneration:", error);
    handleError(res, error);
  }
};

/**
 * Test AI keyword extraction
 * POST /api/knowledge/ai/test-keywords
 */
export const testKeywordExtraction = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title dan content diperlukan untuk testing"
      });
    }

    const keywords = await extractKeywords(title, content);

    res.json({
      success: true,
      message: "Test keyword extraction berhasil",
      data: {
        input: { title, content: content.substring(0, 100) + "..." },
        output: { keywords, keywordCount: keywords.length },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in testKeywordExtraction:", error);
    handleError(res, error);
  }
};

/**
 * Test AI tag generation
 * POST /api/knowledge/ai/test-tags
 */
export const testTagGeneration = async (req, res) => {
  try {
    const { title, content, existingTags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title dan content diperlukan untuk testing"
      });
    }

    const aiTags = await generateAITags(title, content, existingTags);

    res.json({
      success: true,
      message: "Test tag generation berhasil",
      data: {
        input: { 
          title, 
          content: content.substring(0, 100) + "...",
          existingTags 
        },
        output: { 
          aiTags, 
          tagCount: aiTags.length,
          newTagsOnly: aiTags.filter(tag => 
            !existingTags.map(t => t.toLowerCase()).includes(tag.toLowerCase())
          )
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in testTagGeneration:", error);
    handleError(res, error);
  }
};

/**
 * Test readability score calculation
 * POST /api/knowledge/ai/test-readability
 */
export const testReadabilityScore = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Content diperlukan untuk testing readability"
      });
    }

    const readabilityScore = await calculateReadabilityScore(content);

    // Determine readability level
    let readabilityLevel = "Sangat Sulit";
    if (readabilityScore >= 80) readabilityLevel = "Sangat Mudah";
    else if (readabilityScore >= 70) readabilityLevel = "Mudah";
    else if (readabilityScore >= 60) readabilityLevel = "Sedang";
    else if (readabilityScore >= 50) readabilityLevel = "Cukup Sulit";
    else if (readabilityScore >= 30) readabilityLevel = "Sulit";

    res.json({
      success: true,
      message: "Test readability score berhasil",
      data: {
        input: { 
          content: content.substring(0, 100) + "...",
          contentLength: content.length 
        },
        output: { 
          readabilityScore,
          readabilityLevel,
          description: `Konten dengan skor ${readabilityScore}/100 termasuk kategori ${readabilityLevel}`
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error in testReadabilityScore:", error);
    handleError(res, error);
  }
};

// ===== MAIN AI PROCESSING ENDPOINTS =====

/**
 * Process content with AI by content ID
 * POST /api/knowledge/ai/process-content/:id
 */
export const processContentAI = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Content ID diperlukan"
      });
    }

    // Check if content exists
    const content = await KnowledgeContent.query().findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Konten tidak ditemukan"
      });
    }

    // Check if already processing
    const existingAI = await KnowledgeAiMetadata.query()
      .where('content_id', id)
      .where('processing_status', 'processing')
      .first();

    if (existingAI) {
      return res.status(409).json({
        success: false,
        message: "Konten sedang diproses AI, mohon tunggu"
      });
    }

    // Process with AI
    const result = await processContentWithAI(id);

    if (result.success) {
      res.json({
        success: true,
        message: "AI processing berhasil",
        data: {
          contentId: id,
          contentTitle: content.title,
          aiResults: {
            summary: result.summary,
            keywords: result.keywords,
            aiTags: result.aiTags,
            readabilityScore: result.readabilityScore,
            qualityScore: result.qualityScore
          },
          processedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: "AI processing gagal",
        error: result.error
      });
    }

  } catch (error) {
    console.error("Error in processContentAI:", error);
    handleError(res, error);
  }
};

/**
 * Get AI insights for content
 * GET /api/knowledge/ai/insights/:id
 */
export const getContentAIInsights = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Content ID diperlukan"
      });
    }

    // Get AI metadata for content
    const aiMetadata = await KnowledgeAiMetadata.query()
      .where('content_id', id)
      .withGraphFetched('knowledgeContent.[category, author(simpleWithImage)]')
      .first();

    if (!aiMetadata) {
      return res.status(404).json({
        success: false,
        message: "AI insights belum tersedia untuk konten ini"
      });
    }

    res.json({
      success: true,
      message: "AI insights ditemukan",
      data: {
        contentInfo: {
          id: aiMetadata.knowledgeContent.id,
          title: aiMetadata.knowledgeContent.title,
          category: aiMetadata.knowledgeContent.category?.name,
          author: aiMetadata.knowledgeContent.author?.username,
          status: aiMetadata.knowledgeContent.status
        },
        aiInsights: {
          summary: aiMetadata.ai_summary,
          keywords: aiMetadata.ai_keywords,
          tags: aiMetadata.ai_tags,
          readabilityScore: aiMetadata.ai_readability_score,
          qualityScore: aiMetadata.ai_quality_score,
          sentimentScore: aiMetadata.ai_sentiment_score,
          completenessScore: aiMetadata.ai_completeness_score,
          suggestedCategory: aiMetadata.ai_suggested_category,
          confidenceScore: aiMetadata.ai_confidence_score,
          relatedContent: aiMetadata.ai_related_content,
          suggestions: aiMetadata.ai_suggestions,
          seoKeywords: aiMetadata.ai_seo_keywords,
          metaDescription: aiMetadata.ai_meta_description
        },
        processingInfo: {
          status: aiMetadata.processing_status,
          lastProcessed: aiMetadata.last_processed,
          modelVersion: aiMetadata.model_version,
          errorMessage: aiMetadata.error_message
        }
      }
    });

  } catch (error) {
    console.error("Error in getContentAIInsights:", error);
    handleError(res, error);
  }
};

/**
 * Reprocess content with AI
 * POST /api/knowledge/ai/reprocess/:id
 */
export const reprocessContentAI = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Content ID diperlukan"
      });
    }

    // Check if content exists
    const content = await KnowledgeContent.query().findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Konten tidak ditemukan"
      });
    }

    // Delete existing AI metadata to force reprocessing
    await KnowledgeAiMetadata.query()
      .where('content_id', id)
      .delete();

    // Process with AI
    const result = await processContentWithAI(id);

    if (result.success) {
      res.json({
        success: true,
        message: "AI reprocessing berhasil",
        data: {
          contentId: id,
          contentTitle: content.title,
          aiResults: {
            summary: result.summary,
            keywords: result.keywords,
            aiTags: result.aiTags,
            readabilityScore: result.readabilityScore,
            qualityScore: result.qualityScore
          },
          reprocessedAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: "AI reprocessing gagal",
        error: result.error
      });
    }

  } catch (error) {
    console.error("Error in reprocessContentAI:", error);
    handleError(res, error);
  }
};

/**
 * Get AI processing status
 * GET /api/knowledge/ai/status/:id
 */
export const getAIProcessingStatus = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Content ID diperlukan"
      });
    }

    const aiMetadata = await KnowledgeAiMetadata.query()
      .where('content_id', id)
      .select([
        'processing_status',
        'last_processed',
        'error_message',
        'model_version',
        'created_at',
        'updated_at'
      ])
      .first();

    if (!aiMetadata) {
      return res.json({
        success: true,
        data: {
          contentId: id,
          status: 'not_processed',
          message: 'Konten belum diproses dengan AI'
        }
      });
    }

    res.json({
      success: true,
      data: {
        contentId: id,
        status: aiMetadata.processing_status,
        lastProcessed: aiMetadata.last_processed,
        errorMessage: aiMetadata.error_message,
        modelVersion: aiMetadata.model_version,
        createdAt: aiMetadata.created_at,
        updatedAt: aiMetadata.updated_at
      }
    });

  } catch (error) {
    console.error("Error in getAIProcessingStatus:", error);
    handleError(res, error);
  }
};

/**
 * Bulk process multiple contents with AI
 * POST /api/knowledge/ai/bulk-process
 */
export const bulkProcessContents = async (req, res) => {
  try {
    const { contentIds, filters = {} } = req.body;
    let targetContentIds = [];

    // If contentIds provided, use them
    if (contentIds && Array.isArray(contentIds)) {
      targetContentIds = contentIds;
    } else {
      // Otherwise use filters to get content IDs
      let query = KnowledgeContent.query().select('id');
      
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      if (filters.category_id) {
        query = query.where('category_id', filters.category_id);
      }
      if (filters.author_id) {
        query = query.where('author_id', filters.author_id);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const contents = await query;
      targetContentIds = contents.map(c => c.id);
    }

    if (targetContentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada konten yang ditemukan untuk diproses"
      });
    }

    // Limit bulk processing to prevent overload
    if (targetContentIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Maksimal 50 konten per bulk processing"
      });
    }

    // Process all contents
    const results = {
      total: targetContentIds.length,
      successful: 0,
      failed: 0,
      details: []
    };

    for (const contentId of targetContentIds) {
      try {
        const result = await processContentWithAI(contentId);
        
        if (result.success) {
          results.successful++;
          results.details.push({
            contentId,
            status: 'success',
            message: 'AI processing berhasil'
          });
        } else {
          results.failed++;
          results.details.push({
            contentId,
            status: 'failed',
            message: result.error || 'AI processing gagal'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          contentId,
          status: 'failed',
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk processing selesai: ${results.successful} berhasil, ${results.failed} gagal`,
      data: results
    });

  } catch (error) {
    console.error("Error in bulkProcessContents:", error);
    handleError(res, error);
  }
};

/**
 * Get AI processing statistics
 * GET /api/knowledge/ai/stats
 */
export const getAIProcessingStats = async (_req, res) => {
  try {
    // Get processing status counts
    const statusStats = await KnowledgeAiMetadata.query()
      .groupBy('processing_status')
      .select('processing_status')
      .count('* as count')
      .then(results => {
        const stats = {
          total: 0,
          completed: 0,
          processing: 0,
          failed: 0,
          pending: 0
        };

        results.forEach(result => {
          const status = result.processing_status || 'pending';
          const count = parseInt(result.count);
          stats[status] = count;
          stats.total += count;
        });

        return stats;
      });

    // Get total content count and processed percentage
    const totalContents = await KnowledgeContent.query().count('* as count').first();
    const totalContentCount = parseInt(totalContents.count);
    const processedCount = statusStats.total;
    const processedPercentage = totalContentCount > 0 
      ? ((processedCount / totalContentCount) * 100).toFixed(2)
      : 0;

    // Get recent processing activity
    const recentActivity = await KnowledgeAiMetadata.query()
      .withGraphFetched('knowledgeContent(selectBasic)')
      .orderBy('last_processed', 'desc')
      .limit(10)
      .select([
        'content_id',
        'processing_status', 
        'last_processed',
        'ai_quality_score',
        'error_message'
      ]);

    res.json({
      success: true,
      data: {
        processingStats: statusStats,
        overview: {
          totalContents: totalContentCount,
          processedContents: processedCount,
          unprocessedContents: totalContentCount - processedCount,
          processedPercentage: parseFloat(processedPercentage)
        },
        recentActivity: recentActivity.map(item => ({
          contentId: item.content_id,
          contentTitle: item.knowledgeContent?.title,
          status: item.processing_status,
          qualityScore: item.ai_quality_score,
          lastProcessed: item.last_processed,
          hasError: !!item.error_message
        }))
      }
    });

  } catch (error) {
    console.error("Error in getAIProcessingStats:", error);
    handleError(res, error);
  }
};