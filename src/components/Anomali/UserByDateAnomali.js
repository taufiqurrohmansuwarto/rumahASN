import { dataAdminByDate } from "@/services/anomali.services";
import { Bar } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { DatePicker } from "antd";
import { useState } from "react";
import moment from "moment";

function UserByDateAnomali() {
  const [currentDate, setCurrentDate] = useState(moment().format("YYYY-MM-DD"));

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
    //     label: {
    //       position: "middle",
    //     },
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
