import { getRwPwkByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";

function ComparePwkByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["pns-pwk", nip],
    () => getRwPwkByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {},
  ];

  return (
    <Card title="Riwayat Pindah Wilayah Kerja">
      <Table columns={columns} dataSource={data} loading={isLoading} />
    </Card>
  );
}

export default ComparePwkByNip;
