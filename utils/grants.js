const RolePermission = require("@/models/app_role_permissions.model");

module.exports.grantLists = async () => {
  const rolePermissions = await RolePermission.query().withGraphFetched(
    "[permission, role]"
  );
  const roles = rolePermissions.map((rolePermission) => {
    const { role, permission } = rolePermission;
    return {
      role: role?.name,
      resource: permission?.resource,
      action: permission?.name,
      attributes: permission?.attributes?.join(",") || "",
    };
  });

  return roles;
};
