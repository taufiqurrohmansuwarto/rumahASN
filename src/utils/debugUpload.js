// Debug utility for upload operations
export const debugUploadState = {
  logFileUpload: (stage, data) => {
    console.log(`🔍 [UPLOAD ${stage}]:`, data);
  },

  logAttachmentChange: (stage, attachments, meta = {}) => {
    console.log(`📎 [ATTACHMENT ${stage}]:`, {
      count: attachments.length,
      attachments: attachments.map((a) => ({
        id: a.id,
        name: a.filename || a.file_name,
        size: a.size || a.file_size,
      })),
      meta,
    });
  },
};
