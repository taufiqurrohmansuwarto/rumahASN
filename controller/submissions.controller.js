const SubmissionsReferences = require("../models/submissions-references.model");
const SubmissionPics = require("../models/submissions-pics.model");

const createSubmissionPersonInCharge = async (req, res) => {
  try {
    const { body } = req;
    const { customId: userId } = req.user;
    const { id } = req.query;

    const result = await SubmissionPics.query().insert({
      ...body,
      submission_reference_id: id,
      user_id: userId,
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getSubmissionPersonInCharge = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await SubmissionPics.query().where(
      "submission_reference_id",
      id
    );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateSubmissionPersonInCharge = async (req, res) => {
  try {
    const { body } = req;
    const { id, picId } = req?.query;

    const result = await SubmissionPics.query()
      .patchAndFetchById(picId, body)
      .andWhere("submission_reference_id", id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailSubmissionPersonInCharge = async (req, res) => {
  try {
    const { id, picId } = req?.query;
    const result = await SubmissionPics.query()
      .where("submission_reference_id", id)
      .andWhere("id", picId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubmissionPersonInCharge = async (req, res) => {
  try {
    const { id, picId } = req?.query;
    const result = await SubmissionPics.query()
      .where("id", picId)
      .andWhere("submission_reference_id", id)
      .delete();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const createSubmissionReference = async (req, res) => {
  try {
    const { body } = req;
    const { customId: userId } = req.user;

    const result = await SubmissionsReferences.query().insert({
      ...body,
      user_id: userId,
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getSubmissionReference = async (req, res) => {
  try {
    const result = await SubmissionsReferences.query().withGraphFetched(
      "user(simpleSelect)"
    );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailSubmissionReference = async (req, res) => {
  try {
    const rseult = await SubmissionsReferences.query().findById(req?.query?.id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateSubmissionReference = async (req, res) => {
  try {
    const { body } = req;
    const { id } = req?.query;

    const result = await SubmissionsReferences.query().patchAndFetchById(
      id,
      body
    );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubmissionReference = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await SubmissionsReferences.query().deleteById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubmissionReference,
  getSubmissionReference,
  updateSubmissionReference,
  deleteSubmissionReference,
  detailSubmissionReference,

  createSubmissionPersonInCharge,
  getSubmissionPersonInCharge,
  updateSubmissionPersonInCharge,
  detailSubmissionPersonInCharge,
  deleteSubmissionPersonInCharge,
};
