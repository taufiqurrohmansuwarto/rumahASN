import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";
import { patchAnomali2023 } from "@/services/anomali.services";
import { dataUtamaMasterByNip } from "@/services/master.services";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ChangeStatusAnomali = ({ data, open, onCancel }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const nip = router.query.nip;

  const queryClient = useQueryClient();

  const { mutate: update, isLoading } = useMutation(
    (data) => patchAnomali2023(data),
    {
      onSuccess: () => {
        message.success("Berhasil memperbarui data");
        onCancel();
      },
      onError: () => {
        message.error("Gagal memperbarui data");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-simaster-by-nip", nip]);
      },
    }
  );

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        is_repaired: data?.is_repaired,
        description: data?.description,
      });
    }
  }, [data, form]);

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      const payload = {
        id: data?.id,
        data: {
          is_repaired: result?.is_repaired,
          description: result?.description,
          reset: result?.reset,
        },
      };
      update(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      confirmLoading={isLoading}
      onOk={handleFinish}
      title="Perbaikan Anomali"
      centered
      open={open}
      onCancel={onCancel}
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          valuePropName="checked"
          name="is_repaired"
          label="Sudah diperbaiki?"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item valuePropName="checked" name="reset" label="Lepas">
          <Checkbox />
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const EmployeeBio = ({ data, loading }) => {
  const [open, setOpen] = useState(false);
  const [anomali, setAnomali] = useState(null);

  const handleOpen = (anomali) => {
    setAnomali(anomali);
    setOpen(true);
  };

  const handleClose = () => {
    setAnomali(null);
    setOpen(false);
  };

  return (
    <Card loading={loading}>
      <ChangeStatusAnomali data={anomali} open={open} onCancel={handleClose} />
      <Row gutter={[16, 16]}>
        <Col md={2}>
          <Avatar size={90} shape="square" src={data?.foto} />
        </Col>
        <Col md={10}>
          <Space direction="vertical">
            <Space size="small">
              <Tag color={data?.status === "Aktif" ? "green" : "red"}>
                {data?.status === "Aktif"
                  ? "Pegawai Aktif"
                  : "Pegawai Non Aktif"}
              </Tag>
              {data?.anomali?.length > 0 && (
                <>
                  {data?.anomali?.map((d) => (
                    <Tag
                      key={d?.id}
                      color={d?.is_repaired ? "green" : "red"}
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpen(d)}
                    >
                      {d?.jenis_anomali_nama}
                    </Tag>
                  ))}
                </>
              )}
            </Space>
            <Typography.Text>
              {data?.nama} - {data?.nip_baru}
            </Typography.Text>
            <Typography.Text>
              {data?.jabatan?.jabatan} -{" "}
              <Typography.Text type="secondary">
                {data?.skpd?.detail}
              </Typography.Text>
            </Typography.Text>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

const EmployeeNumberFasilitator = () => {
  const router = useRouter();
  const { nip } = router?.query;

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster-by-nip", nip],
    () => dataUtamaMasterByNip(nip)
  );
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pegawai</title>
      </Head>
      <PageContainer
        title="Detail Pegawai"
        onBack={() => router.back()}
        loading={isLoadingDataSimaster}
      >
        <>
          {dataSimaster ? (
            <>
              <Stack>
                <EmployeeBio
                  data={dataSimaster}
                  loading={isLoadingDataSimaster}
                />
                <Card>
                  <SiasnTab nip={nip} />
                </Card>
              </Stack>
            </>
          ) : (
            <Empty description="Data tidak ditemukan" />
          )}
        </>
      </PageContainer>
    </>
  );
};

EmployeeNumberFasilitator.Auth = {
  action: "manage",
  subject: "Feeds",
};

EmployeeNumberFasilitator.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default EmployeeNumberFasilitator;