import {
  uploadFilePeremajaanPendidikan,
  submitUsulanPeremajaanPendidikan,
} from "@/services/admin.services";
import { rwPendidikanMasterByNip, urlToPdf } from "@/services/master.services";
import { findPendidikan } from "@/services/siasn-services";
import { checkJenjangPendidikanSIASN } from "@/utils/index";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Upload,
} from "antd";
import { Text, Badge, Stack } from "@mantine/core";
import {
  IconEdit,
  IconUpload,
  IconCloudDown,
  IconRefresh,
  IconFileCheck,
  IconFileText,
  IconSchool,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import ModalKonfirmasiSubmitPendidikan from "./ModalKonfirmasiSubmitPendidikan";

const ModalUbahPendidikan = ({
  usulanId,
  open,
  row,
  onCancel,
  nip,
  currentRow,
}) => {
  const { data, isLoading, refetch, isRefetching } = useQuery(
    ["riwayat-pendidikan-simaster-by-nip", nip],
    () => rwPendidikanMasterByNip(nip),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      select: (data) => {
        const jenjangId = currentRow?.tkPendidikanId;
        const currentId = checkJenjangPendidikanSIASN(Number(jenjangId));

        if (currentId) {
          return data?.filter((d) => d?.kode_jenjang === currentId);
        } else {
          return [];
        }
      },
    }
  );

  // State untuk loading independen per file
  const [loadingSync, setLoadingSync] = useState({
    ijazah: false,
    transkrip: false,
  });

  // upload file mutation
  const { mutate: uploadFile, isLoading: isUploading } = useMutation({
    mutationFn: (data) => uploadFilePeremajaanPendidikan(data.formData),
    onSuccess: (result, variables) => {
      message.success("File berhasil diupload");

      // Simpan file_uri berdasarkan jenis dokumen
      if (result?.file_uri) {
        setUploadedFiles((prev) => ({
          ...prev,
          [variables.type]: result.file_uri,
        }));
      }

      // Reset loading state
      setLoadingSync((prev) => ({
        ...prev,
        [variables.type]: false,
      }));
    },
    onError: (error) => {
      const messageError =
        error?.response?.data?.error || "Internal server error";
      message.error("Gagal upload file: " + messageError);

      // Reset loading state on error
      setLoadingSync({
        ijazah: false,
        transkrip: false,
      });
    },
  });

  // Helper function untuk boolean conversion
  const formatBoolean = (value) => {
    const result = value === true || value === "1" || value === 1;
    return result;
  };

  // Helper function untuk mengubah null/empty menjadi "-"
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    return value;
  };

  const formatValueGelar = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    return value;
  };

  // Query untuk initial data (jika ada pendidikan yang sudah dipilih)
  const { data: initialPendidikan } = useQuery({
    queryKey: ["pendidikan-initial", row?.tkPendidikanId, row?.pendidikanId],
    queryFn: () =>
      findPendidikan({
        tk_pendidikan_id: row?.tkPendidikanId,
      }),
    enabled: Boolean(open && row?.tkPendidikanId && row?.pendidikanId),
    refetchOnWindowFocus: false,
  });

  // Format data untuk form dengan null values diubah menjadi "-"
  const formattedData = row
    ? {
        ...row,
        nipBaru: formatValue(row.nipBaru),
        nipLama: formatValue(row.nipLama),
        tkPendidikanNama: formatValue(row.tkPendidikanNama),
        pendidikanNama: formatValue(row.pendidikanNama),
        tahunLulus: formatValue(row.tahunLulus),
        tglLulus: row.tglLulus ? dayjs(row.tglLulus, "DD-MM-YYYY") : null,
        nomorIjasah: formatValue(row.nomorIjasah),
        namaSekolah: formatValue(row.namaSekolah),
        gelarDepan: formatValueGelar(row.gelarDepan),
        gelarBelakang: formatValueGelar(row.gelarBelakang),
        pendidikanId: formatValue(row.pendidikanId),
        path: formatValue(row.path),
      }
    : {};

  const [form] = Form.useForm();

  // useEffect untuk set initial values saat modal dibuka
  useEffect(() => {
    if (open && row) {
      const initialValues = {
        nipBaru: formatValue(row.nipBaru),
        nipLama: formatValue(row.nipLama),
        tkPendidikanNama: formatValue(row.tkPendidikanNama),
        pendidikanNama: formatValue(row.pendidikanNama),
        tahunLulus: formatValue(row.tahunLulus),
        tglLulus: row.tglLulus ? dayjs(row.tglLulus, "DD-MM-YYYY") : null,
        nomorIjasah: formatValue(row.nomorIjasah),
        namaSekolah: formatValue(row.namaSekolah),
        gelarDepan: formatValueGelar(row.gelarDepan),
        gelarBelakang: formatValueGelar(row.gelarBelakang),
        pendidikanId: formatValue(row.pendidikanId),
      };
      form.setFieldsValue(initialValues);
    }
  }, [open, row, form]);

  // Handler untuk memilih data pendidikan dari simaster
  const handleSelectPendidikanSimaster = (value) => {
    if (!value) {
      // Reset form jika tidak ada yang dipilih
      setSelectedMasterData(null);
      form.setFieldsValue({
        namaSekolah: formatValue(row?.namaSekolah),
        tahunLulus: formatValue(row?.tahunLulus),
        nomorIjasah: formatValue(row?.nomorIjasah),
        tglLulus: row?.tglLulus ? dayjs(row.tglLulus, "DD-MM-YYYY") : null,
        gelarDepan: formatValueGelar(row?.gelarDepan),
        gelarBelakang: formatValueGelar(row?.gelarBelakang),
      });
      return;
    }

    const selectedData = data?.find((item) => item.id === value);

    if (selectedData) {
      setSelectedMasterData(selectedData);

      // Gunakan setTimeout untuk memastikan state sudah update
      setTimeout(() => {
        // Isi semua field yang tersedia dari simaster
        form.setFieldsValue({
          namaSekolah: selectedData.nama_sekolah || "",
          tahunLulus: selectedData.tahun_lulus?.toString() || "",
          nomorIjasah: selectedData.no_ijazah || "",
          tglLulus: selectedData.tgl_ijazah
            ? dayjs(selectedData.tgl_ijazah)
            : null,
          gelarDepan: selectedData.gelar_depan || "",
          gelarBelakang: selectedData.gelar_belakang || "",
        });

        message.success("Data berhasil diisi dari Simaster");
      }, 100);
    } else {
      message.warning("Data tidak ditemukan");
    }
  };

  // State untuk menyimpan data yang dipilih dari master
  const [selectedMasterData, setSelectedMasterData] = useState(null);

  // State untuk menyimpan file_uri setelah upload berhasil
  const [uploadedFiles, setUploadedFiles] = useState({
    ijazah: null,
    transkrip: null,
  });

  // State untuk toggle pendidikan pertama
  const [isPendidikanPertama, setIsPendidikanPertama] = useState(
    formatBoolean(row?.isPendidikanPertama)
  );

  // Fungsi untuk handle upload file ijazah manual
  const handleUploadIjazah = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("usulan_id", usulanId);
    formData.append("nama_dokumen", usulanId);
    formData.append("id_ref_dokumen", "870");

    uploadFile({
      formData,
      type: "ijazah",
    });

    return false; // Prevent default upload behavior
  };

  // Fungsi untuk handle upload file nilai manual
  const handleUploadNilai = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("usulan_id", usulanId);
    formData.append("nama_dokumen", usulanId);
    formData.append("id_ref_dokumen", "871");

    uploadFile({
      formData,
      type: "transkrip",
    });

    return false; // Prevent default upload behavior
  };

  // 870 ijazah dan nilai 871

  // Fungsi untuk sync ijazah dari master
  const handleSyncIjazahFromMaster = async () => {
    if (selectedMasterData?.file_ijazah_url) {
      try {
        setLoadingSync((prev) => ({ ...prev, ijazah: true }));
        message.loading("Mengunduh file ijazah dari master...", 0);

        const result = await urlToPdf({
          url: selectedMasterData.file_ijazah_url,
        });

        const formData = new FormData();
        formData.append("file", result);
        formData.append("usulan_id", usulanId);
        formData.append("nama_dokumen", usulanId);
        formData.append("id_ref_dokumen", "870");

        uploadFile({
          formData,
          type: "ijazah",
        });

        message.destroy();
      } catch (error) {
        message.destroy();
        setLoadingSync((prev) => ({ ...prev, ijazah: false }));
        message.error("Gagal mengunduh file dari master: " + error.message);
      }
    } else {
      message.warning(
        "Pilih data dari master terlebih dahulu atau tidak ada file ijazah di master"
      );
    }
  };

  const { mutate: submit, isLoading: isLoadingSubmit } = useMutation(
    (data) => submitUsulanPeremajaanPendidikan(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah usulan pendidikan");
        onCancel();
        form.resetFields();
        setUploadedFiles({
          ijazah: null,
          transkrip: null,
        });
      },
      onError: (error) => {
        message.error("Gagal mengubah usulan pendidikan: " + error.message);
      },
    }
  );

  // Fungsi untuk sync transkrip nilai dari master
  const handleSyncNilaiFromMaster = async () => {
    if (selectedMasterData?.file_nilai_url) {
      try {
        setLoadingSync((prev) => ({ ...prev, transkrip: true }));
        message.loading("Mengunduh file transkrip nilai dari master...", 0);

        const result = await urlToPdf({
          url: selectedMasterData.file_nilai_url,
        });

        const formData = new FormData();
        formData.append("file", result);
        formData.append("usulan_id", usulanId);
        formData.append("nama_dokumen", usulanId);
        formData.append("id_ref_dokumen", "871");

        uploadFile({
          formData,
          type: "transkrip",
        });

        message.destroy();
      } catch (error) {
        message.destroy();
        setLoadingSync((prev) => ({ ...prev, transkrip: false }));
        message.error("Gagal mengunduh file dari master: " + error.message);
      }
    } else {
      message.warning(
        "Pilih data dari master terlebih dahulu atau tidak ada file transkrip di master"
      );
    }
  };

  // State untuk modal konfirmasi
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmForm] = Form.useForm();

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const ijazah = uploadedFiles?.ijazah;
      const transkrip = uploadedFiles?.transkrip;

      if (!ijazah || !transkrip) {
        message.error("Upload ijazah dan transkrip terlebih dahulu");
        return;
      }

      // Show confirmation modal
      setShowConfirmModal(true);
    } catch (error) {
      message.error("Lengkapi form terlebih dahulu");
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      const value = await form.validateFields();
      const confirmValue = await confirmForm.validateFields();
      const ijazah = uploadedFiles?.ijazah;
      const transkrip = uploadedFiles?.transkrip;

      const payload = {
        usulan_id: usulanId,
        tipe: "U",
        pns_orang_id: row?.idPns,
        id_riwayat: row?.id,
        tahun_lulus: value?.tahunLulus || "",
        nomor_ijazah: value?.nomorIjasah || "",
        nama_sek: value?.namaSekolah || "",
        glr_depan: value?.gelarDepan || "",
        glr_belakang: value?.gelarBelakang || "",
        tgl_tahun_lulus: value?.tglLulus
          ? dayjs(value?.tglLulus).format("YYYY-MM-DD")
          : "",
        pendidikan_id: value?.pendidikanId,
        pendidikan_nama: "",
        is_pendidikan_pertama: isPendidikanPertama ? "1" : "0",
        pencantuman_gelar: value?.pencantumanGelar || "",
        tingkat_pendidikan_id: row?.tkPendidikanId || "",
        tingkat_pendidikan_nama: row?.tkPendidikanNama || "",
        dok_transkrip_nilai: transkrip || null,
        dok_ijazah: ijazah || null,
        dok_sk_pencantuman_gelar: null,
        keterangan: value?.keterangan || "",
        passphrase: confirmValue?.passphrase || "",
        one_time_code: confirmValue?.one_time_code || "",
      };

      submit(payload);
      setShowConfirmModal(false);
      confirmForm.resetFields();
    } catch (error) {
      message.error("Lengkapi passphrase dan OTP");
    }
  };

  return (
    <>
      <Modal
        destroyOnHidden
        onOk={handleSubmit}
        open={open}
        onCancel={onCancel}
        title={
          <Space>
            <IconEdit size={18} />
            <span>Ubah Usulan Pendidikan</span>
          </Space>
        }
        width={900}
        centered
        okText="Simpan"
        cancelText="Batal"
      >
        <Stack spacing="xs" style={{ marginBottom: 16 }}>
          <Flex justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              ID: {usulanId}
            </Text>
            <Space size="small">
              <Button
                size="small"
                icon={<IconRefresh size={14} />}
                loading={isRefetching}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
              {selectedMasterData?.file_ijazah_url && (
                <Button
                  size="small"
                  type="link"
                  icon={<IconFileCheck size={14} />}
                  href={selectedMasterData.file_ijazah_url}
                  target="_blank"
                >
                  Ijazah
                </Button>
              )}
              {selectedMasterData?.file_nilai_url && (
                <Button
                  size="small"
                  type="link"
                  icon={<IconFileText size={14} />}
                  href={selectedMasterData.file_nilai_url}
                  target="_blank"
                >
                  Transkrip
                </Button>
              )}
            </Space>
          </Flex>
        </Stack>
        <Form
          form={form}
          layout="vertical"
          initialValues={formattedData}
          size="small"
        >
          <Row gutter={[12, 8]}>
            <Col span={8}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                NIP
              </Text>
              <Form.Item name="nipBaru" style={{ marginBottom: 0 }}>
                <Input disabled size="small" prefix={<IconUser size={14} />} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Tingkat Pendidikan
              </Text>
              <Form.Item name="tkPendidikanNama" style={{ marginBottom: 0 }}>
                <Input disabled size="small" prefix={<IconSchool size={14} />} />
              </Form.Item>
            </Col>
          </Row>

          {initialPendidikan?.length > 0 && (
            <div style={{ marginBottom: 8, marginTop: 8 }}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Pendidikan
              </Text>
              <Form.Item name="pendidikanId" style={{ marginBottom: 0 }}>
                <Select
                  size="small"
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={initialPendidikan?.map((item) => ({
                    label: item.nama,
                    value: item.id,
                  }))}
                />
              </Form.Item>
            </div>
          )}

          {data?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Isi Otomatis dari Simaster
              </Text>
              <Select
                size="small"
                showSearch
                allowClear
                placeholder="Pilih data dari Simaster untuk mengisi form otomatis"
                optionFilterProp="label"
                onChange={handleSelectPendidikanSimaster}
                style={{ width: "100%" }}
                options={data?.map((item) => ({
                  label: `${item.prodi} - ${item.nama_sekolah} (${item.tahun_lulus})`,
                  value: item.id,
                }))}
              />
            </div>
          )}

          <Divider style={{ margin: "12px 0" }}>
            <Text size="xs" fw={500}>
              Dokumen
            </Text>
          </Divider>

          <Row gutter={[16, 12]}>
            <Col span={12}>
              <Stack spacing={6}>
                <Flex justify="space-between" align="center">
                  <Text size="xs" fw={500}>
                    Ijazah
                  </Text>
                  {uploadedFiles.ijazah && (
                    <Badge size="sm" variant="light" color="green">
                      Uploaded
                    </Badge>
                  )}
                </Flex>
                <Space.Compact style={{ width: "100%" }}>
                  <Button
                    size="small"
                    icon={<IconCloudDown size={14} />}
                    onClick={handleSyncIjazahFromMaster}
                    loading={loadingSync.ijazah}
                    disabled={!selectedMasterData?.file_ijazah_url}
                    style={{ flex: 1 }}
                  >
                    Sync
                  </Button>
                  <Upload
                    accept=".pdf,.jpg,.jpeg,.png"
                    beforeUpload={handleUploadIjazah}
                    showUploadList={false}
                  >
                    <Button size="small" icon={<IconUpload size={14} />} style={{ flex: 1 }}>
                      Upload
                    </Button>
                  </Upload>
                </Space.Compact>
                {uploadedFiles.ijazah && (
                  <Button
                    size="small"
                    type="link"
                    block
                    href={`/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.ijazah}`}
                    target="_blank"
                    style={{ padding: "0 4px", height: 20 }}
                  >
                    <Text size="xs" c="blue">
                      Lihat File
                    </Text>
                  </Button>
                )}
              </Stack>
            </Col>
            <Col span={12}>
              <Stack spacing={6}>
                <Flex justify="space-between" align="center">
                  <Text size="xs" fw={500}>
                    Transkrip Nilai
                  </Text>
                  {uploadedFiles.transkrip && (
                    <Badge size="sm" variant="light" color="green">
                      Uploaded
                    </Badge>
                  )}
                </Flex>
                <Space.Compact style={{ width: "100%" }}>
                  <Button
                    size="small"
                    icon={<IconCloudDown size={14} />}
                    onClick={handleSyncNilaiFromMaster}
                    loading={loadingSync.transkrip}
                    disabled={!selectedMasterData?.file_nilai_url}
                    style={{ flex: 1 }}
                  >
                    Sync
                  </Button>
                  <Upload
                    accept=".pdf,.jpg,.jpeg,.png"
                    beforeUpload={handleUploadNilai}
                    showUploadList={false}
                  >
                    <Button size="small" icon={<IconUpload size={14} />} style={{ flex: 1 }}>
                      Upload
                    </Button>
                  </Upload>
                </Space.Compact>
                {uploadedFiles.transkrip && (
                  <Button
                    size="small"
                    type="link"
                    block
                    href={`/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.transkrip}`}
                    target="_blank"
                    style={{ padding: "0 4px", height: 20 }}
                  >
                    <Text size="xs" c="blue">
                      Lihat File
                    </Text>
                  </Button>
                )}
              </Stack>
            </Col>
          </Row>

          <Divider style={{ margin: "12px 0" }}>
            <Text size="xs" fw={500}>
              Data Pendidikan
            </Text>
          </Divider>

          <div style={{ marginBottom: 8 }}>
            <Text
              size="xs"
              fw={500}
              style={{ display: "block", marginBottom: 4 }}
            >
              Nama Sekolah/Universitas
            </Text>
            <Form.Item name="namaSekolah" style={{ marginBottom: 0 }}>
              <Input
                size="small"
                placeholder="Contoh: Universitas Indonesia"
                prefix={<IconSchool size={14} />}
              />
            </Form.Item>
          </div>

          <Row gutter={[12, 8]}>
            <Col span={8}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Tahun Lulus
              </Text>
              <Form.Item name="tahunLulus" style={{ marginBottom: 0 }}>
                <Input
                  size="small"
                  placeholder="2020"
                  prefix={<IconCalendar size={14} />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Tgl Ijazah
              </Text>
              <Form.Item name="tglLulus" style={{ marginBottom: 0 }}>
                <DatePicker
                  size="small"
                  format="DD-MM-YYYY"
                  style={{ width: "100%" }}
                  placeholder="Pilih tanggal"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                No Ijazah
              </Text>
              <Form.Item name="nomorIjasah" style={{ marginBottom: 0 }}>
                <Input size="small" placeholder="Nomor ijazah" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 8]} style={{ marginTop: 8 }}>
            <Col span={12}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Gelar Depan
              </Text>
              <Form.Item name="gelarDepan" style={{ marginBottom: 0 }}>
                <Input size="small" autoComplete="off" placeholder="Dr." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Text
                size="xs"
                fw={500}
                style={{ display: "block", marginBottom: 4 }}
              >
                Gelar Belakang
              </Text>
              <Form.Item name="gelarBelakang" style={{ marginBottom: 0 }}>
                <Input
                  size="small"
                  autoComplete="off"
                  placeholder="S.Kom, M.Kom"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Checkbox
              checked={isPendidikanPertama}
              onChange={(e) => setIsPendidikanPertama(e.target.checked)}
            >
              <Text size="xs">Pendidikan Pertama</Text>
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Konfirmasi Submit */}
      <ModalKonfirmasiSubmitPendidikan
        open={showConfirmModal}
        onCancel={() => {
          setShowConfirmModal(false);
          confirmForm.resetFields();
        }}
        onOk={handleConfirmSubmit}
        loading={isLoadingSubmit}
        form={confirmForm}
      />
    </>
  );
};

export default ModalUbahPendidikan;

