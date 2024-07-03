import {
  getDetailDisparitasUnor,
  getDetailUnor,
  reportDisparitasUnorById,
  unitOrganisasi,
  updateDisparitasUnor,
} from "@/services/siasn-services";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Skeleton,
  Tag,
  Tooltip,
  Tree,
  TreeSelect,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import DisparitasUnorSIMASTER from "./DisparitasUnorSIMASTER";

const ModalDisparitasUnor = ({
  open,
  onClose,
  selectedKey,
  treeId,
  refetch,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: detailDisparitas, isLoading: isLoadingDetailDisparitas } =
    useQuery(
      ["detail-disparitas", selectedKey],
      () => getDetailDisparitasUnor(selectedKey),
      {
        refetchOnWindowFocus: false,
        enabled: !!selectedKey,
      }
    );

  useEffect(() => {
    if (detailDisparitas) {
      const disparitas = detailDisparitas?.data;
      form.setFieldsValue({
        unor_sekolah: disparitas?.unor_sekolah,
        duplikasi_unor: disparitas?.duplikasi_unor,
        aktif: disparitas?.aktif,
        NSPN: disparitas?.NSPN,
      });
    }
  }, [detailDisparitas, form]);

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateDisparitasUnor(data),
    {
      onSuccess: () => {
        message.success("Disparitas berhasil diubah");
        refetch();
        onClose();
      },
      onError: () => {
        message.error("Disparitas gagal diubah");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["detail-disparitas", selectedKey]);
        queryClient.invalidateQueries(["detail-unor", treeId]);
      },
    }
  );

  const handleOk = async () => {
    const data = await form.validateFields();
    const payload = {
      data,
      id: selectedKey,
    };
    update(payload);
  };

  return (
    <Modal
      confirmLoading={isLoadingUpdate}
      onOk={handleOk}
      open={open}
      onCancel={onClose}
      width={800}
      title="Disparitas Data Unit Organisasi"
    >
      <Skeleton loading={isLoadingDetailDisparitas}>
        <Form form={form} layout="vertical">
          <Form.Item name="unor_sekolah" label="Unor Sekolah">
            <Select>
              <Select.Option value="true">YA</Select.Option>
              <Select.Option value="false">TIDAK</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="unor_sekolah" label="Unor Sekolah">
            <Select>
              <Select.Option value="true">YA</Select.Option>
              <Select.Option value="false">TIDAK</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="duplikasi_unor" label="Duplikasi Unor">
            <Select>
              <Select.Option value="true">YA</Select.Option>
              <Select.Option value="false">TIDAK</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="NSPN" label="NPSN">
            <Input />
          </Form.Item>
        </Form>
      </Skeleton>
    </Modal>
  );
};

function DisparitasUnorSIASN() {
  const [treeId, setTreeId] = useState(null);

  const [selectedKey, setSelectedKey] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (value) => {
    setTreeId(value);
  };

  const renderLabel = (node) => {
    return (
      <span>
        {node.title}
        {node.unor_sekolah && (
          <Tag color="green" style={{ marginLeft: 8 }}>
            Sekolah
          </Tag>
        )}
        {node.duplikasi_unor && (
          <Tag color="red" style={{ marginLeft: 8 }}>
            Duplikasi
          </Tag>
        )}
        {node.aktif && (
          <Tag color="blue" style={{ marginLeft: 8 }}>
            Aktif
          </Tag>
        )}
        {node.NSPN && (
          <Tooltip title={`NSPN: ${node?.NSPN}`}>
            <Tag color="gold">NSPN</Tag>
          </Tooltip>
        )}
      </span>
    );
  };

  const { data, isLoading } = useQuery(
    ["disparitas-unor"],
    () => unitOrganisasi(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: detailUnor,
    isLoading: loadingDetailUnor,
    refetch,
    isFetching,
  } = useQuery(["detail-unor", treeId], () => getDetailUnor(treeId), {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const handleSearch = () => {
    refetch();
  };

  const handleSelect = (selectedKeys, info, e) => {
    const key = info?.node?.id;
    setSelectedKey(key);
    setOpen(true);
  };

  const handleDownload = () => {
    Modal.confirm({
      title: "Unduh Data",
      content: "Apakah anda yakin ingin mengunduh data?",
      onOk: async () => {
        // donwload excel
        const data = await reportDisparitasUnorById(treeId);
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "data_disparitas_unor_siasn.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      },
    });
  };

  return (
    <div>
      <ModalDisparitasUnor
        open={open}
        onClose={handleClose}
        selectedKey={selectedKey}
        treeId={treeId}
        refetch={refetch}
      />
      {/* {JSON.stringify(detailUnor)} */}
      <Row gutter={[16, 32]}>
        <Col md={12} xs={24}>
          <Stack>
            {data && (
              <>
                <Form.Item help="Unit Organisasi SIASN">
                  <TreeSelect
                    onChange={handleChange}
                    value={treeId}
                    showSearch
                    treeNodeFilterProp="label"
                    style={{ width: "100%" }}
                    allowClear
                    treeData={data}
                  />
                </Form.Item>
                <Button
                  disabled={isFetching}
                  loading={isFetching}
                  onClick={handleSearch}
                  type="primary"
                  icon={<SearchOutlined />}
                >
                  Cari
                </Button>
              </>
            )}
            {detailUnor && (
              <Stack>
                <Button
                  onClick={handleDownload}
                  icon={<DownloadOutlined />}
                  type="primary"
                >
                  Unduh
                </Button>
                <Tree
                  blockNode
                  titleRender={renderLabel}
                  onChange={(e) => console.log(e)}
                  showLine
                  onSelect={handleSelect}
                  height={600}
                  defaultExpandAll
                  treeData={detailUnor}
                />
              </Stack>
            )}
          </Stack>
        </Col>
        <Col md={12} xs={24}>
          <DisparitasUnorSIMASTER />
        </Col>
      </Row>
    </div>
  );
}

export default DisparitasUnorSIASN;
