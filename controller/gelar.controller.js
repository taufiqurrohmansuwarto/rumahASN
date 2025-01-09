import {
  proxyGelar,
  proxyGelarUncheck,
  proxyGelarCheck,
} from "@/utils/siasn-proxy.utils";

export const getGelar = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const fetcher = req?.fetcher;

    const response = await proxyGelar(fetcher, employee_number);

    res.json(response?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getGelarByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const fetcher = req?.fetcher;

    const response = await proxyGelar(fetcher, nip);

    res.json(response?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const uncheckGelar = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const fetcher = req?.fetcher;
    const { gelarId, loc } = req?.query;

    const response = await proxyGelarUncheck(
      fetcher,
      employee_number,
      gelarId,
      loc
    );

    res.json(response?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const uncheckGelarByNip = async (req, res) => {
  try {
    const { nip, gelarId, loc } = req?.query;
    const fetcher = req?.fetcher;

    const response = await proxyGelarUncheck(fetcher, nip, gelarId, loc);

    res.json(response?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkGelar = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const fetcher = req?.fetcher;
    const { gelarId, loc } = req?.query;

    const response = await proxyGelarCheck(
      fetcher,
      employee_number,
      gelarId,
      loc
    );

    res.json(response?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkGelarByNip = async (req, res) => {
  try {
    const { nip, gelarId, loc } = req?.query;
    const fetcher = req?.fetcher;

    const response = await proxyGelarCheck(fetcher, nip, gelarId, loc);

    res.json(response?.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
