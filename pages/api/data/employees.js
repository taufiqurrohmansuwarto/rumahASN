import { createRouter } from "next-connect";
import { getEmployees } from "../../../controller/data-controller";
import auth from "../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(getEmployees);

export default router.handler({});
