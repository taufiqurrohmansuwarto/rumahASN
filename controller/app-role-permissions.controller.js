const AppRolePermission = require("@/models/app_role_permissions.model");

const createRolePermission = async (req, res) => {
  try {
    const payload = req.body;
    const rolePermission = await AppRolePermission.query().insert(payload);
    res.status(201).json({ rolePermission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRolePermission = async (req, res) => {
  try {
    const { id } = req.query;
    const payload = req.body;
    const rolePermission = await AppRolePermission.query().patchAndFetchById(
      id,
      payload
    );
    res.status(200).json({ rolePermission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRolePermission = async (req, res) => {
  try {
    const { id } = req.query;
    await AppRolePermission.query().deleteById(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const rolePermissions = await AppRolePermission.query();
    res.status(200).json(rolePermissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
  getRolePermissions,
};
