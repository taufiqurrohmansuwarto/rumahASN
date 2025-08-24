import { handleError } from "@/utils/helper/controller-helper";
import { uploadFileMinio } from "@/utils/index";

const KnowledgeContent = require("@/models/knowledge/contents.model");
const KnowledgeCategory = require("@/models/knowledge/categories.model");
const KnowledgeContentAttachment = require("@/models/knowledge/content-attachments.model");

export const getKnowledgeContents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "created_at",
    } = req?.query;
    const contents = await KnowledgeContent.query()
      .andWhere((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
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
    const content = await KnowledgeContent.query()
      .where("id", id)
      .andWhere("status", "published")
      .withGraphFetched(
        "[author(simpleWithImage), category, user_verified(simpleWithImage), versions.[user_updated(simpleWithImage)], attachments, references]"
      )
      .first();

    if (!content) {
      return res.status(404).json({
        message: "Content not found",
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
    const { mc } = req?.mc;
    const files = req?.files;
    const { content_id } = req?.body;

    const uploadedAttachments = [];

    for (const file of files) {
      const fileFormat = file?.originalname?.split(".").pop();
      const filename = `${content_id}-${file?.originalname}.${fileFormat}`;
      const fileSize = file?.size;
      const mimetype = file?.mimetype;
      const buffer = Buffer.from(file?.buffer);

      const response = await uploadFileMinio(
        mc,
        buffer,
        filename,
        fileSize,
        mimetype
      );

      if (response) {
        const attachment = await KnowledgeContentAttachment.query().insert({
          content_id,
          url: `/${filename}`,
          name: file?.originalname,
          size: fileSize,
          mimetype,
          type: "attachment",
        });

        uploadedAttachments.push(attachment);
      }
    }

    if (uploadedAttachments.length > 0) {
      res.json(uploadedAttachments);
    } else {
      res.status(400).json({ message: "Gagal mengunggah file" });
    }
  } catch (error) {
    handleError(res, error);
  }
};
