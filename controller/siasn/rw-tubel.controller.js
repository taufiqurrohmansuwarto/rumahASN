import { handleError } from "@/utils/helper/controller-helper";
import { daftarTugasBelajar, tambahTugasBelajar } from "@/utils/siasn-utils";

export const daftarTugasBelajarPersonal = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const { siasnRequest: fetcher } = req;

    const tubel = await daftarTugasBelajar(fetcher, nip);

    res.json(tubel);
  } catch (error) {
    handleError(res, error);
  }
};

export const daftarTugasBelajarByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const { siasnRequest: fetcher } = req;

    const tubel = await daftarTugasBelajar(fetcher, nip);

    res.json(tubel);
  } catch (error) {
    handleError(res, error);
  }
};

export const tambahTugasBelajarPersonal = async (req, res) => {
  try {
    const { employeeNumber: nip } = req?.user;
    const { siasnRequest: fetcher } = req;

    const tubel = await tambahTugasBelajar(fetcher, nip);

    res.json(tubel);
  } catch (error) {
    handleError(res, error);
  }
};

export const tambahTugasBelajarByNip = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};
