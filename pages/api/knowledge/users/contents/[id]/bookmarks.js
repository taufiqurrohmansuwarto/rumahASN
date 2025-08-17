import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { bookmark } from "@/controller/knowledge/user-interactions.controller";

const router = createRouter();

router.use(auth).post(bookmark);

export default router.handler({});
