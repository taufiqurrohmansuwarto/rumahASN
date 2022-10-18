import { createRouter } from "next-connect";
import auth from "../../../../middleware/auth.middleware";

const router = createRouter();

// filter buat agents
router.use(auth).get();

export default router.handler();
