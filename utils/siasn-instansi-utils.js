import axios from "axios";

const createFetcher = (token) => {
  return axios.create({
    baseURL: "https://api-siasn.bkn.go.id",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const testingFetcher = async (token) => {
  const fetcher = createFetcher(token);
  const response = await fetcher.get(
    "/profilasn/api/orang-siasn?id=7E85A2743B04BD8DE050640A3C036B36"
  );
  return response.data;
};
