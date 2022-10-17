const { createRouter } = require("next-connect");
const { index } = require("../../../../controller/admin-ticket.controller");
const { default: auth } = require("../../../../middleware/auth.middleware");

const router = createRouter();
router.use(auth).get(index);

module.exports = router.handler({});
