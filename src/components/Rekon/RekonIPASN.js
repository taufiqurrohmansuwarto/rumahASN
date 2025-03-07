import {
  getRekonIPASNDashboard,
  syncRekonIPASN,
} from "@/services/rekon.services";
import { CloudSyncOutlined, SearchOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";

function RekonIPASN() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["rekon-ipasn"],
    queryFn: getRekonIPASNDashboard,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { mutate: syncRekonIpasn, isLoading: isSyncRekonIpasnLoading } =
    useMutation({
      mutationFn: () => syncRekonIPASN(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["rekon-ipasn"] });
        message.success("Data berhasil disinkronisasi");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    });

  const handleSyncRekonIpasn = () => {
    syncRekonIpasn();
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "name",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.name,
        value: item?.name,
      })),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "PNS",
      dataIndex: "rerata_total_pns",
      sorter: (a, b) => a.rerata_total_pns - b.rerata_total_pns,
    },
    {
      title: "PPPK",
      dataIndex: "rerata_total_pppk",
      sorter: (a, b) => a.rerata_total_pppk - b.rerata_total_pppk,
    },
  ];

  const title = (router) => {
    return (
      <Space>
        <Typography.Text strong>IPASN Pemprov Jatim</Typography.Text>
        <Button
          type="link"
          icon={<SearchOutlined />}
          onClick={() => router.push("/rekon/dashboard/ipasn")}
        />
      </Space>
    );
  };

  return (
    <Row gutter={[12, 12]}>
      <Col md={24} xs={24}>
        <Card
          title={title(router)}
          extra={
            <Button
              icon={<CloudSyncOutlined />}
              loading={isSyncRekonIpasnLoading}
              disabled={isSyncRekonIpasnLoading}
              onClick={handleSyncRekonIpasn}
            >
              Sinkronkan Data
            </Button>
          }
        >
          <Stack>
            <Table
              size="small"
              rowKey={(row) => row?.id}
              pagination={{
                pageSize: 15,
                position: ["bottomRight", "topRight"],
              }}
              loading={isLoading}
              dataSource={data?.data}
              columns={columns}
              sortDirections={["ascend", "descend"]}
            />
          </Stack>
        </Card>
      </Col>
    </Row>
  );
}

export default RekonIPASN;
