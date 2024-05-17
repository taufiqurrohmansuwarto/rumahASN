const fetchDataUsulan = async (
  _req,
  res,
  fetcher,
  tipeUsulan,
  employeeNumber
) => {
  try {
    const url = `/siasn-ws/layanan/${tipeUsulan}/${employeeNumber}`;
    const result = await fetcher.get(url);
    const response = result?.data;
    res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const usulanKenaikanPangkatByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.user;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "kenaikan-pangkat", employeeNumber);
};

const usulanPemberhentianByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.user;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "pemberhentian", employeeNumber);
};

const usulanPerbaikanNamaByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.user;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "skk", employeeNumber);
};

const usulanPenyesuaianMasaKerjaByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.user;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "pmk", employeeNumber);
};

const usulanPencantumanGelarByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.query;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "pg", employeeNumber);
};

export {
  usulanKenaikanPangkatByNip,
  usulanPemberhentianByNip,
  usulanPerbaikanNamaByNip,
  usulanPenyesuaianMasaKerjaByNip,
  usulanPencantumanGelarByNip,
};
