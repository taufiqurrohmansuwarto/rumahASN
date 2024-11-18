const URL_KOMPETENSI = "/pns/rw-kompetensi";
const URL_POTENSI = "/pns/rw-potensi";

const getResult = async (req, employeeNumber, type) => {
  const fetcher = req?.siasnRequest;
  if (type === "kompetensi") {
    const result = await fetcher?.get(`${URL_KOMPETENSI}/${employeeNumber}`);
    return result?.data;
  } else if (type === "potensi") {
    const result = await fetcher?.get(`${URL_POTENSI}/${employeeNumber}`);
    return result?.data;
  }
};

// potensi
export const getPotensi = async (req, res) => {
  try {
    const { employee_number: employeeNumber } = req?.user;
    const result = await getResult(req, employeeNumber, "potensi");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// kompetensi
export const getKompetensi = async (req, res) => {
  try {
    const { employee_number: employeeNumber } = req?.user;
    const result = await getResult(req, employeeNumber, "kompetensi");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// potensi by nip
export const getPotensiByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const result = await getResult(req, nip, "potensi");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// kompetensi by nip
export const getKompetensiByNip = async (req, res) => {
  try {
    const { nip } = req?.query;

    const result = await getResult(req, nip, "kompetensi");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
