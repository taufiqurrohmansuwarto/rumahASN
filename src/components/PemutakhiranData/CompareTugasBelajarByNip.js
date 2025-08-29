import { dataRiwayatTugasBelajarByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import TableRiwayatTubel from "@/components/PemutakhiranData/Tables/TableRiwayatTubel";

function CompareTugasBelajarByNip() {
  const router = useRouter();
  const { nip } = router.query;

  const { data, isLoading, refetch, isRefetching } = useQuery(
    ["riwayat-tugas-belajar-by-nip", nip],
    () => dataRiwayatTugasBelajarByNip(nip),
    {}
  );

  const handleFinishCreate = () => {
    refetch();
  };

  return (
    <TableRiwayatTubel
      data={data}
      refetch={refetch}
      loading={isLoading || isRefetching}
      onFinishCreate={handleFinishCreate}
      enableCreate={true}
    />
  );
}

export default CompareTugasBelajarByNip;
