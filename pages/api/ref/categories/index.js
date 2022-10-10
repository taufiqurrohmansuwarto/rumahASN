import { createRouter } from "next-connect";
import auth from "../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get((req, res) => {
  res.json({ code: 200, message: "success" });
});

export default router.handler();
