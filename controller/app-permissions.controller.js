const AppPermission = require("@/models/app_permissions.model");

const appPermissions = async (req, res) => {
  try {
    const permissions = await AppPermission.query();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPermission = async (req, res) => {
  try {
    const payload = req.body;
    const permission = await AppPermission.query().insert(payload);
    res.status(201).json({ permission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePermission = async (req, res) => {
  try {
    const { id } = req.query;
    const payload = req.body;
    const permission = await AppPermission.query().patchAndFetchById(
      id,
      payload
    );
    res.status(200).json({ permission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePermission = async (req, res) => {
  try {
    const { id } = req.query;
    await AppPermission.query().deleteById(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  appPermissions,
  createPermission,
  updatePermission,
  deletePermission,
};
