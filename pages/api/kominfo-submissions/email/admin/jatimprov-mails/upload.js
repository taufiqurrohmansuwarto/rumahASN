import { uploadEmailJatimprovExcel } from "@/controller/tte-submission/email-submission.controller";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import adminKominfoMiddleware from "@/middleware/admin-kominfo.middleware";
import { createRouter } from "next-connect";

// Setup multer untuk handle upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"));
    }
  },
});

// Disable body parser untuk multer
export const config = {
  api: {
    bodyParser: false,
  },
};

const router = createRouter();

router
  .use(auth)
  .use(adminKominfoMiddleware)
  .post(upload.single("file"), uploadEmailJatimprovExcel);

export default router.handler({});
