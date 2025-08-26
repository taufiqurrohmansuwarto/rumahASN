import { handleError } from "@/utils/helper/controller-helper";
import { uploadFileMinio } from "@/utils/index";

const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeCategory = require("@/models/knowledge/categories.model");
const KnowledgeContentAttachment = require("@/models/knowledge/content-attachments.model");
const UserInteraction = require("@/models/knowledge/user-interactions.model");

const BASE_URL = "https://siasn.bkd.jatimprov.go.id:9000/public";

// Fungsi untuk mengelola jumlah views konten
const updateViewsCount = async (customId, contentId) => {
  try {
    // Cek apakah user sudah pernah melihat konten ini
    const existingView = await UserInteraction.query()
      .where("user_id", customId)
      .where("content_id", contentId)
      .where("interaction_type", "view")
      .first();

    // Jika belum pernah melihat, catat view dan increment counter
    if (!existingView) {
      // Catat interaksi view user
      await UserInteraction.query().insert({
        user_id: customId,
        content_id: contentId,
        interaction_type: "view",
      });

      // Tambah 1 ke views_count konten
      await KnowledgeContent.query()
        .where("id", contentId)
        .increment("views_count", 1);
    }

    return !existingView; // Return true jika view baru, false jika sudah pernah
  } catch (error) {
    console.error("Error saat update views count:", error);
    throw new Error("Gagal mengupdate jumlah views");
  }
};

