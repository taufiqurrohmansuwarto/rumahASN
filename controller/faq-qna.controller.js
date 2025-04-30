import { handleError } from "@/utils/helper/controller-helper";
const FaqQna = require("@/models/faq-qna.model");

export const createFaqQna = async (req, res) => {
  try {
    const { body } = req;
    const { customId } = req?.user;
    const payload = {
      ...body,
      created_by: customId,
    };
    const faqQna = await FaqQna.query().insert(payload);
    res.status(201).json(faqQna);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateFaqQna = async (req, res) => {
  try {
    const { id } = req.query;
    const { body } = req;
    const { customId } = req?.user;
    const payload = {
      ...body,
      updated_by: customId,
    };

    const faqQna = await FaqQna.query().patchAndFetchById(id, payload);

    if (!faqQna) {
      return res.status(404).json({ message: "FAQ tidak ditemukan" });
    }

    res.status(200).json(faqQna);
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

    let query = FaqQna.query();

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

    const offset = (page - 1) * limit;

    const [total, data] = await Promise.all([
      query.clone().resultSize(),
      query.offset(offset).limit(limit).orderBy("created_at", "desc"),
    ]);

    res.status(200).json({
      data,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
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
