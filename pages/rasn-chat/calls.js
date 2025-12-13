import Head from "next/head";
import { Select, Typography, Empty } from "antd";
import ChatLayout from "@/components/ChatLayout";
import { CallHistory } from "@/components/RasnChat";
import { useMyChannels } from "@/hooks/useRasnChat";
import { useState } from "react";

const { Title, Text } = Typography;

function CallsPage() {
  const [selectedChannel, setSelectedChannel] = useState(null);
  const { data: channels } = useMyChannels();

  return (
    <>
      <Head>
        <title>Riwayat Call - RASN Chat | Rumah ASN</title>
      </Head>

      <div style={{ padding: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Riwayat Panggilan
        </Title>

        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ marginRight: 8 }}>
            Filter Channel:
          </Text>
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
        </div>

        {selectedChannel ? (
          <CallHistory channelId={selectedChannel} />
        ) : (
          <Empty description="Pilih channel untuk melihat riwayat panggilan" />
        )}
      </div>
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
