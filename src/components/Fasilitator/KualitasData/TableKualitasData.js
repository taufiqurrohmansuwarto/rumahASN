import { Table } from "antd";

const TableKualitasData = ({
  data,
  isLoading,
  isFetching,
  columns,
  pagination,
}) => (
  <Table
    pagination={{
      ...pagination,
      showSizeChanger: false,
    }}
    loading={isLoading || isFetching}
    columns={columns}
    dataSource={data}
  />
);

export default TableKualitasData;
