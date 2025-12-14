import ChatLayout from "@/components/ChatLayout";
import PageContainer from "@/components/PageContainer";
import { CallHistory } from "@/components/RasnChat";
import { useMyChannels } from "@/hooks/useRasnChat";
import { Empty, Select, Typography } from "antd";
import Head from "next/head";
import { useState } from "react";

const { Title } = Typography;

function CallsPage() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const { data: channels } = useMyChannels();

  return (
    <>
      <Head>
        <title>Riwayat Call - RASN Chat | Rumah ASN</title>
      </Head>

      <PageContainer
        title="Riwayat Panggilan"
        extra={
          <Select
            placeholder="Pilih channel"
            allowClear
            style={{ width: 250 }}
            value={selectedChannel}
            onChange={setSelectedChannel}
            options={channels?.map((c) => ({
              value: c.id,
              label: `# ${c.name}`,
            }))}
          />
        }
      >
        {selectedChannel ? (
          <CallHistory channelId={selectedChannel} />
        ) : (
          <Empty description="Pilih channel untuk melihat riwayat panggilan" />
        )}
      </PageContainer>
    </>
  );
}

CallsPage.getLayout = function getLayout(page) {
  return <ChatLayout>{page}</ChatLayout>;
};

CallsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default CallsPage;
