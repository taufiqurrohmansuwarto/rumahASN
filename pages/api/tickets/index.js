const { publishedTickets } = require("@/controller/tickets-props.controller");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router.use(auth).get(publishedTickets);

module.exports = router.handler({});
