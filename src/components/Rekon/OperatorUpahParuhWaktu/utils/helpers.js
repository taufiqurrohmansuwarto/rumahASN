// Fungsi helper untuk mencari nama unit organisasi dari tree data
export const findUnorName = (unorId, unorTree) => {
  if (!unorTree || !Array.isArray(unorTree) || !unorId) return "-";

  const findInTree = (nodes, targetId) => {
    for (const node of nodes) {
      if (
        node.value === targetId ||
        node.id === targetId ||
        node.key === targetId
      ) {
        return node.label || node.title || node.name || "-";
      }
      if (node.children && node.children.length > 0) {
        const found = findInTree(node.children, targetId);
        if (found !== "-") return found;
      }
    }
    return "-";
  };

  return findInTree(unorTree, unorId);
};

// Fungsi helper untuk format username
export const formatUsername = (id, nama) => {
  const idParts = id?.split("|") || [];
  return idParts.length > 1
    ? `${nama || "-"} - ${idParts[1]}`
    : nama || "-";
};

