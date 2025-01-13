import { checkUserByNik } from "@/utils/esign";
const ESIGN_NIK = process.env.ESIGN_NIK;

export const check = async (req, res) => {
  try {
    const result = await checkUserByNik(ESIGN_NIK);
    res.json(result?.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

export const signPdf = async (req, res) => {
  try {
    const { passphrase } = req.body;
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
