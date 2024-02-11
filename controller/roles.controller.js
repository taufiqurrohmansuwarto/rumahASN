// create role
const Role = require("@/models/app_roles.model");
const Permission = require("@/models/app_permissions.model");

const userRoles = async (req, res) => {
  try {
    const { customId } = req.user;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const payload = req.body;
    const role = await Role.query().insert(payload);
    res.status(201).json({ role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.query;
    const payload = req.body;
    const role = await Role.query().patchAndFetchById(id, payload);
    res.status(200).json({ role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.query;
    await Role.query().deleteById(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.query();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// permission
const createPermission = async (req, res) => {
  try {
    const payload = req.body;
    const permission = await Permission.query().insert(payload);
    res.status(201).json({ permission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { id } = req.query;
    const payload = req.body;
    const permission = await Permission.query().patchAndFetchById(id, payload);
    res.status(200).json({ permission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePermission = async (req, res) => {
  try {
    const { id } = req.query;
    await Permission.query().deleteById(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.query();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.query;
    const role = await Role.query()
      .findById(id)
      .withGraphFetched("permissions");
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  userRoles,

  // role
  createRole,
  updateRole,
  deleteRole,
  getRoles,

  // permission
  createPermission,
  updatePermission,
  deletePermission,
  getPermissions,

  getRolePermissions,
};
