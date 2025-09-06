import { handleError } from "@/utils/helper/controller-helper";
import { uploadFileMinio } from "@/utils/index";
import { processContentWithAI } from "@/utils/services/ai-processing.services";
import {
  getContentsWithFilters,
  getContentById,
  getRelatedContents,
  updateViewsCount,
  createContent,
  updateContent,
  deleteContent,
  uploadContentAttachment,
  uploadContentMedia,
  getEncryptedUserId,
} from "@/utils/services/knowledge-content.services";
import { getAllCategories } from "@/utils/services/knowledge-category.services";

const KnowledgeContent = require("@/models/knowledge/contents.model");

// Helper functions moved to knowledge-content.services.js

export const getKnowledgeContents = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "created_at:desc",
      category_id = "",
      tags = "",
      type = "",
    } = req?.query;

    // Handle multiple tags from URL params (tag=tutorial&tag=javascript)
    const tagFilters = Array.isArray(req.query.tag)
      ? req.query.tag
      : req.query.tag
      ? [req.query.tag]
      : [];
    const allTags = tags ? tags.split(",").filter(Boolean) : [];
    const finalTags = [...new Set([...tagFilters, ...allTags])].filter(Boolean);

    // Use service instead of direct query
    const results = await getContentsWithFilters(
      {
        search,
        category_id,
        tags: finalTags,
        type,
        page,
        limit,
        sort,
        status: "published",
      },
      customId
    );

    res.json(results);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // Use service to get content with user interactions
    const content = await getContentById(
      id,
      { includeRelations: true },
      customId
    );

    if (!content) {
      return res.status(404).json({
        message: "Konten tidak ditemukan",
      });
    }

    await updateViewsCount(customId, id);

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const createKnowledgeContent = async (req, res) => {
  try {
    const body = req?.body;
    const { customId } = req?.user;

    // Use service to create content with references
    const content = await createContent(body, customId);

    // Trigger AI processing in background (don't wait for completion)
    setImmediate(async () => {
      try {
        console.log(`Triggering AI processing for new content: ${content.id}`);
        await processContentWithAI(content.id);
        console.log(`AI processing completed for content: ${content.id}`);
      } catch (aiError) {
        console.error(
          `AI processing failed for content ${content.id}:`,
          aiError.message
        );
        // Don't throw error - AI processing failure shouldn't affect content creation
      }
    });

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateKnowledgeContentPersonal = async (req, res) => {
  try {
    const { id } = req?.query;
    const body = req?.body;
    const { customId } = req?.user;

    // Use service to update content with references
    const updatedContent = await updateContent(id, body, customId);

    res.json(updatedContent);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // Use service to delete content
    const result = await deleteContent(id, customId);

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

// refs
export const getKnowledgeCategories = async (_req, res) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadKnowledgeContentAttachment = async (req, res) => {
  try {
    const files = req?.files || [];
    const { id: contentId } = req?.query;
    const { customId } = req?.user;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diunggah",
      });
    }

    // Use service to upload attachments
    const result = await uploadContentAttachment(contentId, files, customId);

    // Transform response to match expected format
    const uploadResults = result.attachments.map((attachment) => ({
      id: attachment.id,
      uid: `attachment-${attachment.id}`,
      name: attachment.filename,
      filename: attachment.filename,
      url: attachment.url,
      size: attachment.file_size,
      mimetype: attachment.file_type,
      status: "done",
    }));

    res.json({
      success: true,
      message: result.message,
      data: uploadResults,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadKnowledgeContentAttachmentAdmin = async (req, res) => {
  try {
    const files = req?.files || [];
    const { id: contentId } = req?.query;
    const { customId } = req?.user;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diunggah",
      });
    }

    // Use service to upload attachments (admin mode)
    const result = await uploadContentAttachment(
      contentId,
      files,
      customId,
      true
    );

    // Transform response to match expected format
    const uploadResults = result.attachments.map((attachment) => ({
      id: attachment.id,
      uid: `attachment-${attachment.id}`,
      name: attachment.filename,
      filename: attachment.filename,
      url: attachment.url,
      size: attachment.file_size,
      mimetype: attachment.file_type,
      status: "done",
    }));

    res.json({
      success: true,
      message: result.message,
      data: uploadResults,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Helper functions moved to knowledge-content.services.js for sorting logic

// Media upload functions
export const uploadKnowledgeContentMediaCreate = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "File media is required" });
    }

    // Validate file type for media
    const allowedTypes = ["image/", "video/", "audio/"];
    if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
      return res.status(400).json({
        message:
          "Invalid file type. Only image, video, and audio files are allowed",
      });
    }

    // Use service to upload media for content creation
    const uploadResults = await uploadContentMedia([file], customId);
    const mediaData = uploadResults[0];

    res.json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        url: mediaData.url,
        filename: mediaData.name,
        originalName: mediaData.name,
        size: mediaData.size,
        mimetype: mediaData.type,
        type: mediaData.type.startsWith("image/")
          ? "image"
          : mediaData.type.startsWith("video/")
          ? "video"
          : "audio",
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadKnowledgeContentMedia = async (req, res) => {
  try {
    const { mc } = req;
    const { customId } = req?.user;
    const { id: contentId } = req.query;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "File media is required" });
    }

    // Use service to check if content exists and user owns it
    const content = await getContentById(contentId, {
      includeRelations: false,
    });

    if (!content || content.author_id !== customId) {
      return res
        .status(404)
        .json({ message: "Content not found or access denied" });
    }

    // Validate file type for media
    const allowedTypes = ["image/", "video/", "audio/"];
    if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
      return res.status(400).json({
        message:
          "Invalid file type. Only image, video, and audio files are allowed",
      });
    }

    // Generate unique filename using service
    const timestamp = new Date().getTime();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const encryptedUserId = getEncryptedUserId(customId);
    const fileName = `knowledge-media/${encryptedUserId}/${timestamp}_${originalName}`;

    // Upload to MinIO
    await uploadFileMinio(mc, file.buffer, fileName, file.size, file.mimetype);

    const mediaUrl = `https://siasn.bkd.jatimprov.go.id:9000/public/${fileName}`;

    // Determine content type based on file mimetype
    const contentType = file.mimetype.startsWith("image/")
      ? "gambar"
      : file.mimetype.startsWith("video/")
      ? "video"
      : "audio";

    // Update content with media URL
    const updatedContent = await KnowledgeContent.query().patchAndFetchById(
      contentId,
      {
        type: contentType,
        source_url: mediaUrl,
        updated_at: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Media uploaded and content updated successfully",
      data: {
        content: updatedContent,
        media: {
          url: mediaUrl,
          filename: fileName,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          type: contentType,
        },
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadKnowledgeContentMediaAdmin = async (req, res) => {
  try {
    const { mc } = req;
    const { customId } = req?.user;
    const { id: contentId } = req.query;
    const { file } = req;

    if (!file) {
      return res.status(400).json({ message: "File media is required" });
    }

    // Use service to check if content exists (admin can edit any content)
    const content = await getContentById(contentId, {
      includeRelations: false,
    });

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Validate file type for media
    const allowedTypes = ["image/", "video/", "audio/"];
    if (!allowedTypes.some((type) => file.mimetype.startsWith(type))) {
      return res.status(400).json({
        message:
          "Invalid file type. Only image, video, and audio files are allowed",
      });
    }

    // Generate unique filename using service
    const timestamp = new Date().getTime();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const encryptedAdminId = getEncryptedUserId("admin_" + customId);
    const fileName = `knowledge-media/${encryptedAdminId}/${timestamp}_${originalName}`;

    // Upload to MinIO
    await uploadFileMinio(mc, file.buffer, fileName, file.size, file.mimetype);

    const mediaUrl = `https://siasn.bkd.jatimprov.go.id:9000/public/${fileName}`;

    // Determine content type based on file mimetype
    const contentType = file.mimetype.startsWith("image/")
      ? "gambar"
      : file.mimetype.startsWith("video/")
      ? "video"
      : "audio";

    // Update content with media URL
    const updatedContent = await KnowledgeContent.query().patchAndFetchById(
      contentId,
      {
        type: contentType,
        source_url: mediaUrl,
        updated_at: new Date(),
      }
    );

    res.json({
      success: true,
      message: "Media uploaded and content updated successfully by admin",
      data: {
        content: updatedContent,
        media: {
          url: mediaUrl,
          filename: fileName,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          type: contentType,
        },
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getContentRelated = async (req, res) => {
  try {
    const { id } = req?.query;

    // Use service to get related contents
    const relatedContents = await getRelatedContents(id, 5);

    res.json(relatedContents);
  } catch (error) {
    handleError(res, error);
  }
};
