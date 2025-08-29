import { useQuery } from "@tanstack/react-query";
import { dataRiwayatTugasBelajar } from "@/services/siasn-services";

function CompareTugasBelajar() {
  const { data, isLoading } = useQuery(
    ["riwayat-tugas-belajar"],
    () => dataRiwayatTugasBelajar(),
    {
      enabled: false,
    }
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default CompareTugasBelajar;
