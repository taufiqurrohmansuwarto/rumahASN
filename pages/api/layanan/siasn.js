import { layananTrackingSiasn } from "@/controller/tracking-layanan.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(layananTrackingSiasn);

export default router.handler();
