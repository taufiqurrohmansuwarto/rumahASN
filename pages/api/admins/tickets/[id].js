const { createRouter } = require("next-connect");
const {
  addAgents,
  removeAgents,
} = require("../../../../controller/admin-ticket-agent.controller");
const { default: auth } = require("../../../../middleware/auth.middleware");

const router = createRouter();
// patch for add assigne
// and delete for remove assignee
router.use(auth).get().patch(addAgents).delete(removeAgents);

module.exports = router.handler({});
