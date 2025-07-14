import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
} from "antd";
import { useState, useCallback, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import { findPendidikan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";

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
const ModalUbahPendidikan = ({ open, row, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Reset search term saat modal dibuka
  useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

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

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const handleSearch = (value) => {
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  // Query untuk initial data (jika ada pendidikan yang sudah dipilih)
  const { data: initialPendidikan } = useQuery({
    queryKey: ["pendidikan-initial", row?.tkPendidikanId, row?.pendidikanId],
    queryFn: () =>
      findPendidikan({
        tk_pendidikan_id: row?.tkPendidikanId,
        pendidikan_id: row?.pendidikanId,
        nama: row?.pendidikanNama,
      }),
    enabled: Boolean(open && row?.tkPendidikanId && row?.pendidikanId),
    refetchOnWindowFocus: false,
  });

  // Query untuk async search
  const { data: pendidikanOptions, isLoading: isLoadingSearch } = useQuery({
    queryKey: ["pendidikan-search", row?.tkPendidikanId, searchTerm],
    queryFn: () =>
      findPendidikan({
        tk_pendidikan_id: row?.tkPendidikanId,
        nama: searchTerm,
      }),
    enabled: Boolean(
      open && row?.tkPendidikanId && searchTerm && searchTerm.length >= 2
    ),
    refetchOnWindowFocus: false,
  });

  // Combine initial data dan search results
  const pendidikan = useMemo(() => {
    const initial = initialPendidikan || [];
    const search = pendidikanOptions || [];

    if (searchTerm && searchTerm.length >= 2) {
      return search;
    }

    return initial;
  }, [initialPendidikan, pendidikanOptions, searchTerm]);

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

  // Reset form saat modal dibuka
  useEffect(() => {
    if (open && formattedData) {
      form.resetFields();
      form.setFieldsValue(formattedData);
    }
  }, [open, formattedData, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Ubah Usulan Pendidikan"
      width={800}
    >
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
            <Form.Item name="pendidikanId" label="Pendidikan">
              <Select
                showSearch
                allowClear
                placeholder="Ketik minimal 2 karakter untuk mencari..."
                loading={isLoadingSearch}
                filterOption={false}
                onSearch={handleSearch}
                onClear={handleClear}
                notFoundContent={
                  isLoadingSearch ? "Mencari..." : "Tidak ditemukan"
                }
                options={pendidikan?.map((item) => ({
                  label: item.nama,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

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
      </Form>
    </Modal>
  );
};

const UbahUsulanPendidikan = ({ row }) => {
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <>
      <ModalUbahPendidikan
        open={showModal}
        row={row}
        onCancel={handleCloseModal}
      />
      <Button
        size="small"
        icon={<EditOutlined />}
        type="primary"
        onClick={handleShowModal}
      />
    </>
  );
};

export default UbahUsulanPendidikan;
