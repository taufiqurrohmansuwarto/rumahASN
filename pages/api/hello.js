import { createRouter } from "next-connect";

const router = createRouter();

router.get(async (req, res) => {
  res.json({ message: "Hello World!" });
});

export default router.handler({});
