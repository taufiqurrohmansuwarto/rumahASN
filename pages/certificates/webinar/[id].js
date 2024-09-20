import PageContainer from "@/components/PageContainer";
import { verifyPdfService } from "@/services/public.services";
import { checkCertificateWebinar } from "@/services/webinar.services";
import { DownloadOutlined, VerifiedOutlined } from "@ant-design/icons";
import { Alert, Paper, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Collapse,
  Empty,
  Form,
  Input,
  Result,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  message,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const DetailInformartion = ({ data }) => {
  return (
    <>
      <Space>
        <Tag color="yellow">{data?.data?.conclusion}</Tag>
        <Tag color="yellow">{data?.data?.description}</Tag>
      </Space>
      {data?.data?.signatureInformations?.map((item, idx) => (
        <Tabs key={item?.id} type="card">
          <Tabs.TabPane tab={`Tanda Tangan #${idx + 1}`} key={item?.id}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form layout="vertical">
                  <Form.Item label="Disegel secara elektronik oleh">
                    <Input value={item?.signerName} readOnly />
                  </Form.Item>
                  <Form.Item label="Lokasi">
                    <Input value={item?.location} readOnly />
                  </Form.Item>
                  <Form.Item label="Diterbitkan melalui">
                    <Input.TextArea value={item?.reason} readOnly />
                  </Form.Item>
                  <Form.Item label="Disegel secara elektronik pada">
                    <Input
                      value={dayjs(item?.signatureDate).format(
                        "DD-MM-YYYY HH:mm:ss"
                      )}
                      readOnly
                    />
                  </Form.Item>
                  {/* <Form.Item label="Stempel Waktu">
                    <Input
                      value={dayjs(
                        item?.timestampInfomation?.timestampDate
                      ).format("DD-MM-YYYY HH:mm:ss")}
                      readOnly
                    />
                  </Form.Item> */}
                  <Form.Item>
                    <Space>
                      <Tag color="green">
                        {item?.timestampInfomation?.signerName}
                      </Tag>
                    </Space>
                  </Form.Item>
                </Form>
              </Col>
              <Col md={12} xs={24}>
                <Collapse accordion>
                  {item?.certificateDetails?.map((certificate, idx) => (
                    <Collapse.Panel
                      header={`Sertifikat #${idx + 1}`}
                      key={certificate?.id}
                    >
                      <Form layout="vertical">
                        <Form.Item label="Serial">
                          <Input value={certificate?.serialNumber} readOnly />
                        </Form.Item>
                        <Form.Item label="Common Name">
                          <Input value={certificate?.commonName} readOnly />
                        </Form.Item>
                        <Form.Item label="Validity">
                          <Input
                            value={`${dayjs(certificate?.notBeforeDate).format(
                              "DD-MM-YYYY HH:mm:ss"
                            )} s/d ${dayjs(certificate?.notAfterDate).format(
                              "DD-MM-YYYY HH:mm:ss"
                            )}`}
                            readOnly
                          />
                        </Form.Item>
                        <Form.Item label="Issuer">
                          <Input value={certificate?.issuerName} readOnly />
                        </Form.Item>
                        <Form.Item label="Signature Algorithm">
                          <Input
                            value={certificate?.signatureAlgoritm}
                            readOnly
                          />
                        </Form.Item>
                      </Form>
                    </Collapse.Panel>
                  ))}
                </Collapse>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      ))}
    </>
  );
};

const WebinarCertificateDetail = () => {
  const router = useRouter();

  const [pdfData, setPdfData] = useState(null);

  const { id } = router.query;

  const [showInformation, setShowInformation] = useState(false);

  const toggleInformation = () => {
    setShowInformation((prev) => !prev);
  };

  const { data, isLoading, isFetching } = useQuery(
    ["check-webinar-certificates", id],
    () => checkCertificateWebinar(id),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleDownload = async () => {
    try {
      if (data) {
        const url = `data:application/pdf;base64,${data?.document_sign}`;
        // const blob = new Blob([data], { type: "application/pdf" });
        // const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Sertifikat.pdf";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {}
  };

  const { mutate: check, isLoading: isLoadingCheck } = useMutation(
    (data) => verifyPdfService(data),
    {
      onSuccess: (data) => {
        message.success("Berhasil memverifikasi");
        setPdfData(data);
      },
    }
  );

  const handleCheck = () => {
    const payload = {
      file: data?.document_sign,
    };
    check(payload);
  };

  return (
    <>
      <Head>
        <title>Webinar - Sertifikat</title>
      </Head>
      <PageContainer>
        <Skeleton loading={isLoading || isFetching}>
          {data ? (
            <Stack>
              <Paper p="md" shadow="md">
                <Result
                  status="success"
                  title={`Selamat kepada, ${data?.user_information?.name}`}
                  subTitle={`Anda telah mengikuti webinar dengan judul '${data?.webinar_series?.title}' secara penuh dan berhak mendapatkan sertifikat!`}
                  extra={[
                    <Space key="test">
                      <Button
                        onClick={handleDownload}
                        icon={<DownloadOutlined />}
                        type="primary"
                      >
                        Download Sertifikat
                      </Button>
                      <Button
                        loading={isLoadingCheck}
                        disabled={isLoadingCheck}
                        onClick={handleCheck}
                        icon={<VerifiedOutlined />}
                        type="primary"
                      >
                        Cek Sertifikat
                      </Button>
                    </Space>,
                  ]}
                />
              </Paper>
              <div>
                {pdfData && (
                  <>
                    <Alert
                      color={
                        pdfData?.data?.conclusion === "NO_SIGNATURE"
                          ? "red"
                          : "green"
                      }
                      title={
                        pdfData?.data?.conclusion === "NO_SIGNATURE"
                          ? "Tidak Ditemukan Tanda Tangan Digital"
                          : "Ditemukan Tanda Tangan Digital"
                      }
                      icon={<IconAlertCircle />}
                    >
                      <Space>
                        {pdfData?.data?.conclusion === "NO_SIGNATURE" ? (
                          <span>
                            Tidak ditemukan tanda tangan digital pada file PDF
                            yang diunggah
                          </span>
                        ) : (
                          <span>
                            Ditemukan tanda tangan digital pada file PDF yang
                            diunggah
                          </span>
                        )}
                        <Button onClick={toggleInformation} type="primary">
                          Tampilkan
                        </Button>
                      </Space>
                    </Alert>
                    {showInformation ? (
                      <DetailInformartion data={pdfData} />
                    ) : (
                      <iframe
                        src={
                          data?.document_sign
                            ? `data:application/pdf;base64,${data?.document_sign}`
                            : ""
                        }
                        width="100%"
                        height="800px"
                      ></iframe>
                    )}
                  </>
                )}
              </div>
            </Stack>
          ) : (
            <Empty description="Sertifikat tidak ditemukan">
              <Button>Kembali</Button>
            </Empty>
          )}
        </Skeleton>
      </PageContainer>
    </>
  );
};

export default WebinarCertificateDetail;
