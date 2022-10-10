import { createRouter } from "next-connect";
import { getDepartments } from "../../../controller/data-controller";
import auth from "../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(getDepartments);

export default router.handler({});
