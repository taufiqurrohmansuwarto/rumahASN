const { createRouter } = require("next-connect");
const { default: auth } = require("../../../middleware/auth.middleware");

const router = createRouter();
router.use(auth).get().post();

module.exports = router.handler({});
