import PlotUsers from "@/components/Dashboards/PlotUsers";
import { getUnorSimaster } from "@/services/rekon.services";
import { getListMfa } from "@/services/siasn-services";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudDownloadOutlined,
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Row,
  Statistic,
  TreeSelect,
  Space,
  Divider,
  Typography,
  Empty,
} from "antd";
import { useState } from "react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;

function RekonMFA() {
  const [selectedOpd, setSelectedOpd] = useState(null);

  const { data: unorData, isLoading: unorLoading } = useQuery({
    queryKey: ["rekon-unor-simaster"],
    queryFn: getUnorSimaster,
    refetchOnWindowFocus: false,
  });

  const { data: mfaData, isLoading: mfaLoading } = useQuery({
    queryKey: ["rekon-mfa", selectedOpd],
    queryFn: () => getListMfa({ skpd_id: selectedOpd }),
    refetchOnWindowFocus: false,
    enabled: !!selectedOpd,
  });

  const { mutateAsync: listMfa, isLoading: listMfaLoading } = useMutation({
    mutationFn: (data) => getListMfa(data),
  });

  const downloadMfa = async (aktivasi) => {
    const result = await listMfa({
      skpd_id: selectedOpd,
      type: "download",
      aktivasi,
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(result);

    XLSX.utils.book_append_sheet(workbook, worksheet, "MFA");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), `mfa_${aktivasi}.xlsx`);
  };

  const totalMFA = mfaData?.reduce((acc, item) => acc + item.value, 0) || 0;

  const getStatusValue = (status) => {
    return mfaData?.find((item) => item.title === status)?.value || 0;
  };

  const calculatePercentage = (status) => {
    if (!mfaData?.length || totalMFA === 0) return "(0%)";

    const value = getStatusValue(status);
    return `(${((value / totalMFA) * 100).toFixed(2)}%)`;
  };

  const statisticItems = [
    {
      title: "Total Pegawai",
      key: "total",
      value: totalMFA,
      prefix: <UserOutlined style={{ color: "#1890ff" }} />,
      valueStyle: {},
      color: "blue",
    },
    {
      title: "SUDAH MFA",
      value: getStatusValue("SUDAH"),
      key: "SUDAH",
      prefix: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      valueStyle: { color: "#52c41a" },
      suffix: calculatePercentage("SUDAH"),
      color: "success",
    },
    {
      title: "BELUM MFA",
      key: "BELUM",
      value: getStatusValue("BELUM"),
      prefix: <CloseCircleOutlined style={{ color: "#f5222d" }} />,
      valueStyle: { color: "#f5222d" },
      suffix: calculatePercentage("BELUM"),
      color: "error",
    },
    {
      title: "TIDAK TERDATA",
      key: "TIDAK TERDATA",
      value: getStatusValue("TIDAK TERDATA"),
      prefix: <QuestionCircleOutlined style={{ color: "#1890ff" }} />,
      valueStyle: { color: "#1890ff" },
      suffix: calculatePercentage("TIDAK TERDATA"),
      color: "blue",
    },
  ];

  return (
    <Card
      title={<Title level={4}>Data Multi Factor Authentication</Title>}
      bordered
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <TreeSelect
          loading={unorLoading}
          treeData={unorData}
          treeNodeFilterProp="title"
          placeholder="Ketik nama unit organisasi"
          listHeight={400}
          showSearch
          style={{ width: "100%" }}
          onChange={setSelectedOpd}
        />

        <Row gutter={[16, 16]}>
          {statisticItems.map((item, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                title={<Text strong>{item.title}</Text>}
                extra={
                  index !== 0 && (
                    <Button
                      type="primary"
                      size="small"
                      loading={listMfaLoading}
                      icon={<CloudDownloadOutlined />}
                      onClick={() => downloadMfa(item.key)}
                    >
                      Download
                    </Button>
                  )
                }
                type={item.color}
                hoverable
              >
                <Statistic
                  value={item.value}
                  valueStyle={item.valueStyle}
                  prefix={item.prefix}
                  suffix={item.suffix}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {mfaData && mfaData.length > 0 ? (
          <Card title={<Text strong>Visualisasi Data MFA</Text>}>
            <PlotUsers data={mfaData} />
          </Card>
        ) : selectedOpd && !mfaLoading ? (
          <Empty description="Tidak ada data yang tersedia" />
        ) : null}
      </Space>
    </Card>
  );
}

export default RekonMFA;
