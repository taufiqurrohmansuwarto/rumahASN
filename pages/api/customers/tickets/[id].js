const { createRouter } = require("next-connect");
const {
  index,
  update,
  remove,
} = require("../../../../controller/users-ticket.controller");
const { default: auth } = require("../../../middleware/auth.middleware");

const router = createRouter();
router.use(auth).get(index).patch(update).delete(remove);

module.exports = router.handler({});
