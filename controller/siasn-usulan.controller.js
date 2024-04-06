const usulanKenaikanPangkatByNip = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const { fetcher } = req;
    const url = `/siasn-ws/layanan/kenaikan-pangkat/${employee_number}`;
    const result = await fetcher.get(url);
    const response = result?.data;
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const usulanPemberhentianByNip = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const { fetcher } = req;
    const url = `/siasn-ws/layanan/pemberhentian/${employee_number}`;
    const result = await fetcher.get(url);
    const response = result?.data;
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const usulanPerbaikanNamaByNip = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const { fetcher } = req;
    const url = `/siasn-ws/layanan/skk/${employee_number}`;
    const result = await fetcher.get(url);
    const response = result?.data;
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const usulanPenyesuaianMasaKerjaByNip = async (req, res) => {
  try {
    const { employee_number } = req?.user;
    const { fetcher } = req;
    const url = `/siasn-ws/layanan/pmk/${employee_number}`;
    const result = await fetcher.get(url);
    const response = result?.data;
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const usulanPencantumanGelarByNip = async (req, res) => {
  try {
    const { nip } = req?.query;
    const { fetcher } = req;
    const url = `/siasn-ws/layanan/pg/${nip}`;
    const result = await fetcher.get(url);
    const response = result?.data;
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  usulanKenaikanPangkatByNip,
  usulanPemberhentianByNip,
  usulanPerbaikanNamaByNip,
  usulanPenyesuaianMasaKerjaByNip,
  usulanPencantumanGelarByNip,
};
