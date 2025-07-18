import {
  createUsulanPeremajaanPendidikan,
  submitUsulanPeremajaanPendidikan,
  uploadFilePeremajaanPendidikan,
} from "@/services/admin.services";
import { rwPendidikanMasterByNip, urlToPdf } from "@/services/master.services";
import { findPendidikan } from "@/services/siasn-services";
import { checkJenjangPendidikanSIASN } from "@/utils/index";
import { EditOutlined } from "@ant-design/icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Upload,
} from "antd";
import { UploadOutlined, CloudDownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useState } from "react";

/**{
  "usulan_id": "b0154c5f-8226-4eed-a6c3-83dcf7c228d8",
  "tipe": "D",
  "pns_orang_id": "A5EB04239877F6A0E040640A040252AD",
  "id_riwayat": "AE20670BD626F311E040640A0202096A",
  "tahun_lulus": "2001",
  "nomor_ijazah": "",
  "nama_sek": "",
  "glr_depan": "",
  "keterangan": "sudah ada",
  "glr_belakang": "S.Pd",
  "tgl_tahun_lulus": "",
  "pendidikan_id": "A5EB03E21B68F6A0E040640A040252AD",
  "pendidikan_nama": "A-IV AKUNTANSI",
  "is_pendidikan_pertama": "0",
  "pencantuman_gelar": "",
  "tingkat_pendidikan_id": "40",
  "tingkat_pendidikan_nama": "S-1/Sarjana",
  "dok_transkrip_nilai": null,
  "dok_ijazah": null,
  "dok_sk_pencantuman_gelar": null
} */
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
    },
    onError: (error) => {
      message.error("Gagal upload file: " + error.message);
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
        gelarDepan: formatValue(row.gelarDepan),
        gelarBelakang: formatValue(row.gelarBelakang),
        pendidikanId: formatValue(row.pendidikanId),
        path: formatValue(row.path),
      }
    : {};

  const [form] = Form.useForm();

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
      });
      return;
    }

    const selectedData = data?.find((item) => item.id === value);
    if (selectedData) {
      setSelectedMasterData(selectedData);
      form.setFieldsValue({
        namaSekolah: selectedData.nama_sekolah || "-",
        tahunLulus: selectedData.tahun_lulus?.toString() || "-",
        nomorIjasah: selectedData.no_ijazah || "-",
        tglLulus: selectedData.tgl_ijazah
          ? dayjs(selectedData.tgl_ijazah)
          : null,
      });
    }
  };

  // State untuk menyimpan data yang dipilih dari master
  const [selectedMasterData, setSelectedMasterData] = useState(null);

  // State untuk menyimpan file_uri setelah upload berhasil
  const [uploadedFiles, setUploadedFiles] = useState({
    ijazah: null,
    transkrip: null,
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
        message.error("Gagal mengunduh file dari master: " + error.message);
      }
    } else {
      message.warning(
        "Pilih data dari master terlebih dahulu atau tidak ada file transkrip di master"
      );
    }
  };

  const handleSubmit = async () => {
    const value = await form.validateFields();
    const ijazah = uploadedFiles?.ijazah;
    const transkrip = uploadedFiles?.transkrip;

    if (ijazah && transkrip) {
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
        pendidikan_id: row?.pendidikanId,
        pendidikan_nama: row?.pendidikanNama || "",
        is_pendidikan_pertama: row?.isPendidikanPertama,
        pencantuman_gelar: value?.pencantumanGelar || "",
        tingkat_pendidikan_id: row?.tkPendidikanId || "",
        tingkat_pendidikan_nama: row?.tkPendidikanNama || "",
        dok_transkrip_nilai: transkrip || null,
        dok_ijazah: ijazah || null,
        dok_sk_pencantuman_gelar: null,
        keterangan: value?.keterangan || "",
      };

      // console.log(payload);
      submit(payload);
    }
  };

  return (
    <Modal
      destroyOnHidden
      confirmLoading={isLoadingSubmit}
      onOk={handleSubmit}
      open={open}
      onCancel={onCancel}
      title={`Ubah Usulan Pendidikan ${usulanId}`}
      width={800}
    >
      <Button loading={isRefetching} onClick={() => refetch()}>
        Refresh
      </Button>
      <Divider />
      <Space>
        <a href={selectedMasterData?.file_ijazah_url} target="_blank">
          Ijazah
        </a>
        <a href={selectedMasterData?.file_nilai_url} target="_blank">
          Transkrip Nilai
        </a>
      </Space>
      <Form form={form} layout="vertical" initialValues={formattedData}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nipBaru" label="NIP Baru">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="nipLama" label="NIP Lama">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tkPendidikanNama" label="Tingkat Pendidikan">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            {initialPendidikan?.length && (
              <Form.Item name="pendidikanId" label="Pendidikan">
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  options={initialPendidikan?.map((item) => ({
                    label: item.nama,
                    value: item.id,
                  }))}
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        {/* Pilih data pendidikan dari Simaster untuk mengisi otomatis */}
        {data?.length > 0 && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Pilih Data Pendidikan dari Simaster (Opsional)">
                <Select
                  showSearch
                  allowClear
                  placeholder="Pilih data untuk mengisi form secara otomatis"
                  optionFilterProp="label"
                  onChange={handleSelectPendidikanSimaster}
                  options={data?.map((item) => ({
                    label: `${item.prodi} - ${item.nama_sekolah} (${item.tahun_lulus})`,
                    value: item.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="tahunLulus" label="Tahun Lulus">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tglLulus" label="Tanggal Dikeluarkan Ijazah">
              <DatePicker format="DD-MM-YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="nomorIjasah" label="Nomor Ijazah">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="namaSekolah" label="Nama Sekolah">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gelarDepan" label="Gelar Depan">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="gelarBelakang" label="Gelar Belakang">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Pendidikan Pertama">
          <Checkbox checked={formatBoolean(row?.isPendidikanPertama)}>
            Pendidikan Pertama
          </Checkbox>
        </Form.Item>

        <Divider>Upload Dokumen</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="File Ijazah">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  icon={<CloudDownloadOutlined />}
                  onClick={handleSyncIjazahFromMaster}
                  loading={isUploading}
                  disabled={!selectedMasterData?.file_ijazah_url}
                  type="dashed"
                  style={{ width: "100%" }}
                >
                  Sync dari Master
                  {selectedMasterData?.file_ijazah_url
                    ? " ✓"
                    : " (Tidak tersedia)"}
                </Button>
                <Upload
                  name="ijazah"
                  accept=".pdf,.jpg,.jpeg,.png"
                  beforeUpload={handleUploadIjazah}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} style={{ width: "100%" }}>
                    Upload Manual
                  </Button>
                </Upload>
                {uploadedFiles.ijazah && (
                  <div
                    style={{
                      padding: "8px",
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: "4px",
                    }}
                  >
                    <a
                      href={`/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.ijazah}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#52c41a", fontWeight: "bold" }}
                    >
                      📄 Download File Ijazah
                    </a>
                  </div>
                )}
              </Space>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="File Transkrip Nilai">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  icon={<CloudDownloadOutlined />}
                  onClick={handleSyncNilaiFromMaster}
                  loading={isUploading}
                  disabled={!selectedMasterData?.file_nilai_url}
                  type="dashed"
                  style={{ width: "100%" }}
                >
                  Sync dari Master
                  {selectedMasterData?.file_nilai_url
                    ? " ✓"
                    : " (Tidak tersedia)"}
                </Button>
                <Upload
                  name="transkrip"
                  accept=".pdf,.jpg,.jpeg,.png"
                  beforeUpload={handleUploadNilai}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} style={{ width: "100%" }}>
                    Upload Manual
                  </Button>
                </Upload>
                {uploadedFiles.transkrip && (
                  <div
                    style={{
                      padding: "8px",
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: "4px",
                    }}
                  >
                    <a
                      href={`/helpdesk/api/siasn/ws/download?filePath=${uploadedFiles.transkrip}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#52c41a", fontWeight: "bold" }}
                    >
                      📄 Download File Transkrip
                    </a>
                  </div>
                )}
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const UbahUsulanPendidikan = ({ row }) => {
  const [showModal, setShowModal] = useState(false);
  const [usulanId, setUsulanId] = useState(null);
  const [currentRow, setCurrentRow] = useState(null);

  const { mutate: createUsulanPeremajaan, isLoading: loadingCreateUsulan } =
    useMutation({
      mutationFn: createUsulanPeremajaanPendidikan,
      onSuccess: (data) => {
        setCurrentRow(row);
        setShowModal(true);
        setUsulanId(data?.usulan_pendidikan_id);
      },
      onError: (error) => {
        message.error(error.message);
      },
    });

  const handleShowModal = () => {
    createUsulanPeremajaan({
      nip: row?.nipBaru,
    });
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <>
      <ModalUbahPendidikan
        open={showModal}
        usulanId={usulanId}
        row={row}
        onCancel={handleCloseModal}
        currentRow={currentRow}
        nip={row?.nipBaru}
      />
      <Button
        loading={loadingCreateUsulan}
        disabled={loadingCreateUsulan}
        size="small"
        icon={<EditOutlined />}
        type="primary"
        onClick={handleShowModal}
      />
    </>
  );
};

export default UbahUsulanPendidikan;
