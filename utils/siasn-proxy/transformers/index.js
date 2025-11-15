const {
  transformPangkatItem,
  transformPangkatData,
} = require("./pangkat-transformer");

module.exports = {
  pangkat: {
    transformItem: transformPangkatItem,
    transformData: transformPangkatData,
  },
  // Future: pengadaan, mutasi, dll
};
