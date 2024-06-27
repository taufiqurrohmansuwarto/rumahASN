import {
  getDetailDisparitasUnor,
  getDetailUnor,
  unitOrganisasi,
  updateDisparitasUnor,
} from "@/services/siasn-services";
import { SearchOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Tree,
  TreeSelect,
  message,
} from "antd";
import { useEffect, useState } from "react";
import DisparitasUnorSIMASTER from "./DisparitasUnorSIMASTER";

const ModalDisparitasUnor = ({ open, onClose, selectedKey }) => {
  const [form] = Form.useForm();

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
        onClose();
      },
    }
  );

  const handleOk = async () => {
    const data = await form.validateFields();
    const payload = {
      data,
      id: selectedKey,
    };
    console.log(payload);
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
          <Form.Item
            valuePropName="checked"
            name="unor_sekolah"
            label="Unor Sekolah"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item
            valuePropName="checked"
            name="duplikasi_unor"
            label="Duplikasi Unor"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item valuePropName="checked" name="aktif" label="Aktif">
            <Checkbox />
          </Form.Item>
          <Form.Item name="NSPN" label="NSPN">
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
    setSelectedKey(null);
  };

  const handleChange = (value) => {
    setTreeId(value);
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

  const handleSelect = (selectedKeys, info) => {
    const key = selectedKeys[0];
    setSelectedKey(key);
    setOpen(true);
  };

  return (
    <div>
      <ModalDisparitasUnor
        open={open}
        onClose={handleClose}
        selectedKey={selectedKey}
      />
      {/* {JSON.stringify(detailUnor)} */}
      <Row gutter={[8, 16]}>
        <Col md={12}>
          <Stack>
            {data && (
              <>
                <TreeSelect
                  onChange={handleChange}
                  value={treeId}
                  showSearch
                  treeNodeFilterProp="label"
                  style={{ width: "100%" }}
                  allowClear
                  treeData={data}
                />
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
              <Tree
                showLine
                onSelect={handleSelect}
                height={600}
                defaultExpandAll
                treeData={detailUnor}
              />
            )}
          </Stack>
        </Col>
        <Col md={12}>
          <DisparitasUnorSIMASTER />
        </Col>
      </Row>
    </div>
  );
}

export default DisparitasUnorSIASN;
