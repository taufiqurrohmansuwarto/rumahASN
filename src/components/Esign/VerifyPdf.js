import { verifyPdfService } from "@/services/public.services";
import { FilePdfOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Col,
  Collapse,
  Form,
  Input,
  Row,
  Space,
  Tabs,
  Tag,
  Upload,
  message,
} from "antd";
import moment from "moment";
import { useState } from "react";
import PageContainer from "../PageContainer";
import Link from "next/link";

const DetailInformation = ({ data }) => {
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
                  <Form.Item label="Di Tandatangani oleh:">
                    <Input value={item?.signerName} readOnly />
                  </Form.Item>
                  <Form.Item label="Lokasi">
                    <Input value={item?.location} readOnly />
                  </Form.Item>
                  <Form.Item label="Alasan">
                    <Input.TextArea value={item?.reason} readOnly />
                  </Form.Item>
                  <Form.Item label="Ditandatangani pada">
                    <Input
                      value={moment(item?.signatureDate).format(
                        "DD-MM-YYYY HH:mm:ss"
                      )}
                      readOnly
                    />
                  </Form.Item>
                  <Form.Item label="Stempel Waktu">
                    <Input
                      value={moment(
                        item?.timestampInfomation?.timestampDate
                      ).format("DD-MM-YYYY HH:mm:ss")}
                      readOnly
                    />
                  </Form.Item>
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
                            value={`${moment(certificate?.notBeforeDate).format(
                              "DD-MM-YYYY HH:mm:ss"
                            )} s/d ${moment(certificate?.notAfterDate).format(
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

const pdfToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

function VerifyPdf() {
  const accept = ".pdf";
  const [fileList, setFileList] = useState([]);
  const [pdfData, setPdfData] = useState(null);

  const [showInformation, setShowInformation] = useState(false);

  const toggleInformation = () => {
    setShowInformation((prev) => !prev);
  };

  const { mutateAsync, isLoading } = useMutation(
    (data) => verifyPdfService(data),
    {
      onSuccess: (data) => {
        message.success("Berhasil memverifikasi");
        setPdfData(data);
      },
    }
  );

  const handleBeforeUpload = async (file) => {
    try {
      const base64 = await pdfToBase64(file);

      // check is pdf
      const isPdfFile = base64.includes("data:application/pdf;base64,");

      if (!isPdfFile) {
        message.error("File yang diupload bukan file pdf");
      } else {
        // remove data:application/pdf;base64,
        const currentFile = base64.split(",")[1];
        const payload = {
          file: currentFile,
        };
        await mutateAsync(payload);
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: base64,
          },
        ]);
      }

      return false;
    } catch (error) {
      message.error("Terjadi kesalahan");
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setPdfData(null);
  };

  return (
    <PageContainer
      header={{
        breadcrumbRender: () => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/">
                <a>Halaman Utama</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Verifikasi PDF</Breadcrumb.Item>
          </Breadcrumb>
        ),
      }}
      title="Verifikasi PDF"
      subTitle="Verifikasi TTE PDF"
    >
      <Stack>
        <Alert title="Pilih File PDF" color="yellow" icon={<IconAlertCircle />}>
          Unggah file PDF yang ingin diverifikasi, kemudian tungggu hingga
          proses verifikasi selesai.
        </Alert>
        <Upload
          fileList={fileList}
          onRemove={handleRemove}
          showUploadList={{
            showPreviewIcon: false,
            showDownloadIcon: false,
          }}
          multiple={false}
          beforeUpload={handleBeforeUpload}
          accept={accept}
        >
          <Button
            disabled={isLoading}
            loading={isLoading}
            icon={<FilePdfOutlined />}
            type="primary"
          >
            Verifikasi PDF
          </Button>
        </Upload>
        <>
          {pdfData && (
            <>
              <Alert
                color={
                  pdfData?.data?.conclusion === "NO_SIGNATURE" ? "red" : "green"
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
                      Tidak ditemukan tanda tangan digital pada file PDF yang
                      diunggah
                    </span>
                  ) : (
                    <span>
                      Ditemukan tanda tangan digital pada file PDF yang diunggah
                    </span>
                  )}
                  <Button onClick={toggleInformation} type="primary">
                    Tampilkan
                  </Button>
                </Space>
              </Alert>
              {showInformation ? (
                <DetailInformation data={pdfData} />
              ) : (
                <iframe
                  src={fileList[0].url}
                  width="100%"
                  height="800px"
                ></iframe>
              )}
            </>
          )}
        </>
      </Stack>
    </PageContainer>
  );
}

export default VerifyPdf;
