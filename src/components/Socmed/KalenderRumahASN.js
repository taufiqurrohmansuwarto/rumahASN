import { CalendarOutlined } from "@ant-design/icons";
import { Calendar, Card, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Title } = Typography;

const events = [];

const KalenderRumahASN = () => {
  const onSelect = (value) => {
    const selectedEvents = getListData(value);
    if (selectedEvents.length > 0) {
      console.log("Kegiatan pada tanggal ini:", selectedEvents);
    }
  };

  return (
    <Card
      title={
        <div
          style={{ display: "flex", alignItems: "center", color: "#fa8c16" }}
        >
          <CalendarOutlined style={{ marginRight: 8 }} />
          <Title level={4} style={{ margin: 0, color: "#fa8c16" }}>
            Kalender Kegiatan
          </Title>
        </div>
      }
      style={{ width: "100%", maxWidth: 800, margin: "auto" }}
    >
      <Calendar
        mode="month"
        cellRender={() => {}}
        fullscreen={false}
        onPanelChange={null}
      />
    </Card>
  );
};

export default KalenderRumahASN;
