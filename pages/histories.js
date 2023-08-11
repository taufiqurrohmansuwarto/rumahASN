import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { formatDateFromNow, jenisRiwayat } from "@/utils/client-utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { List, Typography, Button, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { usersHistories } from "../services";

const fetchItems = async ({ pageParam = 1, queryKey }) => {
  const [_, limit] = queryKey;
  const response = await usersHistories({
    page: pageParam,
    limit: limit,
  });

  console.log(pageParam);

  return response;
};

const LinkTicket = ({ item }) => {
  return (
    <>
      {item?.ticket && (
        <>
          {" "}
          <Typography.Text>pada pertanyaan dengan judul</Typography.Text>{" "}
          <Link href={`/customers-tickets/${item?.id}`}>
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
        loading={loading}
        dataSource={data}
      />
    </>
  );
};

function Histories() {
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

  return (
    <>
      <Head>
        <title>Rumah ASN - Riwayat</title>
      </Head>
      <PageContainer title="Riwayat Anda" loading={isLoading}>
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
