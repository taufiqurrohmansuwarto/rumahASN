import {
  getRekonIPASN,
  getRekonIPASNDashboard,
  getUnorSimaster,
  syncRekonIPASN,
} from "@/services/rekon.services";
import { CloudSyncOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, Row, Table, TreeSelect, message } from "antd";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

const UnorSimaster = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["rekon-unor-simaster"],
    () => getUnorSimaster(),
    {}
  );

  const { mutateAsync: rekonIpasn, isLoading: isRekonIpasnLoading } =
    useMutation({
      mutationFn: () => getRekonIPASN({ skpd_id: router?.query?.skpd_id }),
    });

  const handleDownload = async () => {
    const result = await rekonIpasn();
    const { data, averageTotal } = result;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "IPASN");
    XLSX.writeFile(workbook, "IPASN.xlsx");
  };

  const handleChange = (value) => {
    router.push(`/rekon/dashboard?skpd_id=${value}`);
  };

  return (
    <Row gutter={[12, 12]}>
      <Col span={12}>
        <Form.Item>
          <TreeSelect
            treeNodeFilterProp="title"
            placeholder="Ketik nama unit organisasi"
            listHeight={400}
            showSearch
            style={{ width: "100%" }}
            treeData={data}
            value={router?.query?.skpd_id}
            onSelect={handleChange}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Button
          icon={<FileExcelOutlined />}
          type="primary"
          loading={isRekonIpasnLoading}
          disabled={isRekonIpasnLoading}
          onClick={handleDownload}
        >
          Unduh Data
        </Button>
      </Col>
    </Row>
  );
};

function RekonIPASN() {
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

  return (
    <>
      <Card
        title="IPASN Pemprov Jatim"
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
          <UnorSimaster />
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
    </>
  );
}

export default RekonIPASN;
