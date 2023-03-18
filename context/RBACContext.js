import React, { createContext, useContext, useMemo } from "react";

export const RBACContext = createContext();

export const RBACProvider = ({ user, definitions, children }) => {
  const canAccess = (name, attributes = {}) => {
    const permission = definitions.permissions[name];
    if (!permission) return false;

    const hasRoleAccess = user.roles.some((role) =>
      permission.roles.includes(role)
    );
    if (!hasRoleAccess) return false;

    if (permission.attributeCheck) {
      const { checkFunction, requiredRoles } = permission.attributeCheck;

      if (requiredRoles.some((role) => !user.roles.includes(role))) {
        return checkFunction({ ...attributes, user });
      }
    }

    return true;
  };

  const value = useMemo(() => ({ canAccess }), [user, definitions]);

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};
