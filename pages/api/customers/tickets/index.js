const { createRouter } = require("next-connect");
const {
  index,
  create,
} = require("../../../../controller/users-ticket.controller");
const { default: auth } = require("../../../../middleware/auth.middleware");

const router = createRouter();
router.use(auth).get(index).post(create);

export default router.handler({});
