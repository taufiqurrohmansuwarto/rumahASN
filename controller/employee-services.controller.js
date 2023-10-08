const EmployeeServices = require("@/models/employee-services.model");

const index = async (req, res) => {
  try {
    const employeeServices = await EmployeeServices.query();
    res.status(200).json({
      status: "success",
      message: "Employee Services retrieved successfully",
      data: employeeServices,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving Employee Services",
      data: error,
    });
  }
};

const show = async (req, res) => {
  const { id } = req.query;
  try {
    const employeeServices = await EmployeeServices.query().findById(id);
    res.status(200).json({
      status: "success",
      message: "Employee Services retrieved successfully",
      data: employeeServices,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving Employee Services",
      data: error,
    });
  }
};

const store = async (req, res) => {
  const { title, description, icon_url } = req.body;
  try {
    const employeeServices = await EmployeeServices.query().insert({
      title,
      description,
      icon_url,
    });
    res.status(200).json({
      status: "success",
      message: "Employee Services created successfully",
      data: employeeServices,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating Employee Services",
      data: error,
    });
  }
};

const update = async (req, res) => {
  const { id } = req.query;
  const { title, description, icon_url } = req.body;
  try {
    const employeeServices = await EmployeeServices.query().patchAndFetchById(
      id,
      {
        title,
        description,
        icon_url,
      }
    );
    res.status(200).json({
      status: "success",
      message: "Employee Services updated successfully",
      data: employeeServices,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating Employee Services",
      data: error,
    });
  }
};

const destroy = async (req, res) => {
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

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
