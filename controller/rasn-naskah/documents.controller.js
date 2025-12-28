/**
 * Documents Controller - RASN Naskah
 * CRUD operations untuk dokumen naskah dinas
 */

const { handleError } = require("@/utils/helper/controller-helper");
const Documents = require("@/models/rasn-naskah/documents.model");
const DocumentVersions = require("@/models/rasn-naskah/document-versions.model");
const DocumentAttachments = require("@/models/rasn-naskah/document-attachments.model");
const DocumentActivities = require("@/models/rasn-naskah/document-activities.model");
const Bookmarks = require("@/models/rasn-naskah/bookmarks.model");
const Templates = require("@/models/rasn-naskah/templates.model");
const OpenAI = require("openai");

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get all documents for current user
 */
const getDocuments = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      source_type,
      sort = "created_at",
      order = "desc",
    } = req?.query;

    let query = Documents.query()
      .where("user_id", userId)
      .modify("notArchived");

    // Filter by status
    if (status) {
      query = query.where("status", status);
    }

    // Filter by category
    if (category) {
      query = query.where("category", category);
    }

    // Filter by source_type
    if (source_type) {
      query = query.where("source_type", source_type);
    }

    // Search by title
    if (search) {
      query = query.where("title", "ilike", `%${search}%`);
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count();

    // Pagination and sorting
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const documents = await query
      .select(
        "id",
        "title",
        "category",
        "source_type",
        "status",
        "latest_score",
        "review_count",
        "revision_count",
        "created_at",
        "updated_at"
      )
      .orderBy(sort, order)
      .limit(parseInt(limit))
      .offset(offset);

    // Add bookmark status
    const documentIds = documents.map((d) => d.id);
    const bookmarks = await Bookmarks.query()
      .where("user_id", userId)
      .whereIn("document_id", documentIds);

    const bookmarkSet = new Set(bookmarks.map((b) => b.document_id));
    const documentsWithBookmark = documents.map((doc) => ({
      ...doc,
      is_bookmarked: bookmarkSet.has(doc.id),
    }));

    res.json({
      data: documentsWithBookmark,
      meta: {
        total: parseInt(count),
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(parseInt(count) / parseInt(limit)),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get single document detail
 */
const getDocument = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;

    const document = await Documents.query()
      .findById(documentId)
      .withGraphFetched(
        "[template, versions(orderByVersion), reviews(orderByRecent).[issues], attachments]"
      )
      .modifiers({
        orderByVersion(builder) {
          builder.orderBy("version_number", "desc").limit(5);
        },
        orderByRecent(builder) {
          builder.orderBy("created_at", "desc").limit(5);
        },
      });

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    // Check ownership
    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Get bookmark status
    const isBookmarked = await Bookmarks.isBookmarked(userId, documentId);

    res.json({
      ...document,
      is_bookmarked: isBookmarked,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Create new document
 */
const createDocument = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      title,
      content,
      category,
      source_type,
      template_id,
      document_type,
      description,
      recipient,
    } = req?.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Judul dokumen wajib diisi" });
    }

    // Determine source type - default to "ai_generated" if content exists but no source_type
    const finalSourceType =
      source_type || (content ? "ai_generated" : "manual");

    // If using template, get template content
    let templateContent = null;
    if (template_id) {
      const template = await Templates.query().findById(template_id);
      if (template) {
        templateContent = template.content;
        // Increment usage count
        await Templates.incrementUsage(template_id);
      }
    }

    // Create document
    const document = await Documents.query().insert({
      user_id: userId,
      template_id,
      title,
      content: content || templateContent,
      category: category || document_type,
      source_type: finalSourceType,
      status: "draft",
      metadata: {
        description,
        recipient,
        document_type,
      },
    });

    // Create initial version if content exists
    if (content || templateContent) {
      await DocumentVersions.query().insert({
        document_id: document.id,
        version_number: 1,
        content: content || templateContent,
        change_summary: "Versi awal",
        created_by: userId,
      });

      await Documents.query()
        .findById(document.id)
        .patch({ revision_count: 1 });
    }

    // Log activity
    await DocumentActivities.log(
      document.id,
      userId,
      "created",
      { source_type: finalSourceType, template_id, document_type },
      `Dokumen "${title}" dibuat`
    );

    res.status(201).json({ data: document });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update document
 */
const updateDocument = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;
    const { title, content, category, status } = req?.body;

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Prepare update data
    const updateData = {};
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    // If content changed, create new version
    if (content && content !== document.content) {
      updateData.content = content;

      const latestVersion = await DocumentVersions.query()
        .where("document_id", documentId)
        .orderBy("version_number", "desc")
        .first();

      const newVersionNumber = latestVersion
        ? latestVersion.version_number + 1
        : 1;

      await DocumentVersions.query().insert({
        document_id: documentId,
        version_number: newVersionNumber,
        content,
        change_summary: "Konten diperbarui",
        created_by: userId,
      });

      updateData.revision_count = newVersionNumber;
    }

    const updatedDocument = await Documents.query().patchAndFetchById(
      documentId,
      updateData
    );

    // Log activity
    await DocumentActivities.log(
      documentId,
      userId,
      "edited",
      { updated_fields: Object.keys(updateData) },
      `Dokumen diperbarui`
    );

    res.json(updatedDocument);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Delete document (soft delete - archive)
 */
const deleteDocument = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Soft delete - set status to archived
    await Documents.query().findById(documentId).patch({ status: "archived" });

    // Log activity
    await DocumentActivities.log(
      documentId,
      userId,
      "archived",
      null,
      `Dokumen diarsipkan`
    );

    res.json({ message: "Dokumen berhasil diarsipkan" });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get bookmarked documents
 */
const getBookmarkedDocuments = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { page = 1, limit = 20 } = req?.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const bookmarks = await Bookmarks.query()
      .where("user_id", userId)
      .withGraphFetched("document")
      .orderBy("created_at", "desc")
      .limit(parseInt(limit))
      .offset(offset);

    const [{ count }] = await Bookmarks.query()
      .where("user_id", userId)
      .count();

    const documents = bookmarks
      .filter((b) => b.document && b.document.status !== "archived")
      .map((b) => ({
        ...b.document,
        bookmark_note: b.note,
        bookmarked_at: b.created_at,
        is_bookmarked: true,
      }));

    res.json({
      data: documents,
      meta: {
        total: parseInt(count),
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Toggle bookmark
 */
const toggleBookmark = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;
    const { note } = req?.body;

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    const result = await Bookmarks.toggle(userId, documentId, note);

    // Log activity
    await DocumentActivities.log(
      documentId,
      userId,
      result.action === "added" ? "bookmarked" : "unbookmarked",
      null,
      result.action === "added" ? "Dokumen ditandai" : "Tanda dokumen dihapus"
    );

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get document activity timeline
 */
const getDocumentActivities = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;
    const { limit = 50 } = req?.query;

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const activities = await DocumentActivities.getTimeline(
      documentId,
      parseInt(limit)
    );

    res.json(activities);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get document versions
 */
const getDocumentVersions = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { documentId } = req?.query;

    const document = await Documents.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    if (document.user_id !== userId) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const versions = await DocumentVersions.query()
      .where("document_id", documentId)
      .withGraphFetched("creator(simpleWithImage)")
      .orderBy("version_number", "desc");

    res.json(versions);
  } catch (error) {
    handleError(res, error);
  }
};

// OpenAI Vector Store ID for rules/regulations
const OPENAI_VECTOR_STORE_ID = "vs_694f64215f1c8191a2d2491cbe8135dc";
const ASSISTANT_ID = "asst_UwCRChfc0Cd2BlhqghohwxYW";

/**
 * Generate document content using OpenAI Assistants API
 * Uses pre-configured assistant with vector store
 */
const generateDocument = async (req, res) => {
  let threadId = null;

  try {
    const { document_type, recipient, description } = req?.body;

    // Validate required fields
    if (!document_type) {
      return res.status(400).json({ message: "Jenis dokumen wajib diisi" });
    }
    if (!recipient) {
      return res.status(400).json({ message: "Penerima wajib diisi" });
    }
    if (!description) {
      return res.status(400).json({ message: "Deskripsi wajib diisi" });
    }

    // Document type labels
    const documentTypes = {
      nota_dinas: "Nota Dinas",
      surat_dinas: "Surat Dinas",
      undangan: "Surat Undangan",
      surat_tugas: "Surat Tugas",
      pengumuman: "Pengumuman",
      surat_edaran: "Surat Edaran",
      laporan: "Laporan",
    };

    const documentLabel = documentTypes[document_type] || document_type;

    // User message - ketat hanya dari vector store
    const userMessage = `Buatkan ${documentLabel} lengkap.

Tujuan: ${recipient}
Maksud: ${description}

WAJIB: Gunakan HANYA informasi dari file yang tersedia. Jangan gunakan pengetahuan di luar file.`;

    console.log(`🤖 [GENERATE] Creating ${documentLabel} using Assistant API`);

    // Create thread
    const thread = await openai.beta.threads.create();
    threadId = thread.id;

    // Add message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    // Run assistant
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: ASSISTANT_ID,
    });

    if (run.status !== "completed") {
      throw new Error(`Run failed with status: ${run.status}`);
    }

    // Get messages
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find((m) => m.role === "assistant");

    if (!assistantMessage) {
      throw new Error("No response from assistant");
    }

    // Extract text content
    let content = "";
    for (const block of assistantMessage.content) {
      if (block.type === "text") {
        content = block.text.value;
        break;
      }
    }

    console.log(`✅ [GENERATE] Document generated successfully`);

    // Clean up - remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```[\w]*\n?/, "").replace(/```$/, "");
    }
    content = content.trim();

    // Cleanup thread
    try {
      await openai.beta.threads.delete(threadId);
      console.log(`🧹 [GENERATE] Thread ${threadId} deleted`);
    } catch (cleanupError) {
      console.warn(`⚠️ [GENERATE] Failed to delete thread: ${cleanupError.message}`);
    }

    res.json({
      content,
      document_type,
      recipient,
    });
  } catch (error) {
    console.error("Generate document error:", error);

    // Cleanup thread on error
    if (threadId) {
      try {
        await openai.beta.threads.delete(threadId);
      } catch (cleanupError) {
        console.warn(`⚠️ [GENERATE] Failed to delete thread on error: ${cleanupError.message}`);
      }
    }

    handleError(res, error);
  }
};

module.exports = {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getBookmarkedDocuments,
  toggleBookmark,
  getDocumentActivities,
  getDocumentVersions,
  generateDocument,
};
