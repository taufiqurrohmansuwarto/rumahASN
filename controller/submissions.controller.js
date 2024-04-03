const SubmissionsReferences = require("@/models/submissions-references.model");
const SubmissionPics = require("@/models/submissions-pics.model");
const SubmissionsFileRefs = require("@/models/submissions-file-refs.model");
const SubmissionsFiles = require("@/models/submissions-files.model");
const Submissions = require("@/models/submissions.model");
const SubmissionHistories = require("@/models/submissions-histories.model");
const { TEMPORARY_REDIRECT_STATUS } = require("next/dist/shared/lib/constants");
const { uploadFileUsulan } = require("../utils");

const typeGroup = ({ role, group }) => {
  const asn = role === "USER" && group === "MASTER";
  const fasilitator = group === "MASTER" && role === "FASILITATOR";

  if (asn) {
    return "asn";
  } else if (fasilitator) {
    return "fasilitator";
  }
};

const uploadDokumen = async (req, res) => {
  try {
  } catch (error) {}
};

const detailSubmissionSubmitter = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const result = await Submissions.query()
      .andWhere("id", id)
      .andWhere("submitter", customId)
      .withGraphFetched("[reference.[submission_files.[file]]]")
      .first();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const createSubmissionSubmitter = async (req, res) => {
  try {
    const { customId } = req?.user;

    const data = {
      ...req?.body,
      submitter: customId,
      status: "INPUT_USUL",
    };

    const hasil = await Submissions.query().insert(data);

    await SubmissionHistories.query().insert({
      submission_id: hasil?.id,
      user_id: customId,
      old_data: null,
      new_data: JSON.stringify(data),
    });

    res.json({ message: "Submission created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getAllSubmissionSubmitter = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;

    const { customId } = req?.user;
    const result = await Submissions.query()
      .where("submitter", customId)
      .orderBy("created_at", "desc")
      .withGraphFetched("[reference]")
      .page(page - 1, limit);

    const data = {
      total: result.total,
      data: result.results,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
      },
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const submitterSubmissions = async (req, res) => {
  try {
    const userType = typeGroup(req?.user);
    const result = await SubmissionsReferences.query().whereRaw(
      `submitter_type::text LIKE '%${userType}%'`
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailSubmissionReferenceSubmitter = async (req, res) => {
  try {
    const userType = typeGroup(req?.user);
    const { id: submissionId } = req?.query;
    const result = await SubmissionsReferences.query()
      .where("id", submissionId)
      .andWhereRaw(`submitter_type::text LIKE '%${userType}%'`)
      .first();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubmissionSubmitter = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await Submissions.query()
      .deleteById(id)
      .andWhere("submitter", customId)
      .andWhere("status", "INPUT_USUL");
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const sendSubmissions = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const { submissionId } = req?.query;
    const { customId } = req?.user;

    await SubmissionsReferences.query()
      .deleteById(submissionId)
      .andWhere("user_id", customId)
      .andWhere("status", "input_usul");
    res.json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

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
    const id = req?.query?.id;
    const result = await SubmissionsReferences.query().findById(id);
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

const uploadSubmissionsFile = async (req, res) => {
  try {
    const { file } = req;
    const { id } = req?.query;
    const body = req?.body;

    const filename = `/usulan/${id}_${body?.kode_file}.pdf`;

    await uploadFileUsulan(req?.mc, filename, file);
    const payload = {
      kode: body?.kode_file,
      path: filename,
    };

    // files in submissions is type array of object so we need to push it
    await Submissions.query().patch(
      {
        submission_files: Submissions.raw("submission_files || ?", [payload]),
      },
      id
    );

    res.json({ message: "File uploaded successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// crud for submissions_file_refs
const createSubmissionsFileRefs = async (req, res) => {
  try {
    const { body } = req;
    const result = await SubmissionsFileRefs.query().insert(body);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getSubmissionsFileRefs = async (req, res) => {
  try {
    const result = await SubmissionsFileRefs.query().orderBy(
      "created_at",
      "desc"
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateSubmissionsFileRefs = async (req, res) => {
  try {
    const { body } = req;
    const { id } = req?.query;

    const result = await SubmissionsFileRefs.query().patchAndFetchById(
      id,
      body
    );
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailSubmissionsFileRefs = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await SubmissionsFileRefs.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubmissionsFileRefs = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await SubmissionsFileRefs.query().deleteById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// submission with files
const createSubmissionWithFiles = async (req, res) => {
  try {
    const { body } = req;
    const { id } = req.query;

    // check first
    const check = await SubmissionsReferences.query().findById(id);

    if (!check) {
      res.status(404).json({ error: "Submission not found" });
    } else {
      // insert submission
      const result = await SubmissionsFiles.query().insert({
        ...body,
        submission_ref: id,
      });
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getSubmissionWithFiles = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await SubmissionsFiles.query().where("submission_ref", id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateSubmissionWithFiles = async (req, res) => {
  try {
    const { body } = req;
    const { id, fileId } = req.query;

    const result = await SubmissionsFiles.query()
      .patchAndFetchById(fileId, body)
      .where("submission_ref", id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const detailSubmissionWithFiles = async (req, res) => {
  try {
    const { id, fileId } = req.query;
    const result = await SubmissionsFiles.query()
      .where("submission_ref", id)
      .andWhere("id", fileId);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubmissionWithFiles = async (req, res) => {
  try {
    const { id, fileId } = req.query;
    const result = await SubmissionsFiles.query()
      .deleteById(fileId)
      .where("submission_ref", id);
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

  // user
  getAllSubmissionSubmitter,
  submitterSubmissions,
  createSubmissionSubmitter,
  detailSubmissionSubmitter,
  sendSubmissions,
  detailSubmissionReferenceSubmitter,
  deleteSubmissionSubmitter,
  uploadSubmissionsFile,

  // submissions_file_refs
  createSubmissionsFileRefs,
  getSubmissionsFileRefs,
  updateSubmissionsFileRefs,
  detailSubmissionsFileRefs,
  deleteSubmissionsFileRefs,

  // submission with files
  createSubmissionWithFiles,
  getSubmissionWithFiles,
  updateSubmissionWithFiles,
  detailSubmissionWithFiles,
  deleteSubmissionWithFiles,
};
