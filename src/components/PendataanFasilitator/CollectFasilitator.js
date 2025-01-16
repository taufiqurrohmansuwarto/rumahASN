import PageContainer from "@/components/PageContainer";
import {
  postPendataan,
  publicUnorAsn,
} from "@/services/pendataan-fasilitator.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  TreeSelect,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import FormCariAsn from "./FormCariAsn";

function CollectFasilitator() {
  const { data: dataUnor, isLoading: isLoadingUnor } = useQuery(
    ["public-unor-asn"],
    () => publicUnorAsn(),
    {}
  );

  const [jenisPegawai, setJenisPegawai] = useState(null);
  const [selectedUnor, setSelectedUnor] = useState(null);
  const [form] = Form.useForm();

  const handleSelectUnor = (value) => {
    setSelectedUnor(value);
  };

  const { mutate: postData, isLoading: isLoadingPost } = useMutation({
    mutationFn: (payload) => postPendataan(payload),
    onSuccess: () => {
      message.success("Berhasil menyimpan data");
      form.resetFields();
    },
    onError: (error) => {
      message.error("Gagal menyimpan data");
      // console.log(error);
    },
  });

  const handleSubmit = async (values) => {
    // console.log(values);
    postData(values);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Pendataan Fasilitator</title>
      </Head>
      <PageContainer
        title="Pendataan Fasilitator"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                Pendataan Fasilitator SIMASTER dan SIASN
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Row gutter={[32, 32]}>
            <Col md={12} xs={24}>
              <Form.Item
                name="jenis_kepegawaian"
                label="Jenis Pegawai"
                rules={[
                  {
                    required: true,
                    message: "tidak boleh kosong",
                  },
                ]}
              >
                <Select
                  options={[
                    { value: "asn", label: <span>ASN</span> },
                    { value: "nonasn", label: <span>Non ASN</span> },
                  ]}
                  onChange={(value) => setJenisPegawai(value)}
                />
              </Form.Item>

              {jenisPegawai === "nonasn" && (
                <Form.Item
                  name="nama"
                  label="Nama"
                  rules={[
                    {
                      required: true,
                      message: "tidak boleh kosong",
                    },
                  ]}
                >
                  <Input placeholder="Nama" />
                </Form.Item>
              )}

              {jenisPegawai === "asn" && (
                <FormCariAsn
                  help="ketik NIP Tanpa Spasi dan tunggu..."
                  label="NIP"
                  name="asn_id"
                />
              )}

              <Form.Item
                name="tipe_pengelola"
                label="Tipe Fasilitator"
                rules={[
                  {
                    required: true,
                    message: "tidak boleh kosong",
                  },
                ]}
              >
                <Select
                  options={[
                    { value: "siasn", label: <span>SIASN</span> },
                    { value: "simaster", label: <span>SIMASTER</span> },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="skpd_id"
                label="Pilih Unit Organisasi"
                rules={[
                  {
                    required: true,
                    message: "tidak boleh kosong",
                  },
                ]}
              >
                <TreeSelect
                  showSearch
                  treeNodeFilterProp="title"
                  treeData={dataUnor}
                  onSelect={handleSelectUnor}
                  value={selectedUnor}
                />
              </Form.Item>
              <Form.Item
                name="kode"
                label="Masukkan Kode"
                rules={[
                  {
                    required: true,
                    message: "tidak boleh kosong",
                  },
                ]}
              >
                <Input placeholder="Kode" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              loading={isLoadingPost}
              disabled={isLoadingPost}
              type="primary"
              htmlType="submit"
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </PageContainer>
    </>
  );
}

export default CollectFasilitator;
