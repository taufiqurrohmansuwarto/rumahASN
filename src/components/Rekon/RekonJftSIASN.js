import {
  getJftSimaster,
  getJftSiasn,
  postJftRekon,
  getDetailJftSimaster,
  getJftRekon,
  deleteJftRekon,
  getRekonJftStatistics,
  reportJftUnor,
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

const ListJft = ({ data, hapus }) => {
  const handleHapus = (item) => {
    hapus(item);
  };

  return (
    <List
      header={<Typography.Title level={5}>Ref Jft SIASN</Typography.Title>}
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
            {item?.JftSiasn?.nama}
            <Tag color="yellow">SIASN</Tag>
          </Space>
        </List.Item>
      )}
    />
  );
};

const JftSimaster = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["rekon-jft-simaster"],
    () => getJftSimaster(),
    {}
  );

  const handleChange = (value) => {
    router.push(`/rekon/rekon-jft?master_id=${value}`);
  };

  return (
    <Stack>
      <Form layout="vertical">
        <Form.Item label="JFT SIMASTER" help="Pilih JFT SIMASTER">
          <TreeSelect
            treeNodeFilterProp="title"
            placeholder="Ketik nama jabatan fungsional"
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

const StatisticJft = ({ data, handleReport }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}>
        <Card>
          <Statistic title="Total JFT" value={data?.total_jft} />
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

const JftSiasn = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedJft, setSelectedJft] = useState(null);

  const { data, isLoading } = useQuery(
    ["rekon-jft-siasn"],
    () => getJftSiasn(),
    {}
  );

  const { mutate: post, isLoading: isLoadingPost } = useMutation({
    mutationFn: (payload) => postJftRekon(payload),
    onSuccess: () => {
      message.success("Berhasil menyimpan data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft", router?.query?.master_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-simaster"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-statistics"],
      });
    },
    onError: (error) => {
      message.error("Gagal menyimpan data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft", router?.query?.master_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-simaster"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-statistics"],
      });
    },
  });

  const handleSave = () => {
    if (!selectedJft) {
      message.error("Silahkan pilih jabatan fungsional SIASN");
      return;
    }

    const payload = {
      id_simaster: router?.query?.master_id,
      id_siasn: selectedJft,
    };

    post(payload);
  };

  const handleSelect = (value) => {
    setSelectedJft(value);
  };

  return (
    <Stack>
      <Form layout="vertical">
        <Form.Item
          label="JFT SIASN"
          help="Pilih dan padankan sesuai dengan JFT di SIMASTER"
        >
          <TreeSelect
            treeNodeFilterProp="title"
            showSearch
            style={{ width: "100%" }}
            treeData={data}
            value={selectedJft}
            onSelect={handleSelect}
          />
        </Form.Item>
      </Form>

      <Button
        type="primary"
        loading={isLoadingPost}
        disabled={!selectedJft}
        onClick={handleSave}
      >
        Simpan
      </Button>
    </Stack>
  );
};

const RekonJftSIASN = () => {
  const router = useRouter();
  const { master_id } = router?.query;
  const queryClient = useQueryClient();

  const { mutateAsync: report, isLoading: isLoadingReport } = useMutation({
    mutationFn: () => reportJftUnor(),
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
    a.download = "rekon_jft_report.xlsx";
    a.click();
  };

  const { data: detailJftSimaster, isLoading: isLoadingDetailJftSimaster } =
    useQuery(
      ["detail-jft-simaster", master_id],
      () => getDetailJftSimaster(master_id),
      {
        enabled: !!master_id,
      }
    );

  const { data: rekonJft, isLoading: isLoadingRekonJft } = useQuery(
    ["rekon-jft", master_id],
    () => getJftRekon(master_id),
    {
      enabled: !!master_id,
    }
  );

  const { data: statistics, isLoading: isLoadingStatistics } = useQuery(
    ["rekon-jft-statistics"],
    () => getRekonJftStatistics(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation({
    mutationFn: (id) => deleteJftRekon(id),
    onSuccess: () => {
      message.success("Berhasil menghapus data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-simaster"],
      });
    },
    onError: (error) => {
      message.error("Gagal menghapus data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft", master_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-statistics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["rekon-jft-simaster"],
      });
    },
  });

  const handleHapus = async (item) => {
    const id = item?.id;
    if (id) {
      await hapus(id);
    } else {
      message.error("Silahkan pilih jabatan fungsional SIASN");
    }
  };

  return (
    <Card
      title="Padanan JFT"
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
            <StatisticJft
              data={statistics}
              handleReport={handleReport}
              isLoading={isLoadingReport}
            />
            <JftSimaster />
          </Stack>

          <Divider />
          {master_id && (
            <Stack>
              <JftSiasn />
              {/* {detailJftSimaster && (
                <Alert
                  style={{ marginTop: 16 }}
                  message="JFT SIMASTER dipilih"
                  description={detailJftSimaster?.hierarchy}
                  type="success"
                  showIcon
                />
              )} */}
              {rekonJft?.length > 0 && (
                <ListJft hapus={handleHapus} data={rekonJft} />
              )}
            </Stack>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default RekonJftSIASN;
