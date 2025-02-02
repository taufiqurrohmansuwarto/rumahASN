import {
  deleteJfuRekon,
  getJfuSiasn,
  getJfuSimaster,
  getRekonJfu,
  postJfuRekon,
  syncJfuSiasn,
  syncJfuSimaster,
} from "@/services/rekon.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Form,
  List,
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
  TreeSelect,
  Typography,
} from "antd";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";

const queryConfig = {
  refetchOnWindowFocus: false,
};

const ListJfu = ({ data, hapus }) => {
  const handleHapus = async (item) => {
    await hapus(item);
  };

  return (
    <List
      header={<Typography.Title level={5}>Pelaksana SIASN</Typography.Title>}
      dataSource={data}
      rowKey={(row) => row?.id}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Popconfirm
              key="hapus"
              title="Apakah Anda yakin ingin menghapus data ini?"
              onConfirm={async () => await handleHapus(item)}
            >
              <a>Hapus</a>
            </Popconfirm>,
          ]}
        >
          <Space>
            {item?.JfuSiasn?.nama}
            <Tag color="yellow">SIASN</Tag>
          </Space>
        </List.Item>
      )}
    />
  );
};

// Komponen untuk TreeSelect JFU SIMASTER
const JfuSimasterSelect = ({
  data,
  loading,
  onSync,
  name,
  onSelect,
  defaultValue,
}) => (
  <Form.Item
    name={name}
    required={true}
    label={
      <>
        Jabatan Pelaksana SIMASTER
        <Button type="link" onClick={onSync} loading={loading}>
          sinkron
        </Button>
      </>
    }
  >
    <TreeSelect
      onSelect={onSelect}
      treeNodeFilterProp="title"
      placeholder="Ketik nama Jabatan Pelaksana"
      showSearch
      style={{ width: "100%" }}
      treeData={data}
      defaultValue={defaultValue}
    />
  </Form.Item>
);

// Komponen untuk Select JFU SIASN
const JfuSiasnSelect = ({ data, loading, onSync, onSearch, name }) => (
  <Form.Item
    name={name}
    required={true}
    label={
      <>
        Jabatan Pelaksana SIASN
        <Button type="link" onClick={onSync} loading={loading}>
          sinkron
        </Button>
      </>
    }
  >
    <Select
      listItemHeight={50}
      listHeight={100}
      showSearch
      optionFilterProp="nama"
      placeholder="Pilih Jabatan Pelaksana SIASN"
      filterOption={false}
      onSearch={onSearch}
    >
      {data?.map((item) => (
        <Select.Option key={item?.id} value={item?.id} nama={item?.nama}>
          {item?.nama} ({item?.cepat_kode})
        </Select.Option>
      ))}
    </Select>
  </Form.Item>
);

const RekonJfuSIASN = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");

  // Query untuk data JFU
  const { data: jfuSimaster } = useQuery(
    ["rekon-jfu-simaster"],
    getJfuSimaster,
    queryConfig
  );

  const { data: jfuSiasn } = useQuery(
    ["rekon-jfu-siasn"],
    getJfuSiasn,
    queryConfig
  );

  // Mutation untuk sinkronisasi
  const { mutate: syncMaster, isLoading: isLoadingMaster } = useMutation({
    mutationFn: syncJfuSimaster,
    onSuccess: () => {
      message.success("Berhasil sinkronasi data");
      queryClient.invalidateQueries(["rekon-jfu-simaster", "rekon-jfu-siasn"]);
    },
  });

  const { mutate: syncSiasn, isLoading: isLoadingSiasn } = useMutation({
    mutationFn: syncJfuSiasn,
    onSuccess: () => {
      message.success("Berhasil sinkronasi data");
      queryClient.invalidateQueries(["rekon-jfu-simaster", "rekon-jfu-siasn"]);
    },
  });

  const handleSearch = debounce((value) => {
    setSearchText(value);
  }, 3000);

  const filteredOptions = jfuSiasn?.filter((item) =>
    item.nama.toLowerCase().includes(searchText.toLowerCase())
  );

  const [form] = Form.useForm();
  const router = useRouter();

  const { data: rekonJfu, isLoading: isLoadingRekonJfu } = useQuery(
    ["rekon-jfu", router?.query?.id_simaster],
    () => getRekonJfu(router?.query?.id_simaster),
    queryConfig
  );

  const { mutate: post, isLoading: isLoadingPost } = useMutation({
    mutationFn: (payload) => postJfuRekon(payload),
    onSuccess: () => {
      message.success("Berhasil menyimpan data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-jfu", router?.query?.id_simaster],
      });
    },
    onError: (error) => {
      message.error("Gagal menyimpan data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-jfu", router?.query?.id_simaster],
      });
    },
  });

  const { mutateAsync: deleteJfu, isLoading: isLoadingDelete } = useMutation({
    mutationFn: (jfuId) => deleteJfuRekon(jfuId),
    onSuccess: () => {
      message.success("Berhasil menghapus data");
      queryClient.invalidateQueries({
        queryKey: ["rekon-jfu", router?.query?.id_simaster],
      });
    },
    onError: (error) => {
      message.error("Gagal menghapus data");
      console.log(error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["rekon-jfu", router?.query?.id_simaster],
      });
    },
  });

  const handleDelete = async (item) => {
    await deleteJfu(item?.id);
  };

  const handleSelect = (value) => {
    const url = `/rekon/rekon-jfu?id_simaster=${value}`;
    router.push(url);
  };

  const handleSave = async () => {
    const value = await form.validateFields();
    const payload = {
      id_simaster: router?.query?.id_simaster || value?.id_simaster,
      id_siasn: value?.id_siasn,
    };
    post(payload);
  };

  return (
    <Card title="Padanan Jabatan Pelaksana">
      <Form layout="vertical" form={form} onFinish={handleSave}>
        <JfuSimasterSelect
          name="id_simaster"
          onSelect={handleSelect}
          data={jfuSimaster}
          defaultValue={router?.query?.id_simaster}
          loading={isLoadingMaster}
          onSync={syncMaster}
        />

        <JfuSiasnSelect
          name="id_siasn"
          data={filteredOptions}
          loading={isLoadingSiasn}
          onSync={syncSiasn}
          onSearch={handleSearch}
        />
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoadingPost}
            disabled={isLoadingPost}
          >
            Simpan
          </Button>
        </Form.Item>
      </Form>
      <ListJfu data={rekonJfu} hapus={handleDelete} />
    </Card>
  );
};

export default RekonJfuSIASN;
