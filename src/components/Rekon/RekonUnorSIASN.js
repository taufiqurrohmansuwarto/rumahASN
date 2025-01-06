import {
  deleteUnorRekon,
  getDetailUnorSimaster,
  getRekonUnorStatistics,
  getUnorRekon,
  getUnorSiasn,
  getUnorSimaster,
  postUnorRekon,
  reportRekonUnor,
} from "@/services/rekon.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  List,
  message,
  Row,
  Space,
  Statistic,
  Tag,
  TreeSelect,
  Typography,
  Popconfirm,
} from "antd";
import { toNumber } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";

const ListUnor = ({ data, hapus }) => {
  const handleHapus = (item) => {
    hapus(item);
  };

  return (
    <List
      header={<Typography.Title level={5}>Unor SIASN</Typography.Title>}
      dataSource={data}
      rowKey={(row) => row?.id}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Popconfirm
              key="hapus"
              title="Apakah Anda yakin ingin menghapus data ini?"
              onConfirm={() => handleHapus(item)}
            >
              <a>Hapus</a>
            </Popconfirm>,
          ]}
        >
          <Space>
            {item?.unor_siasn}
            <Tag color="yellow">SIASN</Tag>
          </Space>
        </List.Item>
      )}
    />
  );
};

const UnorSimaster = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["rekon-unor-simaster"],
    () => getUnorSimaster(),
    {}
  );

  const handleChange = (value) => {
    router.push(`/rekon/rekon-unor?master_id=${value}`);
  };

  return (
    <Stack>
      <Form layout="vertical">
        <Form.Item label="Unor SIMASTER" help="Pilih Unor SIMASTER">
          <TreeSelect
            treeNodeFilterProp="title"
            placeholder="Ketik nama unit organisasi"
            showSearch
            style={{ width: "100%" }}
            treeData={data}
            value={router?.query?.master_id}
            onSelect={handleChange}
          />
        </Form.Item>
      </Form>
    </Stack>
  );
};

const StatisticUnor = ({ data, handleReport }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Card>
          <Statistic title="Total Unor" value={data?.total_unor} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="Terselesaikan"
            value={data?.total_yang_belum}
            suffix={`/ ${data?.total_yang_sudah}`}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic
            title="Presentase"
            value={toNumber(data?.presentase_progress)}
            suffix="%"
          />
        </Card>
      </Col>
    </Row>
  );
};

const UnorSiasn = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedUnor, setSelectedUnor] = useState(null);

  const { data, isLoading } = useQuery(
    ["rekon-unor-siasn"],
    () => getUnorSiasn(),
    {}
  );

  const { mutate: post, isLoading: isLoadingPost } = useMutation({
    mutationFn: (payload) => postUnorRekon(payload),
    onSuccess: () => {
      message.success("Berhasil menyimpan data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor", router?.query?.master_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-simaster"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-statistics"],
      });
    },
    onError: (error) => {
      message.error("Gagal menyimpan data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor", router?.query?.master_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-simaster"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-statistics"],
      });
    },
  });

  const handleSave = () => {
    if (!selectedUnor) {
      message.error("Silahkan pilih unit organisasi SIASN");
      return;
    }

    const payload = {
      id_simaster: router?.query?.master_id,
      id_siasn: selectedUnor,
    };

    post(payload);
  };

  const handleSelect = (value) => {
    setSelectedUnor(value);
  };

  return (
    <Stack>
      <Form layout="vertical">
        <Form.Item
          label="Unor SIASN"
          help="Pilih dan padankan sesuai dengan UNOR SIMASTER"
        >
          <TreeSelect
            treeNodeFilterProp="title"
            showSearch
            style={{ width: "100%" }}
            treeData={data}
            value={selectedUnor}
            onSelect={handleSelect}
          />
        </Form.Item>
      </Form>

      <Button
        type="primary"
        loading={isLoadingPost}
        disabled={!selectedUnor}
        onClick={handleSave}
      >
        Simpan
      </Button>
    </Stack>
  );
};

const RekonUnorSIASN = () => {
  const router = useRouter();
  const { master_id } = router?.query;
  const queryClient = useQueryClient();

  const { mutateAsync: report, isLoading: isLoadingReport } = useMutation({
    mutationFn: () => reportRekonUnor(),
    onSuccess: () => {
      message.success("Berhasil mengunduh report");
    },
    onError: (error) => {
      message.error("Gagal mengunduh report");
      console.log(error);
    },
  });

  const handleReport = async () => {
    const result = await report();
    // save as excel
    const file = new Blob([result], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rekon_unor_report.xlsx";
    a.click();
  };

  const { data: detailUnorSimaster, isLoading: isLoadingDetailUnorSimaster } =
    useQuery(
      ["detail-unor-simaster", master_id],
      () => getDetailUnorSimaster(master_id),
      {
        enabled: !!master_id,
      }
    );

  const { data: rekonUnor, isLoading: isLoadingRekonUnor } = useQuery(
    ["rekon-unor", master_id],
    () => getUnorRekon(master_id),
    {
      enabled: !!master_id,
    }
  );

  const { data: statistics, isLoading: isLoadingStatistics } = useQuery(
    ["rekon-unor-statistics"],
    () => getRekonUnorStatistics(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation({
    mutationFn: (id) => deleteUnorRekon(id),
    onSuccess: () => {
      message.success("Berhasil menghapus data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-simaster"],
      });
    },
    onError: (error) => {
      message.error("Gagal menghapus data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor", master_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-unor-simaster"],
      });
    },
  });

  const handleHapus = async (item) => {
    const id = item?.id;
    if (id) {
      await hapus(id);
    } else {
      message.error("Silahkan pilih unit organisasi SIASN");
    }
  };

  return (
    <Card
      title="Padanan Unit Organisasi"
      extra={
        <Button
          icon={<CloudDownloadOutlined />}
          type="primary"
          onClick={handleReport}
          loading={isLoadingReport}
        >
          Unduh Report
        </Button>
      }
    >
      <Row>
        <Col xs={24} md={18} lg={18} xl={18}>
          <Stack>
            <StatisticUnor
              data={statistics}
              handleReport={handleReport}
              isLoading={isLoadingReport}
            />
            <UnorSimaster />
          </Stack>

          <Divider />
          {master_id && (
            <Stack>
              <UnorSiasn />
              {detailUnorSimaster && (
                <Alert
                  style={{ marginTop: 16 }}
                  message="Unor SIMASTER dipilih"
                  description={detailUnorSimaster?.hierarchy}
                  type="success"
                  showIcon
                />
              )}
              {rekonUnor?.length > 0 && (
                <ListUnor hapus={handleHapus} data={rekonUnor} />
              )}
            </Stack>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default RekonUnorSIASN;
