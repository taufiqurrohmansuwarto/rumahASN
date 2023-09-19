import { dataRiwayatMasaKerja } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";

function CompareMasaKerjaByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-masa-kerja", nip],
    () => dataRiwayatMasaKerja(nip),
    {}
  );

  return (
    <Card title="Riwayat Masa Kerja" loading={isLoading}>
      {JSON.stringify(data, null, 2)}
    </Card>
  );
}

export default CompareMasaKerjaByNip;
