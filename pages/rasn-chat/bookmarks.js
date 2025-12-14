import Head from "next/head";
import { Typography, Badge, Space } from "antd";
import ChatLayout from "@/components/ChatLayout";
import { BookmarkList } from "@/components/RasnChat";
import { useBookmarkCount } from "@/hooks/useRasnChat";
import { IconBookmark } from "@tabler/icons-react";

const { Title } = Typography;

function BookmarksPage() {
  const { data: bookmarkData } = useBookmarkCount();
  const count = bookmarkData?.count || 0;

  return (
    <>
      <Head>
        <title>Saved Items - RASN Chat | Rumah ASN</title>
      </Head>

      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Space>
            <IconBookmark size={24} color="#faad14" />
            <Title level={4} style={{ margin: 0 }}>
              Saved Items
            </Title>
            {count > 0 && (
              <Badge count={count} style={{ backgroundColor: "#faad14" }} />
            )}
          </Space>
        </div>

        <BookmarkList />
      </div>
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
