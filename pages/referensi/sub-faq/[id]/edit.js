import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { detailSubFaqs, getFaqs, updateSubFaq } from "@/services/index";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { Grid, Stack } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Input, Select, Skeleton, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const EditSubFaq = () => {
  const [faq, setFaq] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAsnwer] = useState(null);
  const router = useRouter();

  const { data, isLoading } = useQuery(["faqs"], () => getFaqs(), {
    refetchOnWindowFocus: false,
  });

  const {
    data: detail,
    isLoading: isLoadingDetail,
    status,
  } = useQuery(
    ["sub-faqs", router?.query?.id],
    () => detailSubFaqs(router?.query?.id),
    {
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (status === "success") {
      setFaq(detail?.faq_id);
      setQuestion(detail?.question);
      setAsnwer(detail?.answer);
    }
  }, [status, detail]);

  const reset = () => {
    setFaq(null);
    setQuestion(null);
    setAsnwer(null);
  };

  const { mutate, isLoading: isLoadingCreate } = useMutation(
    (data) => updateSubFaq(data),
    {
      onSuccess: () => {
        reset();
        message.success("Berhasil merubah sub faq");
        router.push("/referensi/sub-faq");
      },
      onError: () => {
        message.error("Gagal merubah sub faq");
      },
    }
  );

  const handleSubmit = () => {
    const complete = faq && question && answer;

    if (!complete) {
      message.error("Mohon lengkapi data");
    } else {
      const data = {
        id: router?.query?.id,
        data: { faq_id: faq, question, answer },
      };
      mutate(data);
    }
  };

  const handleBack = () => router.back();

  return (
    <PageContainer
      onBack={handleBack}
      title="Kamus Referensi"
      subTitle="Edit Sub FAQ"
    >
      <Grid>
        <Grid.Col span={8}>
          <Skeleton loading={isLoading || isLoadingDetail}>
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
            Edit
          </Button>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
};

EditSubFaq.getLayout = function getLayout(page) {
  return <Layout active="/referensi/sub-faq">{page}</Layout>;
};

EditSubFaq.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default EditSubFaq;
