import { useQuery } from "@tanstack/react-query";
import { getDisparitasSKP } from "@/services/siasn-services";
import { Table } from "antd";
const DisparitasSKP = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["disparitas-skp"],
    queryFn: getDisparitasSKP,
  });
  const columns = [
    {
      title: "NIP",
      dataIndex: "nip_master",
    },
  ];

  return (
    <>
      <Table
        pagination={{
          pageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
        rowKey={(row) => row?.nip_master}
        dataSource={data}
        loading={isLoading}
        columns={columns}
      />
    </>
  );
};

export default DisparitasSKP;
