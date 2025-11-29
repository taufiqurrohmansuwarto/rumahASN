import PageContainer from "@/components/PageContainer";
import ThreadsKonsultasiHukum from "@/components/SapaASN/KonsultasiHukum/ThreadsKonsultasiHukum";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  getKonsultasiHukumThreads,
  sendMessageKonsultasiHukum,
} from "@/services/sapa-asn.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, FloatButton, message } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const ThreadDetail = () => {
  useScrollRestoration();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;

  const { data, isLoading } = useQuery({
    queryKey: ["konsultasi-hukum-threads", id],
    queryFn: () => getKonsultasiHukumThreads(id),
    enabled: !!id,
  });

  const { mutateAsync: sendMessage, isLoading: sendLoading } = useMutation({
    mutationFn: (text) => sendMessageKonsultasiHukum(id, { message: text }),
    onSuccess: () => {
      queryClient.invalidateQueries(["konsultasi-hukum-threads", id]);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Gagal mengirim pesan");
    },
  });

  const handleSend = async (text) => {
    await sendMessage(text);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Thread Konsultasi Hukum</title>
      </Head>
      <PageContainer
        title="Thread Konsultasi Hukum"
        onBack={() => router.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/konsultasi-hukum">Konsultasi Hukum</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Thread #{id}</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <ThreadsKonsultasiHukum
          konsultasi={data?.konsultasi}
          messages={data?.threads || []}
          onSend={handleSend}
          loading={sendLoading}
          pageLoading={isLoading}
        />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

ThreadDetail.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/konsultasi-hukum">{page}</SapaASNLayout>
);

ThreadDetail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ThreadDetail;
