const { createRouter } = require("next-connect");
const {
  index,
} = require("../../../../../controller/tickets-comments-customers-to-agents.controller");
const { default: auth } = require("../../../../../middleware/auth.middleware");

const router = createRouter();
// patch for add assigne
// and delete for remove assignee
router.use(auth).get(index);

module.exports = router.handler({});
