import {
  getUsulan,
  updateFormasiUsulan,
  uploadDokumenFormasiUsulan,
} from "@/services/perencanaan-formasi.services";
import { ActionIcon, Alert, Collapse, Group, Paper, Stack, Text, Divider } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
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
    menunggu: {
      color: "orange",
      icon: IconClock,
      label: "Menunggu Verifikasi",
    },
    disetujui: { color: "green", icon: IconCheck, label: "Disetujui" },
    ditolak: { color: "red", icon: IconX, label: "Ditolak" },
    perbaikan: { color: "blue", icon: IconEdit, label: "Perlu Perbaikan" },
  };
  const {
    color,
    icon: Icon,
    label,
  } = config[status] || {
    color: "default",
    icon: IconEdit,
    label: status,
  };
  return (
    <Tag
      color={color}
      style={{ display: "flex", alignItems: "center", gap: 4 }}
    >
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
        queryClient.invalidateQueries(["perencanaan-formasi-usulan"]);
        queryClient.invalidateQueries(["perencanaan-usulan"]);
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
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Simpan
          </Button>
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
      formData.append("file", file);
      return uploadDokumenFormasiUsulan(data.formasi_usulan_id, formData);
    },
    {
      onSuccess: () => {
        message.success("Dokumen berhasil diunggah");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan-detail"]);
        queryClient.invalidateQueries(["perencanaan-formasi-usulan"]);
        onClose();
        setFile(null);
      },
      onError: (err) => {
        message.error(err?.response?.data?.message || "Gagal upload");
      },
    }
  );

  return (
    <Modal
      title="Upload Dokumen Pendukung"
      open={open}
      onCancel={onClose}
      confirmLoading={isLoading}
      onOk={() => {
        if (!file) return message.warning("Pilih file dulu");
        upload();
      }}
    >
      <Alert
        variant="light"
        color="blue"
        title="Informasi"
        icon={<IconInfoCircle size={16} />}
        mb="md"
      >
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
  );
};

// Kirim Usulan Modal with File Upload
const KirimUsulanModal = ({ open, onClose, data, onSuccess }) => {
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const { mutate: submit, isLoading } = useMutation(
    async () => {
      // Upload file first if provided
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadDokumenFormasiUsulan(data.formasi_usulan_id, formData);
      }
      // Then confirm submission
      return updateFormasiUsulan(data.formasi_usulan_id, {
        is_confirmed: true,
      });
    },
    {
      onSuccess: () => {
        message.success("Pengajuan berhasil dikirim!");
        queryClient.invalidateQueries(["perencanaan-formasi-usulan-detail"]);
        queryClient.invalidateQueries(["perencanaan-formasi-usulan"]);
        queryClient.invalidateQueries(["perencanaan-usulan"]);
        onClose();
        setFile(null);
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        message.error(
          err?.response?.data?.message || "Gagal mengirim pengajuan"
        );
      },
    }
  );

  const handleSubmit = () => {
    // Require file if no existing document
    if (!data.dokumen_url && !file) {
      return message.warning("Harap unggah dokumen pendukung terlebih dahulu");
    }
    submit();
  };

  return (
    <Modal
      title={
        <Group gap="xs">
          <IconSend size={18} />
          <span>Kirim Pengajuan Usulan</span>
        </Group>
      }
      open={open}
      onCancel={onClose}
      width={500}
      footer={
        <Group justify="flex-end">
          <Button onClick={onClose}>Batal</Button>
          <Button type="primary" loading={isLoading} onClick={handleSubmit}>
            Kirim Pengajuan
          </Button>
        </Group>
      }
    >
      <Stack gap="md">
        <Alert
          variant="light"
          color="blue"
          title="Konfirmasi Pengiriman"
          icon={<IconInfoCircle size={16} />}
        >
          Pastikan semua data usulan jabatan sudah benar. Setelah dikirim, data
          tidak dapat diubah sampai admin memberikan keputusan.
        </Alert>

        <Paper p="sm" radius="sm" withBorder bg="gray.0">
          <Stack gap={4}>
            <Group gap="xs">
              <Text size="xs" c="dimmed" w={120}>
                Nama Formasi:
              </Text>
              <Text size="sm" fw={500}>
                {data.formasi?.deskripsi || "-"}
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed" w={120}>
                Jumlah Usulan:
              </Text>
              <Text size="sm" fw={500}>
                {data.jumlah_usulan || 0} jabatan
              </Text>
            </Group>
            <Group gap="xs">
              <Text size="xs" c="dimmed" w={120}>
                Total Alokasi:
              </Text>
              <Text size="sm" fw={500}>
                {data.total_alokasi_semua || 0} formasi
              </Text>
            </Group>
          </Stack>
        </Paper>

        <Divider />

        <Text size="sm" fw={500}>
          Unggah Dokumen Pendukung{" "}
          {data.dokumen_url ? "(Opsional - Ganti)" : "(Wajib)"}
        </Text>
        <Text size="xs" c="dimmed">
          Unggah Surat Pengantar / SPTJM sebagai bukti pengajuan resmi.
        </Text>

        {data.dokumen_url && (
          <Alert
            variant="light"
            color="green"
            title="Dokumen sudah ada"
            icon={<IconFileText size={16} />}
          >
            {data.dokumen_name || "dokumen.pdf"}
          </Alert>
        )}

        <Upload.Dragger
          maxCount={1}
          accept=".pdf"
          beforeUpload={(f) => {
            setFile(f);
            return false;
          }}
          onRemove={() => setFile(null)}
        >
          <p className="ant-upload-drag-icon">
            <IconUpload size={32} color="#868e96" />
          </p>
          <p className="ant-upload-text">Klik atau drag file PDF ke sini</p>
          <p className="ant-upload-hint">Format: PDF, Max 5MB</p>
        </Upload.Dragger>
      </Stack>
    </Modal>
  );
};

