import { getHukdisByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

const CompareHukdisByNip = ({ nip }) => {
  const { data, isLoading } = useQuery(
    ["hukdis", nip],
    () => getHukdisByNip(nip),
    {}
  );

  return (
    <>
      <Table
        isLoading={isLoading}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

export default CompareHukdisByNip;
