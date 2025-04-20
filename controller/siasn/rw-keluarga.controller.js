import { handleError } from "@/utils/helper/controller-helper";

const { tambahAnak, tambahPasangan } = require("@/utils/siasn-utils");

export const postAnakByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const { siasnRequest } = req;
    const body = req?.body;
  } catch (error) {
    handleError(res, error);
  }
};

export const postIstriByNip = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const postAnakPersonal = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};

export const postIstriPersonal = async (req, res) => {
  try {
  } catch (error) {
    handleError(res, error);
  }
};
