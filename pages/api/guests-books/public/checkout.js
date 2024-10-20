import { checkOut, findCheckOut } from "@/controller/guests-books.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(findCheckOut).post(checkOut);

export default router.handler({});
