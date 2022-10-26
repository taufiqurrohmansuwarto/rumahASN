import { useQuery } from "@tanstack/react-query";
import { dataListBerita } from "../../services";

const BeritaBKD = () => {
  const { data, isLoading } = useQuery(["berita"], () => dataListBerita());
  return <div>{JSON.stringify(data)}</div>;
};

export default BeritaBKD;
