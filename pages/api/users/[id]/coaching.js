import auth from "@/middleware/auth.middleware";

const { createRouter } = require("next-connect");

const router = createRouter();

// put make the users coach, and delete make the users not coach
router.use(auth).put().delete();

export default router.handler();
