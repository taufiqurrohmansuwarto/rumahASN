export const getPengkom = async (req, res) => {
  try {
    const request = req.siasnRequest;
    const limit = req?.query?.limit || 10;
    const offset = req?.query?.offset || 0;
    const { data } = await request.get(
      `/kompetensi/refinstitusipenkom?limit=${limit}&offset=${offset}`
    );
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createRefKegiatanPengkom = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createRwPotensi = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createRwKompetensi = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
