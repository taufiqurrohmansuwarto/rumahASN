import { getRekonPGByPegawai } from "@/controller/rekon/rekon-pencantuman-gelar.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getRekonPGByPegawai);

export default router.handler({});
