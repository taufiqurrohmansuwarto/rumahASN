import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(async (req, res) => {
  const { id } = req.query;
  res.status(200).json({
    message: "Hello World",
  });
});

export default router;
