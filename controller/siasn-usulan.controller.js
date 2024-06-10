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
    // console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const trackingUsulanByNip = async (req, res) => {
  const { nip, tipe_usulan } = req?.query;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, tipe_usulan, nip);
};

const usulanKenaikanPangkatByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.user;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "kenaikan-pangkat", employeeNumber);
};

const usulanKenaikanPangkatByNipFasilitator = async (req, res) => {
  const { nip } = req?.query;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "kenaikan-pangkat", nip);
};

const usulanPemberhentianByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.user;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "pemberhentian", employeeNumber);
};

const usulanPemberhentianByNipFasilitator = async (req, res) => {
  const { nip } = req?.query;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "pemberhentian", nip);
};

const usulanPerbaikanNamaByNip = async (req, res) => {
  const { employee_number: employeeNumber } = req?.user;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "skk", employeeNumber);
};

const usulanPerbaikanNamaByNipFasilitator = async (req, res) => {
  const { nip } = req?.query;
  const { fetcher } = req;
  fetchDataUsulan(req, res, fetcher, "skk", nip);
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
  trackingUsulanByNip,
  usulanKenaikanPangkatByNipFasilitator,
  usulanPerbaikanNamaByNipFasilitator,
  usulanPemberhentianByNipFasilitator,
};
