import { ringkasAlasanTolak } from "@/controller/rekon/rekon-pangkat.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(ringkasAlasanTolak);

export default router.handler({});
