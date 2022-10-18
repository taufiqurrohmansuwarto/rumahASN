const { createRouter } = require("next-connect");
const {
  detail,
  remove,
  update,
} = require("../../../../../controller/users-ticket.controller");
const { default: auth } = require("../../../../../middleware/auth.middleware");

const router = createRouter();
router.use(auth).get(detail).patch(update).delete(remove);

module.exports = router.handler({});
