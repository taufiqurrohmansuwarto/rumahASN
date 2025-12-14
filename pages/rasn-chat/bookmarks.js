import ChatLayout from "@/components/ChatLayout";
import PageContainer from "@/components/PageContainer";
import { BookmarkList } from "@/components/RasnChat";
import { useBookmarkCount } from "@/hooks/useRasnChat";
import { Badge } from "antd";
import Head from "next/head";

function BookmarksPage() {
  const { data: bookmarkData } = useBookmarkCount();
  const count = bookmarkData?.count || 0;

  return (
    <>
      <Head>
        <title>Saved Items - RASN Chat | Rumah ASN</title>
      </Head>

      <PageContainer
        title="Saved Items"
        subTitle={
          count > 0 && (
            <Badge count={count} style={{ backgroundColor: "#faad14" }} />
          )
        }
      >
        <BookmarkList />
      </PageContainer>
    </>
  );
}

BookmarksPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

BookmarksPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default BookmarksPage;
