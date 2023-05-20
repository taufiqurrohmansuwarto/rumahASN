import { createSubFaq, getFaqs } from "@/services/index";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { Stack } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Input, message, Select, Skeleton } from "antd";
import { Grid } from "@mantine/core";
import { useState } from "react";
import { useRouter } from "next/router";
import PageContainer from "@/components/PageContainer";
import Layout from "@/components/Layout";

const CreateSubFaq = () => {
  const [faq, setFaq] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAsnwer] = useState(null);
  const router = useRouter();

  const reset = () => {
    setFaq(null);
    setQuestion(null);
    setAsnwer(null);
  };

  const { mutate, isLoading: isLoadingCreate } = useMutation(
    (data) => createSubFaq(data),
    {
      onSuccess: () => {
        reset();
        message.success("Berhasil membuat sub faq");
        router.push("/referensi/sub-faq");
      },
      onError: () => {
        message.error("Gagal membuat sub faq");
      },
    }
  );

  const handleSubmit = () => {
    const complete = faq && question && answer;

    if (!complete) {
      message.error("Mohon lengkapi data");
    } else {
      const data = { faq_id: faq, question, answer };
      mutate(data);
    }
  };

  const { data, isLoading } = useQuery(["faqs"], () => getFaqs(), {
    refetchOnWindowFocus: false,
  });

  const handleBack = () => router.back();

  return (
    <PageContainer
      onBack={handleBack}
      title="Kamus Referensi"
      subTitle="Buat Sub Kategori FAQ"
    >
      <Grid>
        <Grid.Col span={8}>
          <Skeleton loading={isLoading}>
            <Stack>
              <Select
                placeholder="Pilih FAQ"
                value={faq}
                onChange={(v) => setFaq(v)}
                optionFilterProp="name"
                showSearch
              >
                {data?.map((item) => (
                  <Select.Option
                    name={item?.name}
                    value={item?.id}
                    key={item?.id}
                  >
                    {item?.name}
                  </Select.Option>
                ))}
              </Select>
              <Input
                placeholder="Pertanyaan"
                value={question}
                onChange={(e) => setQuestion(e?.target?.value)}
              />
              <MarkdownEditor
                placeholder="Jawaban"
                value={answer}
                onRenderPreview={renderMarkdown}
                onUploadFile={uploadFile}
                onChange={setAsnwer}
              />
            </Stack>
          </Skeleton>
          <Button
            disabled={isLoadingCreate}
            loading={isLoadingCreate}
            style={{
              marginTop: 10,
            }}
            onClick={handleSubmit}
            type="primary"
          >
            Submit
          </Button>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
};

CreateSubFaq.getLayout = function getLayout(page) {
  return <Layout active="/referensi/sub-faq">{page}</Layout>;
};

CreateSubFaq.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default CreateSubFaq;
