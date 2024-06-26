import Bar from "@/components/Plots/Bar";
import { dataAdminByDate } from "@/services/anomali.services";
import { useQuery } from "@tanstack/react-query";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useState } from "react";
dayjs.locale("id");

function UserByDateAnomali() {
  const [currentDate, setCurrentDate] = useState(
    dayjs(new Date()).format("YYYY-MM-DD")
  );

  const { data, isLoading } = useQuery(
    ["data-admin-by-date", currentDate],
    () => dataAdminByDate(currentDate),
    {}
  );

  const handleChangeDate = (date, dateString) => {
    setCurrentDate(dateString);
  };

  const config = {
    data,
    label: {
      position: "middle",
    },
    xField: "value",
    yField: "label",
    seriesField: "label",
    legend: {
      position: "top-left",
    },
  };

  return (
    <div>
      <DatePicker onChange={handleChangeDate} />
      {data && data?.length > 0 ? (
        <Bar {...config} />
      ) : (
        <div>Tidak ada entrian</div>
      )}
    </div>
  );
}

export default UserByDateAnomali;
