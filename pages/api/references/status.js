const { status } = require("@/controller/references.controller");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router.use(auth).get(status);

module.exports = router.handler({});
