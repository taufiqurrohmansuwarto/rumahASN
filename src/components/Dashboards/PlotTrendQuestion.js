import { trends } from "@/services/admin.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "antd";
import { useRef } from "react";
import Bar from "@/components/Plots/Bar";

const serialize = (data) => {
  return data?.map((item) => {
    return {
      value: parseInt(item?.total_tickets, 10),
      title: item?.sub_category_title,
    };
  });
};

function PlotTrendQuestion() {
  const ref = useRef();

  const { data, isLoading } = useQuery(["analysis-trends"], () => trends(), {
    refetchOnWindowFocus: false,
  });

  const downloadImage = () => {
    ref?.current?.downloadImage();
  };

  const config = {
    data: serialize(data),
    xField: "value",
    yField: "title",
    seriesField: "title",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <Card
      title="Trend Pertanyaan 3 Bulan Terakhir"
      extra={<Button onClick={downloadImage}>Unduh Gambar</Button>}
    >
      {data && (
        <Bar
          loading={isLoading}
          onReady={(plot) => {
            ref.current = plot;
          }}
          {...config}
        />
      )}
    </Card>
  );
}

export default PlotTrendQuestion;
