const AppRole = require("@/models/app_roles.model");

const appRoles = async (req, res) => {
  try {
    const roles = await AppRole.query();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const payload = req.body;
    const role = await AppRole.query().insert(payload);
    res.status(201).json({ role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.query;
    const payload = req.body;
    const role = await AppRole.query().patchAndFetchById(id, payload);
    res.status(200).json({ role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.query;
    await AppRole.query().deleteById(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  appRoles,
};
