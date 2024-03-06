import {
  editSettingTemplate,
  getSettingTemplate,
  viewCertificate,
} from "@/services/webinar.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Form, InputNumber, Row, Select, message } from "antd";
import React, { useEffect } from "react";

const FormSettingSertificate = ({ id }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["setting-template", id],
    () => getSettingTemplate(id),
    {}
  );

  const { mutateAsync: edit, isLoading: isLoadingEdit } = useMutation(
    (data) => editSettingTemplate(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah setting sertifikat");
      },
      onError: () => {
        message.error("Gagal mengubah setting sertifikat");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["setting-template", id]);
        queryClient.invalidateQueries(["view-certificate", id]);
      },
    }
  );

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        nomerSertifikatFontSize: data?.nomerSertifikatFontSize || 10,
        nomerSertifikatAlignment: data?.nomerSertifikatAlignment || "left",
        namaFontSize: data?.namaFontSize || 10,
        namaAlignment: data?.namaAlignment || "left",
        employeeNumberFontSize: data?.employeeNumberFontSize || 10,
        employeeNumberAlignment: data?.employeeNumberAlignment || "left",
        jabatanFontSize: data?.jabatanFontSize || 10,
        jabatanAlignment: data?.jabatanAlignment || "left",
        instansiFontSize: data?.instansiFontSize || 10,
        instansiAlignment: data?.instansiAlignment || "left",
      });
    }
  }, [form, data]);

  const handleOk = async (values) => {
    await edit({ id, data: values });
  };

  const [form] = Form.useForm();

  return (
    <div>
      <Form onFinish={handleOk} layout="vertical" form={form}>
        <Row>
          <Col span={5}>
            <Form.Item
              label="Nomer Sertifikat"
              required
              name="nomerSertifikatFontSize"
            >
              <InputNumber defaultValue={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Alignment"
              required
              name="nomerSertifikatAlignment"
            >
              <Select>
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="right">Right</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={5}>
            <Form.Item label="Nama" required name="namaFontSize">
              <InputNumber defaultValue={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Alignment" required name="namaAlignment">
              <Select>
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="right">Right</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={5}>
            <Form.Item label="NIP" required name="employeeNumberFontSize">
              <InputNumber defaultValue={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Alignment"
              required
              name="employeeNumberAlignment"
            >
              <Select>
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="right">Right</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={5}>
            <Form.Item label="Jabatan" required name="jabatanFontSize">
              <InputNumber defaultValue={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Alignment" required name="jabatanAlignment">
              <Select>
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="right">Right</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={5}>
            <Form.Item label="Instansi" required name="instansiFontSize">
              <InputNumber defaultValue={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Alignment" required name="instansiAlignment">
              <Select>
                <Select.Option value="left">Left</Select.Option>
                <Select.Option value="center">Center</Select.Option>
                <Select.Option value="right">Right</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button
            type="primary"
            disabled={isLoadingEdit}
            loading={isLoadingEdit}
            htmlType="submit"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

function AdminViewCerttificate({ id }) {
  const { data, isLoading, refetch } = useQuery(
    ["view-certificate", id],
    () => viewCertificate(id),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div>
      <FormSettingSertificate id={id} />
      <Button
        style={{
          marginBottom: 16,
        }}
        type="primary"
        onClick={() => refetch()}
        loading={isLoading}
      >
        Refresh
      </Button>
      {data && (
        <iframe
          src={`data:application/pdf;base64,${data?.file}`}
          width="100%"
          height="800px"
        ></iframe>
      )}
    </div>
  );
}

export default AdminViewCerttificate;
