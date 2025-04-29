import { Table } from "antd";
import { useRouter } from "next/router";
const TableKualitasData = ({
  data,
  isLoading,
  isFetching,
  columns,
  pagination,
}) => {
  const router = useRouter();
  return (
    <>
      <Table
        pagination={{
          current: Number(router?.query?.page) || 1,
          pageSize: Number(router?.query?.limit) || 10,
          ...pagination,
          showSizeChanger: false,
        }}
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={data}
      />
    </>
  );
};

export default TableKualitasData;
