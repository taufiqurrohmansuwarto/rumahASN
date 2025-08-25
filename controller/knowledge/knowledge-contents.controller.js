import { handleError } from "@/utils/helper/controller-helper";
import { uploadFileMinio } from "@/utils/index";

const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeCategory = require("@/models/knowledge/categories.model");
const KnowledgeContentAttachment = require("@/models/knowledge/content-attachments.model");
const BASE_URL = "https://siasn.bkd.jatimprov.go.id:9000/public";

export const getKnowledgeContents = async (req, res) => {
  try {
    const { customId } = req?.user;
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "created_at",
      category_id = "",
      tags = "",
    } = req?.query;
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
        if (tags) {
          builder.whereRaw("tags @> ?", [JSON.stringify([tags])]);
        }
      })
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
      .andWhere("status", "published")
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
      )
      .orderBy(sort, "desc")
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
    const payload = req?.body;
    const { customId } = req?.user;

    const content = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("user_id", customId)
      .andWhere("status", "draf")
      .update(payload);

    res.json(content);
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
