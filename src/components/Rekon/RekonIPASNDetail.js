import { Card, Col, Row, Statistic } from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { getRekonIPASNDashboard } from "@/services/rekon.services";
import { Form, TreeSelect, Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import XLSX from "xlsx";

const DetailIPASN = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["rekon-ipasn-detail", router?.query?.skpd_id],
    queryFn: () =>
      getRekonIPASNDashboard({
        skpd_id: router?.query?.skpd_id,
        type: "test",
      }),
  });

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col md={8} xs={24} sm={24}>
          <Card>
            <Statistic title="PNS" value={data?.data?.rerata_total_pns} />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kompetensi (PNS)"
              value={data?.data?.rerata_kompetensi_pns}
              suffix="/ 35"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Disiplin (PNS)"
              value={data?.data?.rerata_disiplin_pns}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kinerja (PNS)"
              value={data?.data?.rerata_kinerja_pns}
              suffix="/ 30"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Pendidikan (PNS)"
              value={data?.data?.rerata_kualifikasi_pns}
              suffix="/ 25"
            />
          </Card>
        </Col>
        <Col md={8} xs={24} sm={24}>
          <Card>
            <Statistic title="PPPK" value={data?.data?.rerata_total_pppk} />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kompetensi (PPPK)"
              value={data?.data?.rerata_kompetensi_pppk}
              suffix="/ 35"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Disiplin (PPPK)"
              value={data?.data?.rerata_disiplin_pppk}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kinerja (PPPK)"
              value={data?.data?.rerata_kinerja_pppk}
              suffix="/ 30"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Pendidikan (PPPK)"
              value={data?.data?.rerata_kualifikasi_pppk}
              suffix="/ 25"
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

const RekonIPASNDetail = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["rekon-unor-simaster"],
    () => getUnorSimaster(),
    {}
  );

  const { mutateAsync: rekonIpasn, isLoading: isRekonIpasnLoading } =
    useMutation({
      mutationFn: () => getRekonIPASN({ skpd_id: router?.query?.skpd_id }),
    });

  const handleDownload = async () => {
    const result = await rekonIpasn();
    const { data, averageTotal } = result;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "IPASN");
    XLSX.writeFile(workbook, "IPASN.xlsx");
  };

  const handleChange = (value) => {
    router.push(`/rekon/dashboard/ipasn?skpd_id=${value}`);
  };

  return (
    <Row gutter={[12, 12]}>
      <Col md={12} xs={24}>
        <Form.Item>
          <TreeSelect
            treeNodeFilterProp="title"
            placeholder="Ketik nama unit organisasi"
            listHeight={400}
            showSearch
            style={{ width: "100%" }}
            treeData={data}
            value={router?.query?.skpd_id}
            onSelect={handleChange}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Button
          icon={<FileExcelOutlined />}
          type="primary"
          loading={isRekonIpasnLoading}
          disabled={isRekonIpasnLoading}
          onClick={handleDownload}
        >
          Unduh Data
        </Button>
      </Col>
      <Col md={24} xs={24}>
        <DetailIPASN />
      </Col>
    </Row>
  );
};

export default RekonIPASNDetail;
