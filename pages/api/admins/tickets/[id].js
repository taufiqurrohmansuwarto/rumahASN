const { createRouter } = require("next-connect");
const { default: auth } = require("../../../../middleware/auth.middleware");

const router = createRouter();
// patch for add assigne
// and delete for remove assignee
router.use(auth).get().patch().delete();

module.exports = router.handler({});
