import { useQuery } from "@tanstack/react-query";
import { dataRiwayatTugasBelajarByNip } from "@/services/siasn-services";
import { useRouter } from "next/router";

function CompareTugasBelajarByNip() {
  const router = useRouter();
  const { nip } = router.query;

  const { data, isLoading } = useQuery(
    ["riwayat-tugas-belajar-by-nip", nip],
    () => dataRiwayatTugasBelajarByNip(nip),
    {
      enabled: !!nip,
    }
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default CompareTugasBelajarByNip;
