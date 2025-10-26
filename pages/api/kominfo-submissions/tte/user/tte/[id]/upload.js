import { uploadFilePengajuanTTE } from "@/controller/tte-submission/tte-submission.controller";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import { createRouter } from "next-connect";

// Setup multer untuk handle upload file
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, and PDF files are allowed"));
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

router.use(auth).post(upload.single("file"), uploadFilePengajuanTTE);

export default router.handler({});
