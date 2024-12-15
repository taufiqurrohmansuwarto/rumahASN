const { categories } = require("@/controller/references.controller");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();

router.use(auth).get(categories);

export default router.handler({});
