import { createRouter } from "next-connect";
import { index } from "../../../controller/list-agents.controller";
import auth from "../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(index);

module.exports = router.handler({});
