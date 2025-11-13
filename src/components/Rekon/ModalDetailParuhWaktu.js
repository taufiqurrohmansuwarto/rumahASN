import {
  Text,
  Stack,
  Group,
  Paper,
  Switch as MantineSwitch,
  Divider,
  Collapse,
} from "@mantine/core";
import {
  IconUser,
  IconId,
  IconBuilding,
  IconCash,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconChevronDown,
  IconChevronRight,
  IconBuildingHospital,
} from "@tabler/icons-react";
import { Modal, Button, TreeSelect, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGajiPengadaanParuhWaktu as updateGajiPengadaanParuhWaktuService } from "@/services/siasn-services";

const useUpdateGajiPengadaanParuhWaktu = () => {
  const queryClient = useQueryClient();

  const { mutateAsync: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }) =>
      updateGajiPengadaanParuhWaktuService({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["daftar-pegawai-paruh-waktu"],
      });
      message.success("Berhasil update gaji pengadaan paruh waktu");
    },
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["daftar-pegawai-paruh-waktu"],
      });
    },
  });

  return { update, isUpdating };
};

const ModalDetailParuhWaktu = ({
  visible,
  onClose,
  data,
  unor,
  unorFull,
  isLoadingUnor,
  isLoadingUnorFull,
}) => {
  const [luarPerangkatDaerah, setLuarPerangkatDaerah] = useState(false);
  const [isBLUD, setIsBLUD] = useState(false);
  const [upah, setUpah] = useState("0");
  const [unorId, setUnorId] = useState("");
  const [errors, setErrors] = useState({});
  const [unorExpanded, setUnorExpanded] = useState(false);
  const { update, isUpdating } = useUpdateGajiPengadaanParuhWaktu();

  useEffect(() => {
    if (data && visible) {
      const gajiValue =
        data?.gaji || data?.detail?.usulan_data?.data?.gaji_pokok || "0";
      setUpah(gajiValue.toString());
      setUnorId(data?.unor_pk || data?.unor_id_simaster || "");
      setLuarPerangkatDaerah(data?.luar_perangkat_daerah || false);
      setIsBLUD(data?.is_blud || false);
      setErrors({});
      setUnorExpanded(false);
    }
  }, [data, visible]);

  const formatRupiah = (value) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleUpahChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    setUpah(numericValue);
    setErrors({ ...errors, upah: null });
  };

  const handleSubmit = async () => {
    try {
      const newErrors = {};

      if (!unorId) {
        newErrors.unorId = "Unit organisasi wajib dipilih";
      }
      
      // Validasi upah: jika bukan BLUD, upah wajib diisi dan lebih dari 0
      if (!isBLUD) {
        if (!upah || parseInt(upah) <= 0) {
          newErrors.upah = "Upah wajib diisi (atau aktifkan BLUD jika upah 0)";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const payload = {
        data: {
          gaji: parseInt(upah) || 0,
          unor_pk: unorId,
          luar_perangkat_daerah: !!luarPerangkatDaerah,
          is_blud: !!isBLUD,
        },
        id: data?.id,
      };

      await update(payload);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      confirmLoading={isUpdating}
      width={650}
      centered
      styles={{
        body: { padding: "24px" },
      }}
    >
      {data && (
        <Stack spacing="md">
          {/* Header */}
          <div>
            <Text size="lg" fw={600} c="#FF4500">
              Kelola Data Pegawai
            </Text>
            <Text size="xs" c="dimmed">
              Update informasi upah pegawai PPPK paruh waktu
            </Text>
          </div>

          <Divider size="xs" />

          {/* Info Data Pegawai */}
          <Paper p="sm" radius="md" withBorder>
            <Stack spacing="xs">
              <Group spacing="xs" position="apart">
                <Group spacing="xs">
                  <IconUser
                    size={14}
                    stroke={1.5}
                    style={{ color: "#868e96" }}
                  />
                  <Text size="xs" c="dimmed" fw={500}>
                    Nama
                  </Text>
                </Group>
                <Text size="xs" fw={600}>
                  {data?.nama || "-"}
                </Text>
              </Group>

              <Group spacing="xs" position="apart">
                <Group spacing="xs">
                  <IconId size={14} stroke={1.5} style={{ color: "#868e96" }} />
                  <Text size="xs" c="dimmed" fw={500}>
                    NIP
                  </Text>
                </Group>
                <Text size="xs" fw={500} ff="monospace">
                  {data?.nip || "-"}
                </Text>
              </Group>

              <Divider size="xs" />

              <div>
                <Group
                  spacing="xs"
                  mb={4}
                  onClick={() => setUnorExpanded(!unorExpanded)}
                  style={{ cursor: "pointer" }}
                >
                  {unorExpanded ? (
                    <IconChevronDown
                      size={14}
                      stroke={1.5}
                      style={{ color: "#868e96" }}
                    />
                  ) : (
                    <IconChevronRight
                      size={14}
                      stroke={1.5}
                      style={{ color: "#868e96" }}
                    />
                  )}
                  <IconBuilding
                    size={14}
                    stroke={1.5}
                    style={{ color: "#868e96" }}
                  />
                  <Text size="xs" c="dimmed" fw={500}>
                    Unit Organisasi
                  </Text>
                </Group>
                <Collapse in={unorExpanded}>
                  <Stack spacing={6} pl={20}>
                    <div>
                      <Text size="10px" c="purple" fw={600} mb={2}>
                        SIMASTER
                      </Text>
                      <Text size="xs" fw={500} ff="monospace" c="dimmed">
                        {data?.unor_simaster || "-"}
                      </Text>
                    </div>
                    <div>
                      <Text size="10px" c="cyan" fw={600} mb={2}>
                        SIASN
                      </Text>
                      <Text size="xs" fw={500} ff="monospace" c="dimmed">
                        {data?.unor_siasn || "-"}
                      </Text>
                    </div>
                    <div>
                      <Text size="10px" c="cyan" fw={600} mb={2}>
                        Unit Organisasi Perjanjian Kerja
                      </Text>
                      <Text size="xs" fw={500} ff="monospace" c="dimmed">
                        {data?.unor_pk_text || "-"}
                      </Text>
                    </div>
                  </Stack>
                </Collapse>
              </div>

              <Divider size="xs" />

              <Group spacing="xs" position="apart">
                <Group spacing="xs">
                  <IconBriefcase
                    size={14}
                    stroke={1.5}
                    style={{ color: "#868e96" }}
                  />
                  <Text size="xs" c="dimmed" fw={500}>
                    Jabatan
                  </Text>
                </Group>
                <Text size="xs" fw={500}>
                  {data?.detail?.usulan_data?.data
                    ?.jabatan_fungsional_umum_nama ||
                    data?.detail?.usulan_data?.data?.jabatan_fungsional_nama ||
                    "-"}
                </Text>
              </Group>

              <Group spacing="xs" position="apart">
                <Group spacing="xs">
                  <IconSchool
                    size={14}
                    stroke={1.5}
                    style={{ color: "#868e96" }}
                  />
                  <Text size="xs" c="dimmed" fw={500}>
                    Pendidikan
                  </Text>
                </Group>
                <Text size="xs" fw={500}>
                  {data?.detail?.usulan_data?.data?.pendidikan_pertama_nama ||
                    "-"}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Form */}
          <Stack spacing="sm">
            {/* Toggle Luar Perangkat Daerah */}
            <Paper p="sm" radius="md" withBorder>
              <Group position="apart">
                <Group spacing="xs">
                  <IconBuilding size={14} stroke={1.5} />
                  <Text size="xs" fw={500}>
                    Luar Perangkat Daerah
                  </Text>
                </Group>
                <MantineSwitch
                  size="sm"
                  checked={luarPerangkatDaerah}
                  onChange={(event) => {
                    setLuarPerangkatDaerah(event.currentTarget.checked);
                    setUnorId("");
                    setErrors({ ...errors, unorId: null });
                  }}
                  color="#FF4500"
                />
              </Group>
            </Paper>

            {/* Toggle BLUD */}
            <Paper p="sm" radius="md" withBorder>
              <Group position="apart">
                <Group spacing="xs">
                  <IconBuildingHospital size={14} stroke={1.5} />
                  <div>
                    <Text size="xs" fw={500}>
                      BLUD (Upah dapat Rp 0)
                    </Text>
                    <Text size="10px" c="dimmed" style={{ marginTop: 2 }}>
                      Aktifkan jika pegawai BLUD dengan upah 0
                    </Text>
                  </div>
                </Group>
                <MantineSwitch
                  size="sm"
                  checked={isBLUD}
                  onChange={(event) => {
                    setIsBLUD(event.currentTarget.checked);
                    setErrors({ ...errors, upah: null });
                  }}
                  color="#FF4500"
                />
              </Group>
            </Paper>

            {/* Unit Organisasi */}
            <div>
              <Group spacing={4} mb={6}>
                <IconMapPin size={14} stroke={1.5} />
                <Text size="xs" fw={500}>
                  Unit Organisasi Perjanjian Kerja
                </Text>
              </Group>
              <TreeSelect
                style={{ width: "100%" }}
                treeNodeFilterProp="label"
                showSearch
                treeData={luarPerangkatDaerah ? unorFull : unor}
                placeholder="Pilih unit organisasi"
                allowClear
                value={unorId}
                onChange={(value) => {
                  setUnorId(value);
                  setErrors({ ...errors, unorId: null });
                }}
                loading={
                  luarPerangkatDaerah ? isLoadingUnorFull : isLoadingUnor
                }
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                status={errors.unorId ? "error" : ""}
              />
              {errors.unorId && (
                <Text size="xs" c="red" mt={4}>
                  {errors.unorId}
                </Text>
              )}
            </div>

            {/* Upah */}
            <div>
              <Group spacing={4} mb={6}>
                <IconCash size={14} stroke={1.5} />
                <Text size="xs" fw={500}>
                  Upah Pokok
                </Text>
              </Group>
              <Input
                value={upah ? `Rp ${formatRupiah(upah)}` : ""}
                onChange={handleUpahChange}
                placeholder={
                  isBLUD
                    ? "BLUD aktif - Upah dapat Rp 0"
                    : "Masukkan upah pokok"
                }
                status={errors.upah ? "error" : ""}
                style={{ width: "100%" }}
              />
              {isBLUD && !errors.upah && (
                <Text size="xs" c="blue" mt={4}>
                  ℹ️ Mode BLUD aktif - Upah dapat diisi Rp 0
                </Text>
              )}
              {errors.upah && (
                <Text size="xs" c="red" mt={4}>
                  {errors.upah}
                </Text>
              )}
            </div>
          </Stack>

          <Divider size="xs" />

          {/* Actions */}
          <Group position="right" spacing="xs">
            <Button onClick={onClose}>Batal</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isUpdating}
              disabled={isUpdating}
            >
              Simpan Data
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
};

export default ModalDetailParuhWaktu;
