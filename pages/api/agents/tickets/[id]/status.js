import { createRouter } from "next-connect";
import { akhiriPekerjaanSelesai } from "../../../../../controller/agent-ticket.controller";
import auth from "../../../../../middleware/auth.middleware";

const router = createRouter();

// terima dan tidak terima
router.use(auth).patch(akhiriPekerjaanSelesai).delete(akhiriPekerjaanSelesai);

export default router.handler();
