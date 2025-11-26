import { handleError } from "@/utils/helper/controller-helper";
import {
  cekPencantumanGelar,
  cekPencantumanGelarProfesi,
} from "@/utils/siasn-utils";

export const cekLayananPencantumanGelarByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const { siasnRequest: fetcher } = req;

    const data = await cekPencantumanGelar(fetcher, nip);

    console.log(data);

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const cekLayananPencantumanGelarPersonal = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const { siasnRequest: fetcher } = req;
    const data = await cekPencantumanGelar(fetcher, nip);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const cekLayananPencantumanGelarPersonalProfesi = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    const { siasnRequest: fetcher } = req;
    const data = await cekPencantumanGelarProfesi(fetcher, nip);
    console.log(data);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const cekLayananPencantumanGelarProfesiByNip = async (req, res) => {
  try {
    const { nip } = req.query;
    const { siasnRequest: fetcher } = req;
    const data = await cekPencantumanGelarProfesi(fetcher, nip);
    res.json(data);
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
};
