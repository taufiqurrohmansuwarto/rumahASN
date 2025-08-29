import { dataRiwayatTugasBelajar } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import TableRiwayatTubel from "@/components/PemutakhiranData/Tables/TableRiwayatTubel";

function CompareTugasBelajar() {
  const { data, isLoading, refetch, isRefetching } = useQuery(
    ["riwayat-tugas-belajar"],
    () => dataRiwayatTugasBelajar(),
    {}
  );

  return (
    <div>
      <TableRiwayatTubel
        data={data}
        loading={isLoading || isRefetching}
        refetch={refetch}
      />
    </div>
  );
}

export default CompareTugasBelajar;
