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
  Dropdown,
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
  IconKey,
  IconLock,
  IconArrowLeft,
  IconExternalLink,
  IconEye,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState, useEffect, useMemo } from "react";

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
    // Handle berbagai format nilai boolean
    if (value === true || value === "true" || value === "1" || value === 1) {
      return true;
    }
    // Secara eksplisit return false untuk nilai lainnya
    return false;
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
  const [step, setStep] = useState(1); // 1: Form Edit, 2: Konfirmasi

  // useEffect untuk set initial values saat modal dibuka
  useEffect(() => {
    if (open && row) {
      setStep(1); // Reset ke step 1
      setSelectedMasterData(null); // Reset selected master data
      setSelectedMasterId(null); // Reset dropdown value

      // Reset state pendidikan pertama ke false (user harus pilih manual)
      // Tidak mengambil dari row karena ini form ubah, user input ulang
      setIsPendidikanPertama(false);

      // Reset uploaded files
      setUploadedFiles({
        ijazah: null,
        transkrip: null,
      });

      // Hanya set field yang read-only (NIP dan Tingkat Pendidikan)
      // Field lain kosong, user harus pilih dari dropdown atau input manual
      const initialValues = {
        nipBaru: formatValue(row.nipBaru),
        tkPendidikanNama: formatValue(row.tkPendidikanNama),
        pendidikanId: formatValue(row.pendidikanId),
        // Field editable kosong dulu
        namaSekolah: "",
        tahunLulus: "",
        nomorIjasah: "",
        tglLulus: null,
        gelarDepan: "",
        gelarBelakang: "",
      };
      form.setFieldsValue(initialValues);
    }
  }, [open, row, form]);

  // Handler untuk memilih data pendidikan dari simaster
  const handleSelectPendidikanSimaster = (value) => {
    setSelectedMasterId(value); // Set dropdown value

    if (!value) {
      // Clear form jika dropdown di-clear
      setSelectedMasterData(null);
      form.setFieldsValue({
        namaSekolah: "",
        tahunLulus: "",
        nomorIjasah: "",
        tglLulus: null,
        gelarDepan: "",
        gelarBelakang: "",
      });
      return;
    }

    const selectedData = data?.find((item) => item.id === value);

    if (selectedData) {
      setSelectedMasterData(selectedData);

      // Langsung set tanpa setTimeout
      const newValues = {
        namaSekolah: selectedData.nama_sekolah || "",
        tahunLulus: selectedData.tahun_lulus
          ? String(selectedData.tahun_lulus)
          : "",
        nomorIjasah: selectedData.no_ijazah || "",
        tglLulus: selectedData.tgl_ijazah
          ? dayjs(selectedData.tgl_ijazah)
          : null,
        gelarDepan: selectedData.gelar_depan || "",
        gelarBelakang: selectedData.gelar_belakang || "",
      };

      form.setFieldsValue(newValues);
      message.success("Data berhasil diisi dari Simaster");
    } else {
      message.warning("Data tidak ditemukan");
    }
  };

  // State untuk menyimpan data yang dipilih dari master
  const [selectedMasterData, setSelectedMasterData] = useState(null);
  const [selectedMasterId, setSelectedMasterId] = useState(null);

  // State untuk menyimpan form values dari step 1
  const [step1Values, setStep1Values] = useState(null);

  // State untuk menyimpan file_uri setelah upload berhasil
  const [uploadedFiles, setUploadedFiles] = useState({
    ijazah: null,
    transkrip: null,
  });

  // State untuk toggle pendidikan pertama
  // Tidak perlu lazy initialization karena useEffect akan handle saat modal dibuka
  const [isPendidikanPertama, setIsPendidikanPertama] = useState(false);

  // State untuk preview file dengan iframe
  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: null,
    title: "",
  });

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

  // Handler untuk lanjut ke step 2
  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const ijazah = uploadedFiles?.ijazah;
      const transkrip = uploadedFiles?.transkrip;

      if (!ijazah || !transkrip) {
        message.error("Upload ijazah dan transkrip terlebih dahulu");
        return;
      }

      // Simpan values dari step 1 termasuk isPendidikanPertama
      console.log(
        "DEBUG handleNext - isPendidikanPertama:",
        isPendidikanPertama
      );
      setStep1Values({
        ...values,
        isPendidikanPertama: isPendidikanPertama,
      });
      setStep(2);
    } catch (error) {
      message.error("Lengkapi form terlebih dahulu");
    }
  };

  // Handler untuk kembali ke step 1
  const handleBack = () => {
    setStep(1);
  };

  // Handler untuk submit final
  const handleSubmit = async () => {
    try {
      const step2Values = await form.validateFields([
        "passphrase",
        "one_time_code",
      ]);
      const ijazah = uploadedFiles?.ijazah;
      const transkrip = uploadedFiles?.transkrip;

      // Combine values dari step 1 dan step 2
      const allValues = { ...step1Values, ...step2Values };

      // Gunakan nilai isPendidikanPertama yang disimpan di step1Values
      const isPendidikanPertamaFinal =
        step1Values?.isPendidikanPertama || false;
      console.log(
        "DEBUG handleSubmit - isPendidikanPertamaFinal:",
        isPendidikanPertamaFinal
      );

      const payload = {
        usulan_id: usulanId,
        tipe: "U",
        pns_orang_id: row?.idPns,
        id_riwayat: row?.id,
        tahun_lulus: allValues?.tahunLulus || "",
        nomor_ijazah: allValues?.nomorIjasah || "",
        nama_sek: allValues?.namaSekolah || "",
        glr_depan: allValues?.gelarDepan || "",
        glr_belakang: allValues?.gelarBelakang || "",
        tgl_tahun_lulus: allValues?.tglLulus
          ? dayjs(allValues?.tglLulus).format("YYYY-MM-DD")
          : "",
        pendidikan_id: allValues?.pendidikanId,
        pendidikan_nama: "",
        is_pendidikan_pertama: isPendidikanPertamaFinal ? "1" : "0",
        pencantuman_gelar: allValues?.pencantumanGelar || "",
        tingkat_pendidikan_id: row?.tkPendidikanId || "",
        tingkat_pendidikan_nama: row?.tkPendidikanNama || "",
        dok_transkrip_nilai: transkrip || null,
        dok_ijazah: ijazah || null,
        dok_sk_pencantuman_gelar: null,
        keterangan: allValues?.keterangan || "",
        passphrase: step2Values?.passphrase || "",
        one_time_code: step2Values?.one_time_code || "",
      };

      submit(payload);
      setStep(1); // Reset step after submission
    } catch (error) {
      message.error("Lengkapi passphrase dan OTP");
    }
  };

  return (
    <Modal
      destroyOnHidden
      open={open}
      onCancel={onCancel}
      title={
        <Space>
          <IconEdit size={18} />
          <span>
            {step === 1 ? "Ubah Usulan Pendidikan" : "Konfirmasi Perubahan"}
          </span>
        </Space>
      }
      width={step === 1 ? 900 : 550}
      centered
      footer={
        step === 1 ? (
          <Space>
            <Button onClick={onCancel}>Batal</Button>
            <Button type="primary" onClick={handleNext}>
              Lanjut
            </Button>
          </Space>
        ) : (
          <Space>
            <Button icon={<IconArrowLeft size={14} />} onClick={handleBack}>
              Kembali
            </Button>
            <Button
              type="primary"
              loading={isLoadingSubmit}
              onClick={handleSubmit}
            >
              Simpan
            </Button>
          </Space>
        )
      }
    >
      <Stack spacing="xs" style={{ marginBottom: 16 }}>
        <Flex justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            ID: {usulanId}
          </Text>
          {step === 1 && (
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
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "modal",
                        label: "Lihat di Modal",
                        icon: <IconEye size={14} />,
                        onClick: () =>
                          setPreviewModal({
                            open: true,
                            url: selectedMasterData.file_ijazah_url,
                            title: "Preview Ijazah (SIMASTER)",
                          }),
                      },
                      {
                        key: "newtab",
                        label: "Buka di Tab Baru",
                        icon: <IconExternalLink size={14} />,
                        onClick: () =>
                          window.open(
                            selectedMasterData.file_ijazah_url,
                            "_blank"
                          ),
                      },
                    ],
                  }}
                >
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileCheck size={14} />}
                  >
                    Ijazah
                  </Button>
                </Dropdown>
              )}
              {selectedMasterData?.file_nilai_url && (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "modal",
                        label: "Lihat di Modal",
                        icon: <IconEye size={14} />,
                        onClick: () =>
                          setPreviewModal({
                            open: true,
                            url: selectedMasterData.file_nilai_url,
                            title: "Preview Transkrip (SIMASTER)",
                          }),
                      },
                      {
                        key: "newtab",
                        label: "Buka di Tab Baru",
                        icon: <IconExternalLink size={14} />,
                        onClick: () =>
                          window.open(
                            selectedMasterData.file_nilai_url,
                            "_blank"
                          ),
                      },
                    ],
                  }}
                >
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileText size={14} />}
                  >
                    Transkrip
                  </Button>
                </Dropdown>
              )}
            </Space>
          )}
        </Flex>
      </Stack>

      <Form
        form={form}
        layout="vertical"
        initialValues={formattedData}
        size="small"
      >
        {step === 1 ? (
          <>
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
                  <Input
                    disabled
                    size="small"
                    prefix={<IconUser size={14} />}
                  />
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
                  <Input
                    disabled
                    size="small"
                    prefix={<IconSchool size={14} />}
                  />
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
                  value={selectedMasterId}
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
                      <Button
                        size="small"
                        icon={<IconUpload size={14} />}
                        style={{ flex: 1 }}
                        loading={isUploading}
                        disabled={isUploading}
                      >
                        Upload
                      </Button>
                    </Upload>
                  </Space.Compact>
                  {uploadedFiles.ijazah && (
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "modal",
                            label: "Lihat di Modal",
                            icon: <IconEye size={14} />,
                            onClick: () =>
                              setPreviewModal({
                                open: true,
                                url: `/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.ijazah}`,
                                title: "Preview Ijazah",
                              }),
                          },
                          {
                            key: "newtab",
                            label: "Buka di Tab Baru",
                            icon: <IconExternalLink size={14} />,
                            onClick: () =>
                              window.open(
                                `/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.ijazah}`,
                                "_blank"
                              ),
                          },
                        ],
                      }}
                    >
                      <Button
                        size="small"
                        type="link"
                        block
                        style={{ padding: "0 4px", height: 20 }}
                      >
                        <Text size="xs" c="blue">
                          Lihat File
                        </Text>
                      </Button>
                    </Dropdown>
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
                      <Button
                        size="small"
                        icon={<IconUpload size={14} />}
                        style={{ flex: 1 }}
                        loading={isUploading}
                        disabled={isUploading}
                      >
                        Upload
                      </Button>
                    </Upload>
                  </Space.Compact>
                  {uploadedFiles.transkrip && (
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "modal",
                            label: "Lihat di Modal",
                            icon: <IconEye size={14} />,
                            onClick: () =>
                              setPreviewModal({
                                open: true,
                                url: `/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.transkrip}`,
                                title: "Preview Transkrip Nilai",
                              }),
                          },
                          {
                            key: "newtab",
                            label: "Buka di Tab Baru",
                            icon: <IconExternalLink size={14} />,
                            onClick: () =>
                              window.open(
                                `/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.transkrip}`,
                                "_blank"
                              ),
                          },
                        ],
                      }}
                    >
                      <Button
                        size="small"
                        type="link"
                        block
                        style={{ padding: "0 4px", height: 20 }}
                      >
                        <Text size="xs" c="blue">
                          Lihat File
                        </Text>
                      </Button>
                    </Dropdown>
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
              <Form.Item
                name="namaSekolah"
                rules={[{ required: true, message: "Wajib diisi" }]}
                style={{ marginBottom: 0 }}
              >
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
                <Form.Item
                  name="tahunLulus"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
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
                <Form.Item
                  name="tglLulus"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
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
                <Form.Item
                  name="nomorIjasah"
                  rules={[{ required: true, message: "Wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
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
          </>
        ) : (
          <>
            {/* Step 2: Konfirmasi dengan Passphrase & OTP */}
            <Stack spacing="md">
              <Text size="sm" c="dimmed">
                Masukkan passphrase dan OTP untuk menyimpan perubahan usulan
                pendidikan
              </Text>

              <div>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  Passphrase
                </Text>
                <Form.Item
                  name="passphrase"
                  rules={[
                    { required: true, message: "Passphrase wajib diisi" },
                  ]}
                  style={{ marginBottom: 12 }}
                >
                  <Input.Password
                    size="small"
                    placeholder="Passphrase SIASN"
                    autoComplete="off"
                    prefix={<IconKey size={14} />}
                  />
                </Form.Item>
              </div>

              <div>
                <Text
                  size="xs"
                  fw={500}
                  style={{ display: "block", marginBottom: 4 }}
                >
                  One Time Code (OTP)
                </Text>
                <Form.Item
                  name="one_time_code"
                  rules={[{ required: true, message: "OTP wajib diisi" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    size="small"
                    placeholder="Kode OTP"
                    autoComplete="off"
                    prefix={<IconLock size={14} />}
                  />
                </Form.Item>
              </div>
            </Stack>
          </>
        )}
      </Form>

      {/* Modal Preview File dengan iframe */}
      <Modal
        open={previewModal.open}
        title={previewModal.title}
        onCancel={() => setPreviewModal({ open: false, url: null, title: "" })}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        {previewModal.url && (
          <iframe
            src={previewModal.url}
            style={{
              width: "100%",
              height: "70vh",
              border: "none",
            }}
            title={previewModal.title}
          />
        )}
      </Modal>
    </Modal>
  );
};

export default ModalUbahPendidikan;
