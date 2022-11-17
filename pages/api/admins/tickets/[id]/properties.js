const { createRouter } = require("next-connect");
const { update } = require("../../../../../controller/admin-ticket.controller");
const { default: auth } = require("../../../../../middleware/auth.middleware");

const router = createRouter();
// patch for add assigne
// and delete for remove assignee
router.use(auth).patch(update);

module.exports = router.handler({});
