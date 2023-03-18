const { useRBAC } = require("@/context/RBACContext");

const RestrictedContent = ({ name, attributes, children }) => {
  const { canAccess } = useRBAC();

  if (!canAccess(name, attributes)) {
    return null;
  }

  return children;
};

export default RestrictedContent;
