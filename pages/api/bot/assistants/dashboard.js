import { cekTotalPenggunaBestie } from "@/controller/ai-assistants.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(cekTotalPenggunaBestie);

export default router.handler({});
