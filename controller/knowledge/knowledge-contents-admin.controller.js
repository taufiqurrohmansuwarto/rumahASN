const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeContentVersions = require("@/models/knowledge/content-versions.model");
const KnowledgeUserInteractions = require("@/models/knowledge/user-interactions.model");
import { handleError } from "@/utils/helper/controller-helper";

export const getKnowledgeContentsAdmin = async (req, res) => {
  try {
    // default filter adalah draft
    const {
      search,
      page = 1,
      limit = 10,
      categoryId,
      status = "pending",
    } = req?.query;

    const contents = await KnowledgeContent.query()
      .where("status", status)
      .andWhere((builder) => {
        if (categoryId) {
          builder.where("category_id", categoryId);
        }
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage)]"
      )
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const totalPending = await KnowledgeContent.query()
      .where("status", "pending")
      .count("id as total");

    const totalPublished = await KnowledgeContent.query()
      .where("status", "published")
      .count("id as total");

    const totalRejected = await KnowledgeContent.query()
      .where("status", "rejected")
      .count("id as total");

    const totalArchived = await KnowledgeContent.query()
      .where("status", "archived")
      .count("id as total");

    const result = {
      data: contents.results,
      total: contents.total,
      page: parseInt(page),
      limit: parseInt(limit),
      statusCounts: {
        pending: parseInt(totalPending[0].total),
        published: parseInt(totalPublished[0].total),
        rejected: parseInt(totalRejected[0].total),
        archived: parseInt(totalArchived[0].total),
      },
    };

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const content = await KnowledgeContent.query()
      .findById(id)
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
      );

    const comments = await KnowledgeUserInteractions.query()
      .where("content_id", id)
      .andWhere("interaction_type", "comment")
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "desc");

    if (!content) {
      res.status(404).json({
        message: "Content not found",
      });
    } else {
      const data = {
        ...content,
        comments,
      };

      res.json(data);
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const updateKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const payload = req?.body;

    const data = {
      ...payload,
      tags: JSON.stringify(payload?.tags),
      updated_at: new Date(),
    };

    // Menggunakan transaction untuk memastikan konsistensi data
    const content = await KnowledgeContent.transaction(async (trx) => {
      // Ambil content yang akan diupdate
      const existingContent = await KnowledgeContent.query(trx).findById(id);

      if (!existingContent) {
        throw new Error("Content tidak ditemukan");
      }

      // update increment version
      const contentVersion = await KnowledgeContentVersions.query(trx)
        .where("content_id", id)
        .orderBy("version", "desc")
        .first();

      const version = contentVersion ? contentVersion.version + 1 : 1;

      await KnowledgeContentVersions.query(trx).insert({
        content_id: id,
        version,
        updated_by: customId,
      });

      // Update content dengan references menggunakan upsertGraph
      const updatedData = {
        ...data,
        id: parseInt(id),
      };

      // Tambahkan references ke data jika ada
      if (payload?.references && payload.references.length > 0) {
        updatedData.references = payload.references.map((reference) => ({
          title: reference.title,
          url: reference.url,
        }));
      } else {
        updatedData.references = [];
      }

      // Gunakan upsertGraph untuk update content dan replace semua references
      const result = await KnowledgeContent.query(trx).upsertGraph(
        updatedData,
        {
          relate: false,
          unrelate: true,
          update: true,
          insertMissing: true,
        }
      );

      return result;
    });

    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const changeStatusKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const payload = req?.body;

    const data = {
      ...payload,
      verified_by: customId,
      verified_at: new Date(),
    };

    const content = await KnowledgeContent.query().where("id", id).patch(data);
    res.json(content);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteKnowledgeContentAdmin = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await KnowledgeContent.query()
      .findById(id)
      .update({ status: "archive", updated_by: customId });

    res.json({ message: "Content deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
