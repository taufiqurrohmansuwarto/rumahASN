import { createRouter } from "next-connect";
import auth from "../../../middleware/auth.middleware";
const router = createRouter();

// this gonna be bug if u empty the function
router.use(auth).patch().delete();

export default router.handler();
