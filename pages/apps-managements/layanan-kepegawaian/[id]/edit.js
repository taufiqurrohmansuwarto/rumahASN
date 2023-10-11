import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  detailLayanan,
  updateLayanan,
} from "@/services/layanan-kepegawaian.services";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  TreeSelect,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getTreeOrganization } from "@/services/index";
import Link from "next/link";
import Head from "next/head";

const FormTree = () => {
  const { data: dataTree } = useQuery(["organization-tree"], () =>
    getTreeOrganization()
  );

  return (
    <>
      {dataTree && (
        <>
          <Form.Item
            label="Struktur Organisasi"
            name="bidang"
            rules={[
              {
                required: true,
                message: "Struktur Organisasi tidak boleh kosong",
              },
            ]}
          >
            <TreeSelect
              labelInValue
              treeNodeFilterProp="label"
              treeData={dataTree}
              showSearch
              placeholder="Pilih Struktur Organisasi"
              treeDefaultExpandAll
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

const EditLayananKepegawaian = () => {
  const router = useRouter();
  const id = router.query?.id;

  const { data, isLoading } = useQuery(["detail-layanan-kepegawaian", id], () =>
    detailLayanan(id)
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateLayanan(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah data");
        router.push(`/apps-managements/layanan-kepegawaian`);
      },
      onError: () => message.error("Gagal mengubah data"),
    }
  );

  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        title: data.title,
        description: data.description,
        icon_url: data.icon_url,
        bidang: {
          label: data?.bidang?.label,
          value: data?.bidang?.id,
        },
      });
    }
  }, [data, form]);

  const handleUpdate = async () => {
    try {
      const value = await form.validateFields();
      const bidang = JSON.stringify({
        id: value.bidang.value,
        label: value.bidang.label,
      });

      const data = {
        id,
        data: {
          ...value,
          bidang,
        },
      };

      update(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Head>
        <title>Edit Layanan Kepegawaian</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title="Edit Layanan Kepegawaian"
        onBack={() => router?.back()}
        content="Form Edit Layanan Kepegawaian"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/layanan-kepegawaian">
                  <a>Layanan Kepegawaian</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Edit Layanan Kepegawaian</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Row>
          <Col xs={24} md={18}>
            <Card>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="title"
                  label="Judul"
                  rules={[
                    { required: true, message: "Judul tidak boleh kosong" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Deskripsi" name="description">
                  <MarkdownEditor
                    acceptedFileTypes={[
                      "image/*",
                      // word, excel, txt, pdf
                      ".doc",
                      ".docx",
                      ".xls",
                      ".xlsx",
                      ".txt",
                      ".pdf",
                    ]}
                    onRenderPreview={renderMarkdown}
                    onUploadFile={uploadFile}
                    mentionSuggestions={null}
                  />
                </Form.Item>
                <Form.Item name="icon_url" label="Alamat Gambar">
                  <Input />
                </Form.Item>
                <FormTree />
                <Form.Item>
                  <Button
                    onClick={handleUpdate}
                    disabled={isLoadingUpdate}
                    loading={isLoadingUpdate}
                  >
                    Edit
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

EditLayananKepegawaian.getLayout = function (page) {
  return <Layout active="/apps-managements/layanan-kepegawaian">{page}</Layout>;
};

EditLayananKepegawaian.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default EditLayananKepegawaian;
