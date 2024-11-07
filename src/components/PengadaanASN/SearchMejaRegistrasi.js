import { checkMejaVerif } from "@/services/public.services";
import { Center } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Layout, notification, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import PesertaDetail from "./PesertaDetail";
const { Content } = Layout;

function SearchMejaRegistrasi() {
  const inputRef = useRef(null);
  const [form] = Form.useForm();
  useEffect(() => {}, [inputRef]);
  const [currentData, setCurrentData] = useState(null);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: (value) => checkMejaVerif(value),
    onSuccess: (data) => {
      setCurrentData(data);
    },
    onError: () => {
      notification.error({
        message: "Nomor Peserta Tidak Ditemukan",
        description: "Silahkan coba lagi",
      });
      setCurrentData(null);
    },
    onSettled: () => {
      form.setFieldsValue({ no_peserta: "" });
      if (inputRef.current) {
        inputRef.current.focus();
      }
      // Gunakan setTimeout untuk memastikan focus bekerja setelah form di-reset
    },
  });

  const getNomerPeserta = (str) => {
    const result = str?.substr(71, 17);
    return result;
  };

  const handleFinish = async (e) => {
    try {
      const result = await form.validateFields();
      let parameter = "";

      const { no_peserta } = result;
      const hasil = getNomerPeserta(no_peserta);

      if (no_peserta?.length === 17) {
        parameter = no_peserta;
      } else {
        parameter = hasil;
      }

      await mutateAsync(parameter);
    } catch (error) {}
  };

  return (
    <Layout>
      <Content
        style={{
          padding: 24,
          height: "100vh",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <Form style={{ width: "700px" }} form={form} onFinish={handleFinish}>
          <Form.Item label="Nomor Peserta" name="no_peserta">
            <Input.Search
              ref={inputRef}
              placeholder="Tekan Enter untuk mencari"
            />
          </Form.Item>
        </Form>
        <Spin spinning={isLoading}>
          <PesertaDetail data={currentData} />
        </Spin>
      </Content>
    </Layout>
  );
}

export default SearchMejaRegistrasi;
