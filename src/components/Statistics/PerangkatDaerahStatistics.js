import {
  getGolongan,
  getJenisJabatan,
  getJumlah,
  getPendidikan,
  getJenisKelamin,
  getUsia,
  getPerangkatDaerah,
} from "@/services/statistics.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Select, Typography } from "antd";
import { useState } from "react";
import PageContainer from "../PageContainer";
import Column from "../Plots/Column";
import Bar from "../Plots/Bar";
import Line from "../Plots/Line";
import Pie from "../Plots/Pie";
import { Center } from "@mantine/core";
import Welcome from "../AI/Welcome";

const PieJenisKelamin = ({ data }) => {
  const config = {
    data,
    renderer: "svg",
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-50%",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
  };
  return <>{data && <Pie {...config} />}</>;
};

const PieUsia = ({ data }) => {
  const config = {
    data,
    renderer: "svg",
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-50%",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
  };
  return <>{data && <Pie {...config} />}</>;
};

const LineJumlah = ({ data }) => {
  const config = {
    data,
    xField: "bulan",
    renderer: "svg",
    yField: "value",
    label: {
      fontSize: 16,
    },
    point: {
      size: 5,
      shape: "diamond",
      style: {
        fill: "white",
        stroke: "#5B8FF9",
        lineWidth: 2,
      },
    },
    tooltip: {
      showMarkers: false,
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: "#000",
          fill: "red",
        },
      },
    },
    interactions: [
      {
        type: "marker-active",
      },
    ],
  };
  return <>{data && <Line {...config} />}</>;
};

const ColumnGolongan = ({ data }) => {
  const config = {
    data,
    xField: "type",
    yField: "value",
    renderer: "svg",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        fontSize: 12,
      },
    },
    color: "#531dab",
  };
  return <>{data && <Column {...config} />}</>;
};

const BarJenisJabatan = ({ data }) => {
  const config = {
    data,
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        fontSize: 12,
      },
    },
    xField: "value",
    yField: "type",
    renderer: "svg",
    seriesField: "type",
    title: {
      text: "Golongan",
      style: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
  };
  return <>{data && <Bar {...config} />}</>;
};

const ColumnPendidikan = ({ data }) => {
  const config = {
    data,
    renderer: "svg",
    xField: "type",
    yField: "value",
    title: {
      text: "Pendidikan",
      style: {
        fontSize: 16,
        fontWeight: "bold",
      },
    },
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        fontSize: 12,
      },
    },
    color: "#003eb3",
  };

  return <>{data && <Column {...config} />}</>;
};

function PerangkatDaerahStatistics() {
  const [perangkatDaerah, setPerangkatDaerah] = useState(null);
  const { data, isLoading } = useQuery(["perangkat_daerah"], () =>
    getPerangkatDaerah()
  );

  const { data: pendidikan, isLoading: isLoadingPendidikan } = useQuery(
    ["pendidikan", perangkatDaerah],
    () => getPendidikan(perangkatDaerah),
    { enabled: !!perangkatDaerah }
  );

  const { data: jenisJabatan, isLoading: isLoadingJenisJabatan } = useQuery(
    ["jenis_jabatan", perangkatDaerah],
    () => getJenisJabatan(perangkatDaerah),
    { enabled: !!perangkatDaerah }
  );

  const { data: golongan, isLoading: isLoadingGolongan } = useQuery(
    ["golongan", perangkatDaerah],
    () => getGolongan(perangkatDaerah),
    { enabled: !!perangkatDaerah }
  );

  const { data: jumlah, isLoading: isLoadingJumlah } = useQuery(
    ["jumlah", perangkatDaerah],
    () => getJumlah(perangkatDaerah),
    { enabled: !!perangkatDaerah }
  );

  const { data: jenisKelamin, isLoading: isLoadingJenisKelamin } = useQuery(
    ["jenis_kelamin", perangkatDaerah],
    () => getJenisKelamin(perangkatDaerah),
    { enabled: !!perangkatDaerah }
  );

  const { data: usia, isLoading: isLoadingUsia } = useQuery(
    ["usia", perangkatDaerah],
    () => getUsia(perangkatDaerah),
    { enabled: !!perangkatDaerah }
  );

  return (
    <PageContainer>
      <Select
        style={{ width: "100%", marginBottom: 16 }}
        value={perangkatDaerah}
        showSearch
        optionFilterProp="label"
        onChange={(value) => setPerangkatDaerah(value)}
        options={data}
        placeholder="Pilih Perangkat Daerah"
      />
      <Welcome
        icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        title="Statistik Perangkat Daerah"
        description={`Statistik perangkat daerah ${perangkatDaerah}`}
        style={{ marginBottom: 32 }}
      />
      <Row gutter={[32, 32]}>
        <Col md={12}>
          <Card title={`${perangkatDaerah} - Jenis Kelamin`}>
            <PieJenisKelamin data={jenisKelamin} />
          </Card>
        </Col>
        <Col md={12}>
          <Card title={`${perangkatDaerah} - Usia`}>
            <PieUsia data={usia} />
          </Card>
        </Col>
        <Col md={24}>
          <Card title={`${perangkatDaerah} - Jenis Jabatan`}>
            <BarJenisJabatan data={jenisJabatan} />
          </Card>
        </Col>
        <Col md={12}>
          <Card title={`${perangkatDaerah} - Pendidikan`}>
            <ColumnPendidikan data={pendidikan} />
          </Card>
        </Col>
        <Col md={12}>
          <Card title={`${perangkatDaerah} - Golongan`}>
            <ColumnGolongan data={golongan} />
          </Card>
        </Col>
        <Col md={24}>
          <Card title={`${perangkatDaerah} - Jumlah Pegawai`}>
            <LineJumlah data={jumlah} />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

export default PerangkatDaerahStatistics;