function FormasiUsulanDetail({ data, activeTab = "usulan", children }) {
  const router = useRouter();
  const { id, fuId } = router.query;
  const { data: session } = useSession();
  const isAdmin = session?.user?.current_role === "admin";
  const isOwner = session?.user?.id === data.user_id; // Fixed: use id instead of customId

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 992px)");

  const [verifyModal, setVerifyModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [kirimModal, setKirimModal] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Status check
  const isDraft = data.status === "draft";
  const isConfirmed = data.is_confirmed;
  const canDownloadPdf = isDraft && !isConfirmed;

  // Perangkat daerah info - prioritize unor.name
  const perangkatDaerah =
    data.pembuat?.unor?.name || data.pembuat?.perangkat_daerah_detail || "-";
  const namaOperator = data.pembuat?.username || "-";

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
      const totalAlokasiSemua = usulanList.reduce(
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

      // Helper function to draw watermark on a page
      const drawWatermark = (targetPage) => {
        const watermarkText = "Rumah ASN";
        const watermarkFontSize = 24;
        const watermarkColor = rgb(0.9, 0.9, 0.9); // Light gray

        // Draw repeating watermark pattern
        const spacingX = 180;
        const spacingY = 100;
        const offsetRows = 2; // Offset for staggered pattern

        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 5; col++) {
            const xOffset = row % offsetRows === 0 ? 0 : spacingX / 2;
            const x = col * spacingX + xOffset - 50;
            const y = height - row * spacingY - 50;

            // Draw rotated text (simulated with positioning)
            targetPage.drawText(watermarkText, {
              x: x,
              y: y,
              size: watermarkFontSize,
              font: font,
              color: watermarkColor,
              rotate: { type: "degrees", angle: -30 },
            });
          }
        }
      };

      // Draw watermark on first page
      drawWatermark(page);

      // Helper function to add new page if needed
      const checkNewPage = (minSpace = 80) => {
        if (yPosition < minSpace) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = height - margin;
          // Draw watermark on new page
          drawWatermark(page);
        }
      };

      // Helper to draw centered text
      const drawCenteredText = (
        text,
        y,
        fontSize,
        fontType,
        color = rgb(0, 0, 0)
      ) => {
        const textWidth = fontType.widthOfTextAtSize(text, fontSize);
        const x = (width - textWidth) / 2;
        page.drawText(text, { x, y, size: fontSize, font: fontType, color });
      };

      // Helper to wrap text into lines
      const wrapText = (text, maxWidth, fontSize, fontType) => {
        if (!text) return ["-"];
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = fontType.widthOfTextAtSize(testLine, fontSize);
          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines.length ? lines : ["-"];
      };

      // === KOP / HEADER (Centered) ===
      const namaFormasi = data.formasi?.deskripsi || "Formasi";
      const opdName =
        perangkatDaerah !== "-" ? perangkatDaerah : "PERANGKAT DAERAH";
      const tanggalUsulan = dayjs(data.dibuat_pada).format("DD MMMM YYYY");
      const tanggalCetak = dayjs().format("DD MMMM YYYY HH:mm:ss");

      // Title Line 1: USULAN KEBUTUHAN [NAMA FORMASI]
      drawCenteredText(
        `USULAN KEBUTUHAN ${namaFormasi.toUpperCase()}`,
        yPosition,
        14,
        boldFont
      );
      yPosition -= 18;

      // Title Line 2: DI LINGKUNGAN [OPD]
      drawCenteredText(
        `DI LINGKUNGAN ${opdName.toUpperCase()}`,
        yPosition,
        12,
        boldFont
      );
      yPosition -= 18;

      // Title Line 3: [TANGGAL PENGUSULAN]
      drawCenteredText(
        `Tanggal Usulan: ${tanggalUsulan}`,
        yPosition,
        10,
        font,
        rgb(0.3, 0.3, 0.3)
      );
      yPosition -= 14;

      // Title Line 4: [TANGGAL CETAK]
      drawCenteredText(
        `Dicetak: ${tanggalCetak}`,
        yPosition,
        9,
        font,
        rgb(0.5, 0.5, 0.5)
      );
      yPosition -= 20;

      // Divider line
      page.drawLine({
        start: { x: margin, y: yPosition },
        end: { x: width - margin, y: yPosition },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      yPosition -= 20;

      // === TABLE ===
      const colWidths = [25, 140, 55, 140, 100, 40];
      const headers = [
        "No",
        "Nama Jabatan",
        "Jenis",
        "Unit Kerja",
        "Pendidikan",
        "Alokasi",
      ];
      let xPos = margin;

      // Draw header background
      const headerHeight = 20;
      page.drawRectangle({
        x: margin,
        y: yPosition - headerHeight + 3,
        width: width - margin * 2,
        height: headerHeight,
        color: rgb(0.2, 0.4, 0.6),
      });

      // Draw header text (vertically centered)
      const headerFontSize = 8;
      const headerTextY =
        yPosition - headerHeight + 3 + (headerHeight - headerFontSize) / 2;
      for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
          x: xPos + 3,
          y: headerTextY,
          size: headerFontSize,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        xPos += colWidths[i];
      }
      yPosition -= headerHeight + 4;

      // Draw table rows with text wrapping
      for (let rowIndex = 0; rowIndex < usulanList.length; rowIndex++) {
        const item = usulanList[rowIndex];

        // Prepare wrapped text for each column
        const cellData = [
          [String(rowIndex + 1)],
          wrapText(
            item.nama_jabatan || item.jabatan_id || "-",
            colWidths[1] - 6,
            7,
            font
          ),
          [item.jenis_jabatan || "-"],
          wrapText(
            item.unit_kerja_text || item.unit_kerja || "-",
            colWidths[3] - 6,
            7,
            font
          ),
          wrapText(
            item.kualifikasi_pendidikan_detail
              ?.map((p) => `${p.tk_pend} ${p.label}`)
              .join(", ") || "-",
            colWidths[4] - 6,
            7,
            font
          ),
          [String(item.alokasi || 0)],
        ];

        // Calculate row height based on max lines
        const maxLines = Math.max(...cellData.map((c) => c.length));
        const rowHeight = Math.max(16, maxLines * 10 + 6);

        // Check if we need a new page
        checkNewPage(rowHeight + 20);

        // Alternate row background
        if (rowIndex % 2 === 0) {
          page.drawRectangle({
            x: margin,
            y: yPosition - rowHeight + 4,
            width: width - margin * 2,
            height: rowHeight,
            color: rgb(0.96, 0.96, 0.96),
          });
        }

        // Draw cell contents
        xPos = margin;
        for (let colIndex = 0; colIndex < cellData.length; colIndex++) {
          const lines = cellData[colIndex];
          let lineY = yPosition - 8;
          for (const line of lines) {
            page.drawText(line, {
              x: xPos + 3,
              y: lineY,
              size: 7,
              font: font,
              color: rgb(0.1, 0.1, 0.1),
            });
            lineY -= 10;
          }
          xPos += colWidths[colIndex];
        }
        yPosition -= rowHeight;
      }

      // Total row
      checkNewPage(30);
      yPosition -= 5;
      const totalRowHeight = 20;
      page.drawRectangle({
        x: margin,
        y: yPosition - totalRowHeight + 3,
        width: width - margin * 2,
        height: totalRowHeight,
        color: rgb(0.85, 0.9, 0.95),
      });

      // Vertically centered text position
      const totalFontSize = 8;
      const totalTextY =
        yPosition - totalRowHeight + 3 + (totalRowHeight - totalFontSize) / 2;

      page.drawText("TOTAL ALOKASI", {
        x:
          margin +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          3,
        y: totalTextY,
        size: totalFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(String(totalAlokasiSemua), {
        x:
          margin +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          colWidths[4] +
          3,
        y: totalTextY,
        size: totalFontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      saveAs(
        blob,
        `Usulan_${namaFormasi}_${opdName}_${dayjs().format("YYYYMMDD")}.pdf`
      );
      message.success({ content: "PDF berhasil dibuat", key: "pdf" });
    } catch (error) {
      console.error(error);
      message.error({ content: "Gagal membuat PDF", key: "pdf" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Note: Submit functionality moved to KirimUsulanModal component

  const handleTabChange = (key) => {
    router.push(`/perencanaan/formasi/${id}/${fuId}/${key}`);
  };

  // Determine if editable
  const isEditable =
    isAdmin || data.status === "draft" || data.status === "perbaikan";

  return (
    <Stack gap={4}>
      {/* Header Info Card - Structured Layout */}
      <Paper p="sm" radius="sm" withBorder>
        <Stack gap="xs">
          {/* Title Row with Status and Action Buttons */}
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
            <Text size="md" fw={600}>
              {data.formasi?.deskripsi || "Pengajuan Usulan Formasi"}
            </Text>
            {/* Status Badge + Action Buttons - Top Right */}
            <Group gap="xs" wrap="nowrap">
              <StatusBadge status={data.status} />
              {canDownloadPdf && (
                <Tooltip title="Unduh daftar usulan dalam format PDF">
                  <Button
                    icon={<IconDownload size={14} />}
                    size="small"
                    onClick={handleDownloadPdf}
                    loading={downloadingPdf}
                  >
                    {isMobile ? null : "Unduh PDF"}
                  </Button>
                </Tooltip>
              )}
              {isAdmin && !isDraft && (
                <Button
                  type="primary"
                  size="small"
                  icon={<IconCheck size={14} />}
                  onClick={() => setVerifyModal(true)}
                >
                  {isMobile ? "Verif" : "Verifikasi"}
                </Button>
              )}
              {isOwner && isDraft && !isConfirmed && (
                <Tooltip
                  title={
                    (data.jumlah_usulan || 0) === 0
                      ? "Tambahkan usulan jabatan terlebih dahulu"
                      : "Kirim pengajuan untuk diverifikasi"
                  }
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<IconSend size={14} />}
                    disabled={(data.jumlah_usulan || 0) === 0}
                    onClick={() => setKirimModal(true)}
                  >
                    {isMobile ? "Kirim" : "Kirim Pengajuan"}
                  </Button>
                </Tooltip>
              )}
            </Group>
          </Group>

          {/* Structured Info Rows */}
          <Stack gap={2}>
            {/* Row 1: Operator & Tanggal */}
            <Group gap={4} wrap="nowrap">
              <Group gap={4} w={100} style={{ flexShrink: 0 }}>
                <IconUser size={12} color="#1677ff" />
                <Text size="xs" c="dimmed">Operator</Text>
              </Group>
              <Text size="xs" c="dimmed">:</Text>
              <Text size="xs" fw={500}>{namaOperator}</Text>
              <Text size="xs" c="dimmed" ml="md">({dayjs(data.dibuat_pada).format("DD MMM YYYY HH:mm")})</Text>
            </Group>

            {/* Row 2: Jumlah Usulan */}
            <Group gap={4} wrap="nowrap">
              <Group gap={4} w={100} style={{ flexShrink: 0 }}>
                <IconFileText size={12} color="#1677ff" />
                <Text size="xs" c="dimmed">Usulan</Text>
              </Group>
              <Text size="xs" c="dimmed">:</Text>
              <Tag color="blue" style={{ margin: 0 }}>{data.jumlah_usulan || 0} jabatan</Tag>
              <Tag color="cyan" style={{ margin: 0 }}>{data.total_alokasi_semua || 0} alokasi</Tag>
            </Group>

            {/* Row 3: Dokumen */}
            <Group gap={4} wrap="nowrap" align="center">
              <Group gap={4} w={100} style={{ flexShrink: 0 }}>
                <IconUpload size={12} color="#1677ff" />
                <Text size="xs" c="dimmed">Dokumen</Text>
              </Group>
              <Text size="xs" c="dimmed">:</Text>
              {data.dokumen_url ? (
                <Button
                  icon={<IconFileText size={12} />}
                  size="small"
                  type="link"
                  href={data.dokumen_url}
                  target="_blank"
                  style={{ padding: 0, height: "auto" }}
                >
                  {data.dokumen_name || "Lihat Dokumen"}
                </Button>
              ) : (
                <Text size="xs" c="orange" fs="italic">Belum ada dokumen</Text>
              )}
              {isOwner && isEditable && (
                <Button
                  size="small"
                  type="link"
                  icon={<IconUpload size={12} />}
                  onClick={() => setUploadModal(true)}
                  style={{ padding: 0, height: "auto", marginLeft: 8 }}
                >
                  {data.dokumen_url ? "Ganti" : "Upload"}
                </Button>
              )}
            </Group>
          </Stack>

          {/* Catatan Verifikator - Inline Compact */}
          {data.catatan && (
            <Group gap={4} wrap="wrap" style={{
              backgroundColor: data.status === "ditolak" || data.status === "perbaikan" ? "#fff2f0" : "#e6f4ff",
              padding: "6px 10px",
              borderRadius: 4,
              borderLeft: `3px solid ${data.status === "ditolak" || data.status === "perbaikan" ? "#ff4d4f" : "#1677ff"}`,
              marginTop: 4
            }}>
              <IconInfoCircle size={14} color={data.status === "ditolak" || data.status === "perbaikan" ? "#ff4d4f" : "#1677ff"} />
              <Text size="xs" fw={500} c={data.status === "ditolak" || data.status === "perbaikan" ? "red" : "blue"}>
                Catatan:
              </Text>
              <Text size="xs">{data.catatan}</Text>
              {data.korektor && (
                <Text size="xs" c="dimmed">
                  ({data.korektor.username}, {dayjs(data.corrected_at).format("DD/MM/YYYY HH:mm")})
                </Text>
              )}
            </Group>
          )}

          {/* Warning if not editable - Inline Compact */}
          {!isEditable && isOwner && !data.catatan && (
            <Group gap={4} wrap="wrap" style={{
              backgroundColor: "#fffbe6",
              padding: "6px 10px",
              borderRadius: 4,
              borderLeft: "3px solid #faad14",
              marginTop: 4
            }}>
              <IconInfoCircle size={14} color="#faad14" />
              <Text size="xs">Pengajuan sedang dalam proses verifikasi</Text>
            </Group>
          )}
        </Stack>
      </Paper>

      {/* Tabs Navigation - Minimal gap */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        size="small"
        items={[
          { key: "usulan", label: "Daftar Usulan Jabatan" },
          { key: "lampiran", label: "Daftar Penyimpanan" },
          { key: "audit-log", label: "Audit Log" },
        ]}
        tabBarStyle={{ marginBottom: 0 }}
      />

      {/* Page Content - Direct below tabs */}
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
      <KirimUsulanModal
        open={kirimModal}
        onClose={() => setKirimModal(false)}
        data={data}
      />
    </Stack>
  );
}

export default FormasiUsulanDetail;
