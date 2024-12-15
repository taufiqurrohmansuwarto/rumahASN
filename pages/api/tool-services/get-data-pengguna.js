import { getDataPengguna } from "@/controller/tool-services.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(checkRole).post(getDataPengguna);

export default router.handler({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
});
