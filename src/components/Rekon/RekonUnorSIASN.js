import {
  deleteUnorRekon,
  getDetailUnorSimaster,
  getRekonUnorStatistics,
  getUnorRekon,
  getUnorSiasn,
  getUnorSimaster,
  postUnorRekon,
} from "@/services/rekon.services";
import { LikeOutlined } from "@ant-design/icons";
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
  Tag,
  TreeSelect,
  Typography,
  Statistic,
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
      dataSource={data}
      rowKey={(row) => row?.id}
      renderItem={(item) => (
        <List.Item
          actions={[
            <a key="hapus" onClick={() => handleHapus(item)}>
              Hapus
            </a>,
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
        <Form.Item label="Unor SIMASTER">
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

const StatisticUnor = ({ data }) => {
  return (
    <Row gutter={16}>
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

  const { mutate: hapus, isLoading: isLoadingHapus } = useMutation({
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

  const handleHapus = (item) => {
    const id = item?.id;
    if (id) {
      hapus(id);
    } else {
      message.error("Silahkan pilih unit organisasi SIASN");
    }
  };

  return (
    <Card title="Padanan Unit Organisasi">
      <Row>
        <Col xs={24} md={16} lg={16} xl={16}>
          <Stack>
            <StatisticUnor data={statistics} />
            <UnorSimaster />
          </Stack>
          {detailUnorSimaster && (
            <Alert
              description={detailUnorSimaster?.hierarchy}
              type="success"
              showIcon
            />
          )}
          <Divider />
          {master_id && (
            <Stack>
              <UnorSiasn />

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
