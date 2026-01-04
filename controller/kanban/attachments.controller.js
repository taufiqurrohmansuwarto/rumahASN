const { handleError } = require("@/utils/helper/controller-helper");
const { uploadFilePublic } = require("@/utils/helper/minio-helper");
const KanbanTask = require("@/models/kanban/tasks.model");
const KanbanTaskAttachment = require("@/models/kanban/task-attachments.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");
const { nanoid } = require("nanoid");
const archiver = require("archiver");
const axios = require("axios");

/**
 * Get attachments for a task
 */
const getAttachments = async (req, res) => {
  try {
    const { taskId } = req?.query;

    const attachments = await KanbanTaskAttachment.getByTask(taskId);

    res.json(attachments);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Upload attachment to task
 */
const uploadAttachment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;
    const { mc } = req; // Minio client from middleware

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(task.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const { buffer, originalname, size, mimetype } = req.file;

    // Generate unique filename
    const ext = originalname.split(".").pop();
    const uniqueFilename = `kanban/${task.project_id}/${taskId}/${nanoid()}.${ext}`;

    // Upload to Minio
    await uploadFilePublic(mc, buffer, uniqueFilename, size, mimetype, {
      "uploaded-by": userId,
      "task-id": taskId,
      "original-name": originalname,
    });

    // Save to database
    const attachment = await KanbanTaskAttachment.addToTask({
      taskId,
      filename: originalname,
      filePath: uniqueFilename,
      fileSize: size,
      fileType: mimetype,
      uploadedBy: userId,
    });

    res.json(attachment);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Add link attachment
 */
const addLinkAttachment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;
    const { url, name } = req?.body;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(task.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    if (!url) {
      return res.status(400).json({ message: "URL wajib diisi" });
    }

    // Use model method to add link and log activity
    const attachment = await KanbanTaskAttachment.addLinkToTask({
      taskId,
      url,
      name,
      uploadedBy: userId,
    });

    res.json(attachment);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete attachment
 */
const deleteAttachment = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { attachmentId } = req?.query;

    const attachment = await KanbanTaskAttachment.query()
      .findById(attachmentId)
      .withGraphFetched("task");

    if (!attachment) {
      return res.status(404).json({ message: "Attachment tidak ditemukan" });
    }

    // Check permission (uploader or project admin)
    const isAdminOrOwner = await KanbanProjectMember.isAdminOrOwner(
      attachment.task.project_id,
      userId
    );

    if (attachment.uploaded_by !== userId && !isAdminOrOwner) {
      return res.status(403).json({ message: "Anda tidak dapat menghapus attachment ini" });
    }

    // Note: File in Minio will remain (optional: implement cleanup)
    await KanbanTaskAttachment.query().deleteById(attachmentId);

    res.json({ message: "Attachment berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get attachment download URL
 */
const getAttachmentUrl = async (req, res) => {
  try {
    const { attachmentId } = req?.query;

    const attachment = await KanbanTaskAttachment.query().findById(attachmentId);

    if (!attachment) {
      return res.status(404).json({ message: "Attachment tidak ditemukan" });
    }

    // Generate public URL
    const baseUrl = process.env.MINIO_PUBLIC_URL || "https://siasn.bkd.jatimprov.go.id:9000";
    const url = `${baseUrl}/public/${attachment.file_path}`;

    res.json({
      url,
      filename: attachment.filename,
      file_type: attachment.file_type,
      file_size: attachment.file_size,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get all attachments for a project with pagination and filters
 */
const getProjectAttachments = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const {
      page = 1,
      limit = 20,
      search = "",
      type = "", // file, link, or empty for all
    } = req?.query;

    // Check permission
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    const result = await KanbanTaskAttachment.getByProject({
      projectId,
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      type,
    });

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get total storage used by project
 */
const getProjectStorageUsage = async (req, res) => {
  try {
    const { projectId } = req?.query;

    const totalSize = await KanbanTaskAttachment.getTotalSizeForProject(projectId);

    // Format to human readable
    const formatBytes = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    res.json({
      total_bytes: totalSize,
      total_formatted: formatBytes(totalSize),
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Download all attachments as ZIP
 */
const downloadAllAttachments = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { taskId } = req?.query;

    const task = await KanbanTask.query().findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // Check permission
    const isMember = await KanbanProjectMember.isMember(task.project_id, userId);
    if (!isMember) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Get all file attachments (not links)
    const attachments = await KanbanTaskAttachment.query()
      .where("task_id", taskId)
      .where("attachment_type", "file")
      .orWhere((builder) => {
        builder.where("task_id", taskId).whereNull("attachment_type");
      });

    if (attachments.length === 0) {
      return res.status(400).json({ message: "Tidak ada file untuk didownload" });
    }

    // Set response headers for ZIP download
    const zipFilename = `lampiran_${task.task_number || taskId}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${zipFilename}"`);

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 5 }, // Compression level
    });

    // Handle archive errors
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      throw err;
    });

    // Pipe archive to response
    archive.pipe(res);

    // Base URL for files
    const baseUrl =
      process.env.MINIO_PUBLIC_URL || "https://siasn.bkd.jatimprov.go.id:9000";

    // Add each file to archive
    for (const attachment of attachments) {
      try {
        const fileUrl = `${baseUrl}/public/${attachment.file_path}`;
        
        // Fetch file from URL
        const response = await axios({
          method: "GET",
          url: fileUrl,
          responseType: "arraybuffer",
          timeout: 30000, // 30 second timeout per file
        });

        // Add to archive with original filename
        archive.append(Buffer.from(response.data), {
          name: attachment.filename || `file_${attachment.id}`,
        });
      } catch (fileError) {
        console.error(`Error downloading file ${attachment.filename}:`, fileError.message);
        // Continue with other files even if one fails
      }
    }

    // Finalize archive
    await archive.finalize();
  } catch (error) {
    console.error("Download all attachments error:", error);
    handleError(res, error);
  }
};

module.exports = {
  getAttachments,
  uploadAttachment,
  addLinkAttachment,
  deleteAttachment,
  getAttachmentUrl,
  getProjectStorageUsage,
  getProjectAttachments,
  downloadAllAttachments,
};

