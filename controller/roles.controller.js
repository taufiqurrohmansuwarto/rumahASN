// create role
const Role = require("@/models/app_roles.model");
const Permission = require("@/models/app_permissions.model");
const RolePermission = require("@/models/app_role_permissions.model");
const User = require("@/models/users.model");

const userRoles = async (req, res) => {
  try {
    const { customId } = req.user;
    const roles = await Role.query()
      .where("user_id", customId)
      .withGraphFetched("permissions");

    res.json(roles);
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
    res.json({
      message: "Role deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await Role.query().orderBy("created_at", "desc");
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
    const permissions = await Permission.query().orderBy("created_at", "desc");
    const result = permissions.map((permission) => {
      return {
        ...permission,
        label: permission.name,
        value: permission.id,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.query;
    const role = await Role.query()
      .findById(id)
      .withGraphFetched("[permissions, users]");

    if (!role) {
      res.status(404).json({ message: "Role not found" });
    } else {
      let permissionValue = [];
      if (role.permissions.length > 0) {
        permissionValue = role.permissions.map((permission) => {
          return permission.id;
        });
      }

      res.status(200).json({
        ...role,
        permission_value: permissionValue,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRolePermission = async (req, res) => {
  try {
    const { id } = req.query;
    const { permissions } = req.body;

    await RolePermission.query().delete().where("role_id", id);
    const payload = permissions.map((permission) => {
      return {
        role_id: id,
        permission_id: permission,
      };
    });

    await RolePermission.query().insert(payload);
    res.status(200).json({
      message: "Permissions updated",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const usersRoles = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const search = req.query.search || "";
    console.log(search);

    const users = await User.query()
      .withGraphFetched("app_role")
      .andWhere("group", "=", "MASTER")
      .andWhere("role", "=", "USER")
      .andWhere((builder) => {
        if (search) {
          builder.where("username", "ilike", `%${search}%`);
        }
      })
      // .orWhere("group", "=", "PTTPK")
      .page(page - 1, limit);

    const data = {
      data: users.results,
      total: users.total,
      page: users.page,
      limit: users.limit,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id: userId } = req?.query;

    if (!userId) {
      res.status(400).json({ message: "User id is required" });
    } else {
      await User.query().findById(userId).patch({
        app_role_id: req.body.app_role_id,
      });

      res.status(200).json({ message: "User role updated" });
    }
  } catch (error) {
    console.log(error);
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
  updateRolePermission,

  usersRoles,
  updateUserRole,
};
