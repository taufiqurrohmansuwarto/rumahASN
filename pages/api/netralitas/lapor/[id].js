import { searchByKodeNetralitas } from "@/controller/netralitas.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.put(searchByKodeNetralitas);

export default router.handler();
