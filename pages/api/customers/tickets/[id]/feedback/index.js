import { createRouter } from "next-connect";
import { addFeedback } from "../../../../../../controller/customers-feedback.controller";
import auth from "../../../../../../middleware/auth.middleware";

const router = createRouter();

// add feedabck
router.use(auth).patch(addFeedback);

export default router.handler({});
