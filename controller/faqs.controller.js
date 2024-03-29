const { parseMarkdown } = require("@/utils/parsing");
const Faqs = require("../models/faqs.model");

const index = async (req, res) => {
  // no more pagination;
  try {
    const result = await Faqs.query()
      .orderBy("created_at", "desc")
      .withGraphFetched("[created_by(simpleSelect)]");
    const data = result?.map((item) => ({
      ...item,
      // html: parseMarkdown(item?.answer),
    }));
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await Faqs.query()
      .patch({
        ...req?.body,
        user_id: customId,
      })
      .where("id", id);

    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    await Faqs.query().deleteById(id);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await Faqs.query()
      .findById(id)
      .withGraphFetched("[sub_faq]");

    const data =
      result?.sub_faq?.length > 0
        ? result?.sub_faq?.map((item) => ({
            ...item,
            html: parseMarkdown(item?.answer),
          }))
        : [];

    const hasil = {
      ...result,
      sub_faq: data,
    };

    res.json(hasil);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    await Faqs.query().insert({ ...req?.body, user_id: customId });
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  update,
  remove,
  detail,
  create,
};
