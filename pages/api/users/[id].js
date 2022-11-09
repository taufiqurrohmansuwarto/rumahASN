import { createRouter } from "next-connect";
import { patch } from "../../../controller/users.controller";
import auth from "../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).patch(patch).get();

export default router.handler();
