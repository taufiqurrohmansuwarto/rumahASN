import { createRouter } from "next-connect";

const router = createRouter();

// add agents to tickets by id
router.use().patch().delete();

export default router.handler();
