import {
  downloadDokumenFormasiUsulan,
  getUsulan,
  updateFormasiUsulan,
  uploadDokumenFormasiUsulan,
} from "@/services/perencanaan-formasi.services";
import { Alert, Group, Paper, Stack, Text, Divider } from "@mantine/core";
import {
  IconBuilding,
  IconCheck,
  IconClock,
  IconDownload,
  IconEdit,
  IconFileText,
  IconInfoCircle,
  IconSend,
  IconUpload,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Tabs,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

// Remove unused XLSX import since we're using pdf-lib now

const { TextArea } = Input;

// Status Badge Helper
const StatusBadge = ({ status }) => {
  const config = {
    draft: { color: "default", icon: IconEdit, label: "Draft" },
    menunggu: { color: "orange", icon: IconClock, label: "Menunggu Verifikasi" },
    disetujui: { color: "green", icon: IconCheck, label: "Disetujui" },
    ditolak: { color: "red", icon: IconX, label: "Ditolak" },
    perbaikan: { color: "blue", icon: IconEdit, label: "Perlu Perbaikan" },
  };
  const { color, icon: Icon, label } = config[status] || {
    color: "default",
    icon: IconEdit,
    label: status,
  };
  return (
    <Tag color={color} style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Icon size={14} />
      {label}
    </Tag>
  );
};

// Admin Verification Modal
const VerifikasiModal = ({ open, onClose, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: verify, isLoading } = useMutation(
    (values) => updateFormasiUsulan(data.formasi_usulan_id, values),
    {
      onSuccess: () => {
        message.success("Status pengajuan berhasil diperbarui");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan-detail"]);
        onClose();
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || "Gagal verifikasi");
      },
    }
  );

  return (
    <Modal
      title="Verifikasi Pengajuan"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => verify(values)}
        initialValues={{ status: data.status, catatan: data.catatan }}
      >
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Pilih status" }]}
        >
          <Select>
            <Select.Option value="menunggu">Menunggu</Select.Option>
            <Select.Option value="disetujui">Disetujui</Select.Option>
            <Select.Option value="ditolak">Ditolak</Select.Option>
            <Select.Option value="perbaikan">Perlu Perbaikan</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="catatan" label="Catatan Verifikator">
          <TextArea rows={4} placeholder="Tulis catatan untuk user..." />
        </Form.Item>
        <Group justify="flex-end">
           <Button onClick={onClose}>Batal</Button>
           <Button type="primary" htmlType="submit" loading={isLoading}>Simpan</Button>
        </Group>
      </Form>
    </Modal>
  );
};

// Document Upload Modal
const UploadModal = ({ open, onClose, data }) => {
    const [file, setFile] = useState(null);
    const queryClient = useQueryClient();

    const { mutate: upload, isLoading } = useMutation(
        () => {
             const formData = new FormData();
             formData.append('file', file);
             return uploadDokumenFormasiUsulan(data.formasi_usulan_id, formData);
        },
        {
            onSuccess: () => {
                message.success("Dokumen berhasil diunggah");
                queryClient.invalidateQueries(["perencanaan-formasi-usulan-detail"]);
                onClose();
                setFile(null);
            },
            onError: (err) => {
                message.error(err?.response?.data?.message || "Gagal upload");
            }
        }
    );

    return (
        <Modal 
            title="Upload Dokumen Pendukung"
            open={open}
            onCancel={onClose}
            confirmLoading={isLoading}
            onOk={() => {
                if(!file) return message.warning("Pilih file dulu");
                upload();
            }}
        >
             <Alert variant="light" color="blue" title="Informasi" icon={<IconInfoCircle size={16}/>} mb="md">
                Unggah Surat Pengantar / SPTJM sebagai bukti pengajuan resmi.
             </Alert>
             <Upload.Dragger
                maxCount={1}
                beforeUpload={(f) => {
                    setFile(f);
                    return false;
                }}
                onRemove={() => setFile(null)}
             >
                 <p className="ant-upload-drag-icon">
                    <IconUpload size={32} color="#868e96" />
                 </p>
                 <p className="ant-upload-text">Klik atau drag file ke sini</p>
                 <p className="ant-upload-hint">PDF, Max 5MB</p>
             </Upload.Dragger>
        </Modal>
    )
}

