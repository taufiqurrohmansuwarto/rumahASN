import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).post().get();

export default router;
