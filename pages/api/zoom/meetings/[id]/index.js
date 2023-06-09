import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get();

export default router;
