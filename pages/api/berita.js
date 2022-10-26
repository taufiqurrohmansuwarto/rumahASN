import { createRouter } from "next-connect";
import { listBerita } from "../../controller/vendor.controller";
const router = createRouter();

router.use(auth).get(listBerita);

export default router.handler({});