export const getKnowledgeContents = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "created_at", // Default: created_at DESC (terbaru)
      category_id = "",
      tags = "",
    } = req?.query;

    // Handle multiple tags from URL params (tag=tutorial&tag=javascript)
    const tagFilters = Array.isArray(req.query.tag) ? req.query.tag : (req.query.tag ? [req.query.tag] : []);
    const allTags = tags ? tags.split(',').filter(Boolean) : [];
    const finalTags = [...new Set([...tagFilters, ...allTags])].filter(Boolean);
    const contents = await KnowledgeContent.query()
      .andWhere((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .andWhere((builder) => {
        if (category_id) {
          builder.where("category_id", category_id);
        }
      })
      .andWhere((builder) => {
        if (finalTags.length > 0) {
          // Check if any of the selected tags exist in the content tags
          builder.where((subBuilder) => {
            finalTags.forEach(tag => {
              subBuilder.orWhereRaw("tags @> ?", [JSON.stringify([tag])]);
            });
          });
        }
      })
      .select(
        "knowledge.contents.id",
        "knowledge.contents.title",
        "knowledge.contents.summary",
        "knowledge.contents.author_id",
        "knowledge.contents.category_id",
        "knowledge.contents.status",
        "knowledge.contents.tags",
        "knowledge.contents.likes_count",
        "knowledge.contents.comments_count",
        "knowledge.contents.views_count",
        "knowledge.contents.bookmarks_count",
        "knowledge.contents.created_at",
        "knowledge.contents.updated_at",
        // Subquery untuk is_liked
        KnowledgeContent.relatedQuery("user_interactions")
          .where("user_id", customId)
          .where("interaction_type", "like")
          .select(
            KnowledgeContent.raw(
              "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
            )
          )
          .as("is_liked"),
        // Subquery untuk is_bookmarked
        KnowledgeContent.relatedQuery("user_interactions")
          .where("user_id", customId)
          .where("interaction_type", "bookmark")
          .select(
            KnowledgeContent.raw(
              "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
            )
          )
          .as("is_bookmarked")
      )
      .andWhere("status", "published")
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage)]"
      )
      .orderBy(getSortField(sort), getSortDirection(sort))
      .page(page - 1, limit);

    const data = {
      data: contents?.results,
      total: contents?.total,
      page: contents?.page || 1,
      limit: contents?.limit || 10,
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const content = await KnowledgeContent.query()
      .where("knowledge.contents.id", id)
      .andWhere("knowledge.contents.status", "published")
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
      )
      .select(
        "knowledge.contents.*",
        // Subquery untuk is_liked
        KnowledgeContent.relatedQuery("user_interactions")
          .where("user_id", customId)
          .where("interaction_type", "like")
          .select(
            KnowledgeContent.raw(
              "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
            )
          )
          .as("is_liked"),
        // Subquery untuk is_bookmarked
        KnowledgeContent.relatedQuery("user_interactions")
          .where("user_id", customId)
          .where("interaction_type", "bookmark")
          .select(
            KnowledgeContent.raw(
              "CASE WHEN COUNT(*) > 0 THEN true ELSE false END"
            )
          )
          .as("is_bookmarked")
      )
      .first();

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

    const payload = {
      ...body,
      tags: JSON.stringify(body?.tags),
      author_id: customId,
    };

    // Menggunakan transaction untuk memastikan konsistensi data
    const content = await KnowledgeContent.transaction(async (trx) => {
      // Insert content terlebih dahulu
      const newContent = await KnowledgeContent.query(trx).insert(payload);

      // Insert references menggunakan relation jika ada
      if (body?.references && body.references.length > 0) {
        await newContent.$relatedQuery("references", trx).insert(
          body.references.map((reference) => ({
            title: reference.title,
            url: reference.url,
          }))
        );
      }

      return newContent;
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

    const payload = {
      ...body,
      tags: JSON.stringify(body?.tags),
      updated_at: new Date(),
    };

    // Use transaction for consistency when updating content and references
    const updatedContent = await KnowledgeContent.transaction(async (trx) => {
      // Update the main content
      await KnowledgeContent.query(trx)
        .where("id", id)
        .andWhere("author_id", customId)
        .update(payload);

      // Get the existing content to work with references
      const existingContent = await KnowledgeContent.query(trx)
        .where("id", id)
        .andWhere("author_id", customId)
        .first();

      if (!existingContent) {
        throw new Error("Content tidak ditemukan atau tidak dapat diupdate");
      }

      // Handle references if provided
      if (body?.references !== undefined) {
        // Delete existing references
        await existingContent.$relatedQuery("references", trx).delete();
        
        // Insert new references if any
        if (body.references && body.references.length > 0) {
          await existingContent.$relatedQuery("references", trx).insert(
            body.references.map((reference) => ({
              title: reference.title,
              url: reference.url,
            }))
          );
        }
      }

      // Return the updated content with relations
      return await KnowledgeContent.query(trx)
        .where("id", id)
        .andWhere("author_id", customId)
        .withGraphFetched("[references]")
        .first();
    });

    res.json(updatedContent);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeContent = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const content = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .delete();

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

// refs
export const getKnowledgeCategories = async (req, res) => {
  try {
    const categories = await KnowledgeCategory.query();
    res.json(categories);
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadKnowledgeContentAttachment = async (req, res) => {
  try {
    const mc = req?.mc;
    const files = req?.files || [];
    const { id: content_id } = req?.query;

    if (!mc) {
      return res.status(500).json({
        success: false,
        message: "Minio client tidak tersedia",
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diunggah",
      });
    }

    const uploadResults = [];

    for (const file of files) {
      const filename = `${content_id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}-${file?.originalname.replace(/\s+/g, "-")}`;
      const fileSize = file?.size;
      const mimetype = file?.mimetype;
      const buffer = Buffer.from(file?.buffer);

      await uploadFileMinio(mc, buffer, filename, fileSize, mimetype);

      const attachment = await KnowledgeContentAttachment.query().insert({
        content_id,
        url: `${BASE_URL}/${filename}`,
        name: file?.originalname,
        size: fileSize,
        mime: mimetype,
      });

      uploadResults.push({
        id: attachment.id,
        uid: `attachment-${attachment.id}`,
        name: attachment.name,
        filename: attachment.name,
        url: `${BASE_URL}${attachment.url}`,
        size: attachment.size,
        mimetype: attachment.mime,
        status: "done",
      });
    }

    res.json({
      success: true,
      message: `${uploadResults.length} file berhasil diunggah`,
      data: uploadResults,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const uploadKnowledgeContentAttachmentAdmin = async (req, res) => {
  try {
    const mc = req?.mc;
    const files = req?.files || [];
    const { id: content_id } = req?.query;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang diunggah",
      });
    }

    const uploadResults = [];

    for (const file of files) {
      const filename = `${content_id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 11)}-${file?.originalname.replace(/\s+/g, "-")}`;
      const fileSize = file?.size;
      const mimetype = file?.mimetype;
      const buffer = Buffer.from(file?.buffer);

      await uploadFileMinio(mc, buffer, filename, fileSize, mimetype);

      const attachment = await KnowledgeContentAttachment.query().insert({
        content_id,
        url: `${BASE_URL}/${filename}`,
        name: file?.originalname,
        size: fileSize,
        mime: mimetype,
      });

      uploadResults.push({
        id: attachment.id,
        uid: `attachment-${attachment.id}`,
        name: attachment.name,
        filename: attachment.name,
        url: `${BASE_URL}${attachment.url}`,
        size: attachment.size,
        mimetype: attachment.mime,
        status: "done",
      });
    }

    res.json({
      success: true,
      message: `${uploadResults.length} file berhasil diunggah`,
      data: uploadResults,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Helper functions for sorting
function getSortField(sort) {
  switch (sort) {
    case "created_at": // Default - tanggal create terbaru
    case "created_at_asc": // Tanggal create terlama
      return "created_at";
    case "likes_count": // Total like terbanyak
      return "likes_count";
    case "comments_count": // Total komentar terbanyak
      return "comments_count";
    case "title_asc": // Judul A-Z
    case "title_desc": // Judul Z-A
      return "title";
    case "updated_at": // Tanggal update
      return "updated_at";
    default:
      return "created_at";
  }
}

function getSortDirection(sort) {
  switch (sort) {
    case "created_at_asc": // Tanggal create terlama (ASC)
    case "title_asc": // Judul A-Z (ASC)
      return "asc";
    case "title_desc": // Judul Z-A (DESC)
      return "desc";
    case "created_at": // Default - tanggal create terbaru (DESC)
    case "likes_count": // Total like terbanyak (DESC)
    case "comments_count": // Total komentar terbanyak (DESC)
    case "updated_at": // Tanggal update terbaru (DESC)
    default:
      return "desc";
  }
}
