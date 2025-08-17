import { createRouter } from "next-connect";
import auth from "@/middlewares/auth.middleware";

const router = createRouter();

router.use(auth).get().put().delete();

export default router.handler({});
