import { createRouter } from "next-connect";
import auth from "../../../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get().patch().delete();

export default router.handler();
