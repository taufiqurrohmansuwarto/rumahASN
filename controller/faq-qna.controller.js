import { handleError } from "@/utils/helper/controller-helper";
const FaqQna = require("@/models/faq-qna.model");

export const createFaqQna = async (req, res) => {
  try {
    const {
      question,
      answer,
      regulation_ref,
      is_active,
      effective_date,
      expired_date,
      sub_category_ids = [],
    } = req.body;

    if (
      !question ||
      !answer ||
      !Array.isArray(sub_category_ids) ||
      sub_category_ids.length === 0
    ) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    const { customId } = req?.user;
    const payload = {
      question,
      answer,
      regulation_ref,
      is_active,
      effective_date,
      expired_date,
      created_by: customId,
    };

    // insert
    const faq = await FaqQna.query().insert(payload);
    // insert sub category
    await faq.$relatedQuery("sub_categories").relate(sub_category_ids);

    res.status(201).json({ message: "FAQ berhasil ditambahkan" });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateFaqQna = async (req, res) => {
  try {
    const { id } = req.query;
    const {
      question,
      answer,
      regulation_ref,
      is_active,
      effective_date,
      expired_date,
      sub_category_ids = [],
    } = req.body;
    const { customId } = req?.user;

    const faq = await FaqQna.query().findById(id);

    if (!faq) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    const payload = {
      question,
      answer,
      regulation_ref,
      is_active,
      effective_date,
      expired_date,
      updated_by: customId,
    };

    await faq.$query().patch(payload);

    await faq.$relatedQuery("sub_categories").unrelate();

    if (sub_category_ids.length > 0) {
      await faq.$relatedQuery("sub_categories").relate(sub_category_ids);
    }

    res.status(200).json({ message: "FAQ berhasil diubah" });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteFaqQna = async (req, res) => {
  try {
    const { id } = req.query;

    const deleted = await FaqQna.query().deleteById(id);

    if (!deleted) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    res.status(200).json({ message: "FAQ berhasil dihapus" });
  } catch (error) {
    handleError(res, error);
  }
};

export const getFaqQna = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      is_active,
      sub_category_id,
    } = req.query;

    let query = FaqQna.query().withGraphFetched("[sub_categories.[category]]");

    if (search) {
      query = query.where((builder) => {
        builder
          .where("question", "ilike", `%${search}%`)
          .orWhere("answer", "ilike", `%${search}%`);
      });
    }

    if (is_active !== undefined) {
      query = query.where("is_active", is_active);
    }

    if (sub_category_id) {
      query = query.where("sub_category_id", sub_category_id);
    }

    const total = await query.clone().resultSize();
    let data;

    if (parseInt(limit) === -1) {
      // Tampilkan semua data tanpa paging
      data = await query.orderBy("created_at", "desc");
    } else {
      const offset = (page - 1) * limit;
      data = await query
        .offset(offset)
        .limit(limit)
        .orderBy("created_at", "desc");
    }

    res.status(200).json({
      data,
      meta: {
        total,
        page: parseInt(limit) === -1 ? 1 : parseInt(page),
        limit: parseInt(limit),
        totalPages: parseInt(limit) === -1 ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getFaqQnaById = async (req, res) => {
  try {
    const { id } = req.query;

    const faqQna = await FaqQna.query().findById(id);

    if (!faqQna) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    res.status(200).json(faqQna);
  } catch (error) {
    handleError(res, error);
  }
};
