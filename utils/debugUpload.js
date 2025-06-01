// utils/debugUpload.js
// Helper untuk debug masalah upload - SIMPLIFIED VERSION

const isDev = process.env.NODE_ENV === "development";

export const debugUploadState = {
  logFileUpload: (stage, data) => {
    if (isDev) {
      console.log(`🔵 UPLOAD ${stage}:`, data);
    }
  },

  logAttachmentChange: (stage, attachments, context = {}) => {
    if (isDev) {
      console.log(`📎 ATTACHMENT ${stage}:`, {
        count: attachments.length,
        context,
        attachments: attachments.map((att, idx) => ({
          index: idx,
          id: att.id,
          filename: att.filename || att.file_name,
          size: att.size || att.file_size,
        })),
      });
    }
  },

  logFormSubmit: (payload) => {
    if (isDev) {
      console.log(`📤 FORM SUBMIT:`, {
        recipients: payload.recipients,
        attachmentIds: payload.attachments,
        attachmentCount: payload.attachments?.length || 0,
      });
    }
  },

  // ✅ FIXED: Simple validation
  validateAttachmentStructure: (attachments) => {
    const issues = [];

    if (!Array.isArray(attachments)) {
      issues.push("Attachments is not an array");
      return issues;
    }

    attachments.forEach((att, idx) => {
      if (!att.id && !att.response?.data?.id && !att.response?.id) {
        issues.push(`Attachment ${idx}: Missing ID`);
      }

      if (!att.filename && !att.file_name) {
        issues.push(`Attachment ${idx}: Missing filename`);
      }
    });

    if (issues.length > 0 && isDev) {
      console.warn("🚨 ATTACHMENT VALIDATION ISSUES:", issues);
    }

    return issues;
  },
};

// ✅ ADDED: Helper to extract attachment IDs safely
export const extractAttachmentIds = (attachments) => {
  if (!Array.isArray(attachments)) {
    console.warn(
      "🚨 extractAttachmentIds: attachments is not an array",
      attachments
    );
    return [];
  }

  const ids = attachments
    .map((att) => {
      // Check different possible ID locations
      if (att.response?.data?.id) {
        return att.response.data.id;
      }
      if (att.response?.id) {
        return att.response.id;
      }
      if (att.id) {
        return att.id;
      }

      console.warn("🚨 extractAttachmentIds: No ID found for attachment", att);
      return null;
    })
    .filter(Boolean); // Remove null/undefined values

  if (isDev) {
    console.log("📎 Extracted attachment IDs:", ids);
  }

  return ids;
};

// Wrapper untuk upload functions dengan debug
export const debugUploadWrapper = (originalFunction, functionName) => {
  return async (...args) => {
    debugUploadState.logFileUpload(`${functionName} - START`, {
      args: args.map((arg) =>
        arg instanceof File
          ? { name: arg.name, size: arg.size, type: arg.type }
          : Array.isArray(arg) && arg[0] instanceof File
          ? arg.map((f) => ({ name: f.name, size: f.size, type: f.type }))
          : arg
      ),
    });

    try {
      const result = await originalFunction(...args);

      debugUploadState.logFileUpload(`${functionName} - SUCCESS`, {
        result: result?.data || result,
      });

      return result;
    } catch (error) {
      debugUploadState.logFileUpload(`${functionName} - ERROR`, {
        error: error.message,
        fullError: error,
      });
      throw error;
    }
  };
};
