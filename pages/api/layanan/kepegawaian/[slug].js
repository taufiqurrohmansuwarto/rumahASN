import { layananKepegawaianSlug } from "@/controller/layanan.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(layananKepegawaianSlug);

export default router.handler();
