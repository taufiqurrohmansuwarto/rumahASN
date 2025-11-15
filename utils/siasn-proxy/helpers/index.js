const {
  getOpdIdFromUser,
  isAdmin,
  hasOpdAccess,
} = require("./authorization-helper");

const {
  isRootOpd,
  isChildOpd,
  getOpdLevel,
  getParentOpdId,
  getOpdLikePattern,
} = require("./opd-hierarchy-helper");

module.exports = {
  // Authorization
  getOpdIdFromUser,
  isAdmin,
  hasOpdAccess,
  
  // OPD Hierarchy
  isRootOpd,
  isChildOpd,
  getOpdLevel,
  getParentOpdId,
  getOpdLikePattern,
};

