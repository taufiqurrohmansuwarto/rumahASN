import { handleError } from "@/utils/helper/controller-helper";

export const refKedudukanHukumSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/kedudukan-hukum");
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};

export const refJenjangSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/jenjang");
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};

export const refPangkatSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/pangkat");
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};

export const refStatusKawinSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/status-kawin");
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};

export const refJenisJabatanSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/jenis-jabatan");
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};

export const refAgamaSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/agama");
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};

export const refStatusKepegawaianSimaster = async (req, res) => {
  try {
    const fetcher = req?.clientCredentialsFetcher;
    const result = await fetcher.get("/refs/status-kepegawaian");
    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};
