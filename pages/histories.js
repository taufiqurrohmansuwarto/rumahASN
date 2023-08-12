import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { formatDateFromNow, jenisRiwayat } from "@/utils/client-utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { List, Typography, Button, Card, Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { usersHistories } from "../services";
import { useRouter } from "next/router";

const fetchItems = async ({ pageParam = 1, queryKey }) => {
  const [_, limit] = queryKey;
  const response = await usersHistories({
    page: pageParam,
    limit: limit,
  });

  return response;
};

const LinkTicket = ({ item }) => {
  return (
    <>
      {item?.ticket && (
        <>
          {" "}
          <Typography.Text>pada pertanyaan dengan judul</Typography.Text>{" "}
          <Link href={`/customers-tickets/${item?.ticket?.id}`}>
            <a>{item?.ticket?.title}</a>
          </Link>
        </>
      )}
    </>
  );
};

const HistoriesData = ({ data, loading, hasNextPage, fetchNextPage }) => {
  return (
    <>
      <List
        renderItem={(item) => (
          <List.Item>
            {jenisRiwayat(item?.action)}
            <LinkTicket item={item} /> {formatDateFromNow(item?.created_at)}
          </List.Item>
        )}
        footer={
          hasNextPage && (
            <Button
              style={{
                textAlign: "center",
              }}
              onClick={() => fetchNextPage()}
            >
              Load More
            </Button>
          )
        }
        rowKey={(row) => row?.id}
        loading={loading}
        dataSource={data}
      />
    </>
  );
};

function Histories() {
  const router = useRouter();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    ["user-histories", 10],
    fetchItems,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasNextPage) return lastPage.page + 1;
        return false;
      },
    }
  );

  const handleBack = () => router?.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Riwayat</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="Laporan Aktivitas"
        subTitle="Informasi Aktifitas Anda"
        loading={isLoading}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/tickets/semua">
                  <a>Pertanyaan Saya</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Riwayat</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card>
          <HistoriesData
            data={data?.pages?.flatMap((page) => page?.result)}
            loading={isLoading}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        </Card>
      </PageContainer>
    </>
  );
}

Histories.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Histories.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Histories;