function FormasiUsulanDetail({ data, activeTab = "usulan", children }) {
  const router = useRouter();
  const { id, fuId } = router.query;
  const { data: session } = useSession();
  const isAdmin = session?.user?.current_role === "admin";
  const isOwner = session?.user?.customId === data.user_id;
  const queryClient = useQueryClient();

  const [verifyModal, setVerifyModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Perangkat daerah info
  const perangkatDaerah = data.pembuat?.perangkat_daerah_detail || "-";
  const namaOperator = data.pembuat?.username || "-";

  // Download dokumen pendukung
  const handleDownloadDokumen = async () => {
    try {
      message.loading({ content: "Mengunduh...", key: "dl" });
      const res = await downloadDokumenFormasiUsulan(data.formasi_usulan_id);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = data.dokumen_name || "dokumen.pdf";
      link.click();
      message.success({ content: "Selesai", key: "dl" });
    } catch (e) {
      message.error({ content: "Gagal download", key: "dl" });
    }
  };

  // Download PDF daftar usulan menggunakan pdf-lib
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      message.loading({ content: "Membuat PDF...", key: "pdf" });

      // Fetch all usulan for this submission
      const usulanData = await getUsulan({
        formasi_usulan_id: data.formasi_usulan_id,
        limit: -1,
      });

      const usulanList = usulanData?.data || [];

      if (usulanList.length === 0) {
        message.warning({ content: "Tidak ada data usulan", key: "pdf" });
        return;
      }

      // Calculate total
      const totalAlokasi = usulanList.reduce(
        (acc, item) => acc + (item.alokasi || 0),
        0
      );

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage([595, 842]); // A4 size
      const { width, height } = page.getSize();
      const margin = 40;
      let yPosition = height - margin;

      // Helper function to add new page if needed
      const checkNewPage = () => {
        if (yPosition < 80) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = height - margin;
        }
      };

      // Title
      page.drawText("DAFTAR USULAN FORMASI", {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      // Subtitle (formasi name)
      page.drawText(data.formasi?.deskripsi || "Formasi", {
        x: margin,
        y: yPosition,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.4, 0.6),
      });
      yPosition -= 25;

      // Info section
      const infoLines = [
        `Perangkat Daerah : ${perangkatDaerah}`,
        `Operator         : ${namaOperator}`,
        `Tanggal Cetak    : ${dayjs().format("DD MMMM YYYY HH:mm")}`,
        `Jumlah Usulan    : ${usulanList.length} jabatan`,
        `Total Alokasi    : ${totalAlokasi} formasi`,
      ];

      for (const line of infoLines) {
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: 9,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPosition -= 14;
      }
      yPosition -= 10;

      // Table header
      const colWidths = [30, 150, 60, 150, 90, 40];
      const headers = ["No", "Nama Jabatan", "Jenis", "Unit Kerja", "Pendidikan", "Alokasi"];
      let xPos = margin;

      // Draw header background
      page.drawRectangle({
        x: margin,
        y: yPosition - 12,
        width: width - margin * 2,
        height: 18,
        color: rgb(0.2, 0.4, 0.6),
      });

      // Draw header text
      for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
          x: xPos + 2,
          y: yPosition - 8,
          size: 8,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        xPos += colWidths[i];
      }
      yPosition -= 20;

      // Draw table rows
      for (let rowIndex = 0; rowIndex < usulanList.length; rowIndex++) {
        checkNewPage();
        const item = usulanList[rowIndex];
        xPos = margin;

        // Alternate row background
        if (rowIndex % 2 === 0) {
          page.drawRectangle({
            x: margin,
            y: yPosition - 10,
            width: width - margin * 2,
            height: 16,
            color: rgb(0.95, 0.95, 0.95),
          });
        }

        // Truncate helper
        const truncate = (text, maxLen) => {
          if (!text) return "-";
          return text.length > maxLen ? text.substring(0, maxLen - 2) + ".." : text;
        };

        const rowData = [
          String(rowIndex + 1),
          truncate(item.nama_jabatan || item.jabatan_id, 30),
          truncate(item.jenis_jabatan, 12),
          truncate(item.unit_kerja_text || item.unit_kerja, 30),
          truncate(
            item.kualifikasi_pendidikan_detail
              ?.map((p) => p.tk_pend)
              .join(", "),
            18
          ),
          String(item.alokasi || 0),
        ];

        for (let i = 0; i < rowData.length; i++) {
          page.drawText(rowData[i], {
            x: xPos + 2,
            y: yPosition - 6,
            size: 7,
            font: font,
            color: rgb(0.1, 0.1, 0.1),
          });
          xPos += colWidths[i];
        }
        yPosition -= 16;
      }

      // Total row
      checkNewPage();
      yPosition -= 5;
      page.drawRectangle({
        x: margin,
        y: yPosition - 10,
        width: width - margin * 2,
        height: 18,
        color: rgb(0.85, 0.9, 0.95),
      });

      page.drawText("TOTAL ALOKASI", {
        x: margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2,
        y: yPosition - 6,
        size: 8,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(String(totalAlokasi), {
        x: margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 2,
        y: yPosition - 6,
        size: 8,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      saveAs(
        blob,
        `Usulan_${data.formasi?.deskripsi || "Formasi"}_${perangkatDaerah}_${dayjs().format("YYYYMMDD")}.pdf`
      );
      message.success({ content: "PDF berhasil dibuat", key: "pdf" });
    } catch (error) {
      console.error(error);
      message.error({ content: "Gagal membuat PDF", key: "pdf" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Submit (Confirm) Mutation for User
  const { mutate: confirmSubmission, isLoading: isConfirming } = useMutation(
    () => updateFormasiUsulan(data.formasi_usulan_id, { is_confirmed: true }),
    {
      onSuccess: () => {
        message.success("Pengajuan berhasil dikirim!");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan-detail"]);
      },
      onError: () => message.error("Gagal mengirim pengajuan"),
    }
  );

  // Cancel/Un-confirm Mutation for User
  const { mutate: cancelSubmission, isLoading: isCancelling } = useMutation(
    () =>
      updateFormasiUsulan(data.formasi_usulan_id, {
        is_confirmed: false,
        status: "draft",
      }),
    {
      onSuccess: () => {
        message.success("Pengajuan ditarik kembali ke draft");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan-detail"]);
      },
      onError: () => message.error("Gagal menarik pengajuan"),
    }
  );

  const handleTabChange = (key) => {
    router.push(`/perencanaan/formasi/${id}/${fuId}/${key}`);
  };

  // Determine if editable
  const isEditable =
    isAdmin || data.status === "draft" || data.status === "perbaikan";

  return (
    <Stack gap="md">
      {/* Header Info Card */}
      <Paper p="md" radius="sm" withBorder>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          {/* Left: Info */}
          <Stack gap="xs">
            <Text size="lg" fw={600}>
              {data.formasi?.deskripsi || "Pengajuan Usulan Formasi"}
            </Text>

            <Group gap="lg" wrap="wrap">
              <Group gap={6}>
                <IconUser size={14} color="#868e96" />
                <Text size="sm" c="dimmed">
                  Operator:
                </Text>
                <Text size="sm" fw={500}>
                  {namaOperator}
                </Text>
              </Group>
              <Group gap={6}>
                <IconBuilding size={14} color="#868e96" />
                <Text size="sm" c="dimmed">
                  Perangkat Daerah:
                </Text>
                <Text size="sm" fw={500}>
                  {perangkatDaerah}
                </Text>
              </Group>
            </Group>

            <Group gap="lg" wrap="wrap">
              <Group gap={6}>
                <Text size="xs" c="dimmed">
                  Dibuat:
                </Text>
                <Text size="xs">
                  {dayjs(data.dibuat_pada).format("DD MMM YYYY HH:mm")}
                </Text>
              </Group>
              <Group gap={6}>
                <Text size="xs" c="dimmed">
                  Jumlah Usulan:
                </Text>
                <Tag color="blue">{data.jumlah_usulan || 0} jabatan</Tag>
              </Group>
              <Group gap={6}>
                <Text size="xs" c="dimmed">
                  Total Alokasi:
                </Text>
                <Tag color="green">{data.total_alokasi || 0} formasi</Tag>
              </Group>
            </Group>
          </Stack>

          {/* Right: Status & Actions */}
          <Stack align="flex-end" gap="xs">
            <StatusBadge status={data.status} />

            <Group gap="xs">
              {/* Download PDF Button */}
              <Tooltip title="Unduh daftar usulan dalam format PDF">
                <Button
                  icon={<IconDownload size={14} />}
                  size="small"
                  onClick={handleDownloadPdf}
                  loading={downloadingPdf}
                >
                  Unduh PDF
                </Button>
              </Tooltip>

              {/* Admin: Verify */}
              {isAdmin && data.status !== "draft" && (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => setVerifyModal(true)}
                >
                  Verifikasi
                </Button>
              )}

              {/* Owner: Submit */}
              {isOwner && data.status === "draft" && (
                <Popconfirm
                  title="Kirim Pengajuan?"
                  description="Pastikan semua usulan dan dokumen sudah benar. Data tidak dapat diubah setelah dikirim."
                  onConfirm={confirmSubmission}
                >
                  <Tooltip
                    title={
                      !data.dokumen_url
                        ? "Upload dokumen pendukung terlebih dahulu"
                        : "Kirim pengajuan untuk diverifikasi"
                    }
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon={<IconSend size={14} />}
                      loading={isConfirming}
                      disabled={!data.dokumen_url || (data.jumlah_usulan || 0) === 0}
                    >
                      Kirim Pengajuan
                    </Button>
                  </Tooltip>
                </Popconfirm>
              )}

              {/* Owner: Cancel submission */}
              {isOwner && data.status === "menunggu" && (
                <Popconfirm
                  title="Tarik kembali pengajuan?"
                  description="Status akan kembali menjadi Draft dan Anda dapat mengedit kembali."
                  onConfirm={cancelSubmission}
                >
                  <Button danger size="small" loading={isCancelling}>
                    Tarik Kembali
                  </Button>
                </Popconfirm>
              )}
            </Group>
          </Stack>
        </Group>

        <Divider my="sm" />

        {/* Dokumen Section */}
        <Group gap="md" wrap="wrap">
          <Text size="sm" fw={500}>
            Dokumen Pendukung:
          </Text>
          {data.dokumen_url ? (
            <Button
              icon={<IconFileText size={14} />}
              size="small"
              onClick={handleDownloadDokumen}
            >
              {data.dokumen_name || "Unduh Dokumen"}
            </Button>
          ) : (
            <Text size="sm" c="red" fs="italic">
              Belum ada dokumen
            </Text>
          )}
          {isOwner && isEditable && (
            <Button
              size="small"
              type="dashed"
              icon={<IconUpload size={14} />}
              onClick={() => setUploadModal(true)}
            >
              {data.dokumen_url ? "Ganti Dokumen" : "Upload Dokumen"}
            </Button>
          )}
        </Group>

        {/* Catatan Area */}
        {data.catatan && (
          <Alert
            variant="light"
            color={
              data.status === "ditolak" || data.status === "perbaikan"
                ? "red"
                : "blue"
            }
            title="Catatan Verifikator"
            icon={<IconInfoCircle size={16} />}
            mt="md"
          >
            {data.catatan}
            {data.korektor && (
              <Text size="xs" mt={4} c="dimmed">
                - {data.korektor.username} (
                {dayjs(data.corrected_at).format("DD/MM/YYYY HH:mm")})
              </Text>
            )}
          </Alert>
        )}

        {/* Warning if not editable */}
        {!isEditable && isOwner && (
          <Alert
            variant="light"
            color="orange"
            title="Pengajuan Terkunci"
            icon={<IconInfoCircle size={16} />}
            mt="md"
          >
            Pengajuan sedang dalam proses verifikasi. Anda tidak dapat mengubah
            data sampai admin memberikan keputusan.
          </Alert>
        )}
      </Paper>

      {/* Tabs Navigation */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        items={[
          { key: "usulan", label: "Daftar Usulan Jabatan" },
          { key: "lampiran", label: "Lampiran Usulan" },
        ]}
      />

      {/* Page Content */}
      {children}

      {/* Modals */}
      <VerifikasiModal
        open={verifyModal}
        onClose={() => setVerifyModal(false)}
        data={data}
      />
      <UploadModal
        open={uploadModal}
        onClose={() => setUploadModal(false)}
        data={data}
      />
    </Stack>
  );
}

export default FormasiUsulanDetail;