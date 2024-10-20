import { checkIn, findCheckIn } from "@/controller/guests-books.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(checkIn).get(findCheckIn);

export default router.handler({});
