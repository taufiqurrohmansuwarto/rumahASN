const EmployeeServices = require("@/models/employee-services.model");
const { parseMarkdown } = require("@/utils/parsing");

const parsingMarkdown = (data) => {
  if (!data?.length) {
    return [];
  } else {
    return data?.map((d) => ({
      ...d,
      html: d?.description ? parseMarkdown(d?.description) : null,
    }));
  }
};

const findEmployeeServices = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 30;
    const search = req.query.search || "";

    const result = await EmployeeServices.query()
      .page(parseInt(page) - 1, parseInt(limit))
      .where((builder) => {
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .orderBy("created_at", "desc");

    const data = {
      data: parsingMarkdown(result?.results),
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error retrieving Employee Services",
      data: error,
    });
  }
};

const detailEmployeeService = async (req, res) => {
  const { id } = req.query;
  try {
    const employeeServices = await EmployeeServices.query().findById(id);
    res.json(employeeServices);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving Employee Services",
      data: error,
    });
  }
};

const createEmployeeService = async (req, res) => {
  try {
    await EmployeeServices.query().insert(req?.body);
    res.json({
      status: "success",
      message: "Employee Services created successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating Employee Services",
      data: error,
    });
  }
};

const updateEmployeeService = async (req, res) => {
  const { id } = req.query;
  try {
    const body = req?.body;
    await EmployeeServices.query().patchAndFetchById(id, body);

    res.json({
      status: "success",
      message: "Employee Services updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating Employee Services",
      data: error,
    });
  }
};

const removeEmployeeService = async (req, res) => {
  const { id } = req.query;
  try {
    const employeeServices = await EmployeeServices.query().deleteById(id);
    res.status(200).json({
      status: "success",
      message: "Employee Services deleted successfully",
      data: employeeServices,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting Employee Services",
      data: error,
    });
  }
};

const userReadData = async (req, res) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 30;

    const result = await EmployeeServices.query()
      .page(parseInt(page) - 1, parseInt(limit))
      .orderBy("created_at", "desc");

    const data = {
      data: parsingMarkdown(result?.results),
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    };
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error retrieving User",
      data: error,
    });
  }
};

const userReadDetail = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await EmployeeServices.query().findById(id);
    const data = {
      html: result?.description ? parseMarkdown(result?.description) : null,
      ...result,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      message: "Error retrieving User",
      data: error,
    });
  }
};

module.exports = {
  findEmployeeServices,
  detailEmployeeService,
  createEmployeeService,
  updateEmployeeService,
  removeEmployeeService,

  // user
  userReadData,
  userReadDetail,
};
