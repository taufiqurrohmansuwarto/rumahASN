import {
  createUsulanVerifUser,
  findUsulanVerifUser,
  updateUsulanVerifUser,
} from "@/services/perencanaan.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Skeleton,
} from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import UsulanFormasiFasilitatorDetail from "./UsulanFormasiFasilitatorDetail";

const FormUsulanVerif = ({ data, update, isLoadingUpdate, id }) => {
  useEffect(() => {
    form.setFieldsValue(data);
  }, [data, form]);

  const handleSubmit = (values) => {
    const payload = {
      id,
      verifId: data.id,
      data: values,
    };
    update(payload);
  };

  const [form] = Form.useForm();
  return (
    <Card title="Dokumen Usulan">
      {JSON.stringify(data)}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="link_surat_usulan"
          rules={[
            { required: true },
            { type: "url", message: "Harus berupa url" },
          ]}
          label="Surat Usulan"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            { required: true },
            { type: "url", message: "Harus berupa url" },
          ]}
          name="link_lampiran"
          label="Lampiran"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            { required: true },
            { type: "url", message: "Harus berupa url" },
          ]}
          name="link_anjab_abk"
          label="Anjab Abk"
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[
            { required: true },
            { type: "url", message: "Harus berupa url" },
          ]}
          name="link_ketersediaan_anggaran"
          label="Ketersediaan Anggaran"
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoadingUpdate}
            disabled={isLoadingUpdate}
          >
            Ubah
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

function UsulanFormasiFasilitatorVerifier() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["perencanaan-usulan-formasi-verifier", id],
    () => findUsulanVerifUser(id),
    {}
  );

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createUsulanVerifUser(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat usulan verif");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "perencanaan-usulan-formasi-verifier",
          id,
        ]);
      },
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateUsulanVerifUser(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengupdate usulan verif");
      },
      onError: (error) => {
        message.error(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "perencanaan-usulan-formasi-verifier",
          id,
        ]);
      },
    }
  );

  const handleConfirm = () => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah anda yakin ingin membuat usulan verif?",
      onOk: async () => {
        const payload = {
          id,
          data: {},
        };
        await create(payload);
      },
    });
  };

  return (
    <Skeleton loading={isLoading} active>
      {!data ? (
        <>
          <Button onClick={handleConfirm}>Buat Usulan Verif</Button>
        </>
      ) : (
        <Row gutter={[16, 16]}>
          <Col md={24}>
            <FormUsulanVerif
              id={id}
              data={data}
              update={update}
              isLoadingUpdate={isLoadingUpdate}
            />
          </Col>
          <Col md={24}>
            <UsulanFormasiFasilitatorDetail verifId={data?.id} />
          </Col>
        </Row>
      )}
    </Skeleton>
  );
}

export default UsulanFormasiFasilitatorVerifier;
