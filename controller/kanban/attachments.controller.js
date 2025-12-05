const { handleError } = require("@/utils/helper/controller-helper");
const { uploadFilePublic } = require("@/utils/helper/minio-helper");
const KanbanTask = require("@/models/kanban/tasks.model");
const KanbanTaskAttachment = require("@/models/kanban/task-attachments.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");
const { nanoid } = require("nanoid");

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

    // Save to database as link type
    const attachment = await KanbanTaskAttachment.query().insert({
      id: nanoid(),
      task_id: taskId,
      filename: name || url,
      file_url: url,
      attachment_type: "link",
      uploaded_by: userId,
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

module.exports = {
  getAttachments,
  uploadAttachment,
  addLinkAttachment,
  deleteAttachment,
  getAttachmentUrl,
  getProjectStorageUsage,
};

