import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import PodcastPlayer from "@/components/PodcastPlayer";
import { podcastUserDetail } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

function PodcastUserDetail() {
  const router = useRouter();
  const id = router?.query?.id;
  const { data, isLoading } = useQuery(
    ["podcast-user", id],
    () => podcastUserDetail(id),
    {
      refetchOnWindowFocus: false,
    }
  );
  return (
    <>
      <Head>
        <title>Rumah ASN - Podcast {data?.title}</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Detail Podcast"
        subTitle={data?.title}
        loading={isLoading}
      >
        <Card>
          <PodcastPlayer url={data?.audio_url} />
        </Card>
      </PageContainer>
    </>
  );
}

PodcastUserDetail.getLayout = (page) => {
  return <Layout active="/edukasi/podcasts">{page}</Layout>;
};

PodcastUserDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

export default PodcastUserDetail;
