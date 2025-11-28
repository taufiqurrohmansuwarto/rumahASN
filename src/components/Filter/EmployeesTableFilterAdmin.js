import {
  getOpdAdmin,
  refAgamaSimaster,
  refJenjangSimaster,
  refKedudukanHukumSimaster,
  refPangkatSimaster,
  refStatusKawinSimaster,
  refStatusKepegawaianSimaster,
} from "@/services/master.services";
import { Badge, Flex, Paper, Stack, Text } from "@mantine/core";
import {
  IconBuilding,
  IconCalendarUser,
  IconChevronDown,
  IconChevronUp,
  IconFilterOff,
  IconGenderMale,
  IconHourglass,
  IconMoodCheck,
  IconPray,
  IconRings,
  IconSchool,
  IconSearch,
  IconShieldCheck,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Tooltip,
  TreeSelect,
} from "antd";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

function EmployeesTableFilterAdmin() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Queries untuk data referensi
  const { data: unor, isLoading: isLoadingUnor } = useQuery(
    ["unor-admin"],
    () => getOpdAdmin(),
    { refetchOnWindowFocus: false }
  );

  const { data: kedudukanHukum, isLoading: isLoadingKedudukan } = useQuery(
    ["ref-kedudukan-hukum"],
    () => refKedudukanHukumSimaster(),
    { refetchOnWindowFocus: false }
  );

  const { data: pangkat, isLoading: isLoadingPangkat } = useQuery(
    ["ref-pangkat"],
    () => refPangkatSimaster(),
    { refetchOnWindowFocus: false }
  );

  const { data: jenjang, isLoading: isLoadingJenjang } = useQuery(
    ["ref-jenjang"],
    () => refJenjangSimaster(),
    { refetchOnWindowFocus: false }
  );

  const { data: agama, isLoading: isLoadingAgama } = useQuery(
    ["ref-agama"],
    () => refAgamaSimaster(),
    { refetchOnWindowFocus: false }
  );

  const { data: statusKawin, isLoading: isLoadingStatusKawin } = useQuery(
    ["ref-status-kawin"],
    () => refStatusKawinSimaster(),
    { refetchOnWindowFocus: false }
  );

  const { data: statusKepegawaian, isLoading: isLoadingStatusKepegawaian } =
    useQuery(["ref-status-kepegawaian"], () => refStatusKepegawaianSimaster(), {
      refetchOnWindowFocus: false,
    });

  // Options statis
  const jenisKelaminOptions = [
    { value: "L", label: "Laki-laki" },
    { value: "P", label: "Perempuan" },
  ];

  const statusAktifOptions = [
    { value: "Y", label: "Aktif" },
    { value: "N", label: "Tidak Aktif" },
  ];

  const updateQueryParams = useCallback(
    (values) => {
      const query = { page: 1 };
      if (values.search?.trim()) query.search = values.search.trim();
      if (values.opd_id) query.opd_id = values.opd_id;
      if (values.kedudukan_id) query.kedudukan_id = values.kedudukan_id;
      // Pangkat (exact atau range)
      if (values.pangkat_id) query.pangkat_id = values.pangkat_id;
      if (values.pangkat_id_min) query.pangkat_id_min = values.pangkat_id_min;
      if (values.pangkat_id_max) query.pangkat_id_max = values.pangkat_id_max;
      // Jenjang (exact atau range)
      if (values.jenjang_id) query.jenjang_id = values.jenjang_id;
      if (values.jenjang_id_min) query.jenjang_id_min = values.jenjang_id_min;
      if (values.jenjang_id_max) query.jenjang_id_max = values.jenjang_id_max;
      // BUP range
      if (values.bup_min) query.bup_min = values.bup_min;
      if (values.bup_max) query.bup_max = values.bup_max;
      if (values.agama_id) query.agama_id = values.agama_id;
      if (values.status_kawin_id)
        query.status_kawin_id = values.status_kawin_id;
      if (values.jenis_kelamin) query.jenis_kelamin = values.jenis_kelamin;
      if (values.status_aktif) query.status_aktif = values.status_aktif;
      if (values.status_kepegawaian)
        query.status_kepegawaian = values.status_kepegawaian;
      if (values.usia_min) query.usia_min = values.usia_min;
      if (values.usia_max) query.usia_max = values.usia_max;
      router.push({ pathname: router.pathname, query });
    },
    [router]
  );

  const debouncedSearch = useMemo(
    () => debounce((values) => updateQueryParams(values), 500),
    [updateQueryParams]
  );

  const handleValuesChange = useCallback(
    (changedValues, allValues) => {
      if (changedValues.hasOwnProperty("search")) {
        debouncedSearch(allValues);
      } else {
        updateQueryParams(allValues);
      }
    },
    [debouncedSearch, updateQueryParams]
  );

  const handleReset = () => {
    form.resetFields();
    router.push({ pathname: router.pathname, query: { page: 1 } });
  };

  useEffect(() => {
    const q = router.query;
    form.setFieldsValue({
      search: q.search || "",
      opd_id: q.opd_id || undefined,
      kedudukan_id: q.kedudukan_id ? Number(q.kedudukan_id) : undefined,
      pangkat_id: q.pangkat_id ? Number(q.pangkat_id) : undefined,
      pangkat_id_min: q.pangkat_id_min ? Number(q.pangkat_id_min) : undefined,
      pangkat_id_max: q.pangkat_id_max ? Number(q.pangkat_id_max) : undefined,
      jenjang_id: q.jenjang_id ? Number(q.jenjang_id) : undefined,
      jenjang_id_min: q.jenjang_id_min ? Number(q.jenjang_id_min) : undefined,
      jenjang_id_max: q.jenjang_id_max ? Number(q.jenjang_id_max) : undefined,
      bup_min: q.bup_min ? Number(q.bup_min) : undefined,
      bup_max: q.bup_max ? Number(q.bup_max) : undefined,
      agama_id: q.agama_id ? Number(q.agama_id) : undefined,
      status_kawin_id: q.status_kawin_id
        ? Number(q.status_kawin_id)
        : undefined,
      jenis_kelamin: q.jenis_kelamin || undefined,
      status_aktif: q.status_aktif || undefined,
      status_kepegawaian: q.status_kepegawaian
        ? Number(q.status_kepegawaian)
        : undefined,
      usia_min: q.usia_min ? Number(q.usia_min) : undefined,
      usia_max: q.usia_max ? Number(q.usia_max) : undefined,
    });

    const hasAdvancedFilter =
      q.kedudukan_id ||
      q.pangkat_id ||
      q.pangkat_id_min ||
      q.pangkat_id_max ||
      q.jenjang_id ||
      q.jenjang_id_min ||
      q.jenjang_id_max ||
      q.bup_min ||
      q.bup_max ||
      q.agama_id ||
      q.status_kawin_id ||
      q.usia_min ||
      q.usia_max ||
      q.status_kepegawaian;
    if (hasAdvancedFilter) setShowAdvanced(true);
  }, [router.query, form]);

  const countActiveFilters = () => {
    const q = router.query;
    let count = 0;
    if (q.search) count++;
    if (q.opd_id) count++;
    if (q.kedudukan_id) count++;
    if (q.pangkat_id || q.pangkat_id_min || q.pangkat_id_max) count++;
    if (q.jenjang_id || q.jenjang_id_min || q.jenjang_id_max) count++;
    if (q.bup_min || q.bup_max) count++;
    if (q.agama_id) count++;
    if (q.status_kawin_id) count++;
    if (q.jenis_kelamin) count++;
    if (q.status_aktif) count++;
    if (q.status_kepegawaian) count++;
    if (q.usia_min || q.usia_max) count++;
    return count;
  };

  const activeFilters = countActiveFilters();
  const formItemStyle = { marginBottom: 0 };

  return (
    <Stack gap={12}>
      <Form form={form} onValuesChange={handleValuesChange}>
        <Flex gap={12} align="flex-end" wrap="wrap">
          {/* Search */}
          <Form.Item name="search" style={formItemStyle}>
            <Input
              prefix={<IconSearch size={16} color="#868e96" />}
              placeholder="NIP / Nama"
              allowClear
              style={{ width: 350 }}
            />
          </Form.Item>

          {/* OPD */}
          <Form.Item name="opd_id" style={formItemStyle}>
            <TreeSelect
              suffixIcon={<IconBuilding size={16} color="#868e96" />}
              treeNodeFilterProp="label"
              showSearch
              treeData={unor}
              placeholder="Perangkat Daerah"
              loading={isLoadingUnor}
              allowClear
              style={{ width: 400 }}
            />
          </Form.Item>

          {/* Jenis Kelamin */}
          <Form.Item name="jenis_kelamin" style={formItemStyle}>
            <Select
              suffixIcon={<IconGenderMale size={16} color="#868e96" />}
              placeholder="Jenis Kelamin"
              options={jenisKelaminOptions}
              allowClear
              style={{ width: 140 }}
            />
          </Form.Item>

          {/* Status Aktif */}
          <Form.Item name="status_aktif" style={formItemStyle}>
            <Select
              suffixIcon={<IconUserCheck size={16} color="#868e96" />}
              placeholder="Status"
              options={statusAktifOptions}
              allowClear
              style={{ width: 120 }}
            />
          </Form.Item>

          {/* Tombol Filter Lanjutan */}
          <Tooltip
            title={showAdvanced ? "Sembunyikan Filter" : "Filter Lanjutan"}
          >
            <Button
              icon={
                showAdvanced ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )
              }
              onClick={() => setShowAdvanced(!showAdvanced)}
              type={showAdvanced ? "primary" : "default"}
            >
              {activeFilters > 0 && (
                <Badge size="xs" color="red" circle ml={4}>
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </Tooltip>

          {/* Tombol Reset */}
          {activeFilters > 0 && (
            <Tooltip title={`Reset ${activeFilters} Filter`}>
              <Button
                icon={<IconFilterOff size={16} />}
                onClick={handleReset}
                danger
              />
            </Tooltip>
          )}
        </Flex>

        {/* Filter Lanjutan */}
        {showAdvanced && (
          <Paper
            p="sm"
            mt={10}
            radius="md"
            style={{
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              border: "1px solid #dee2e6",
            }}
          >
            <Flex gap={10} wrap="wrap">
              {/* Section: Status */}
              <Paper
                p="xs"
                radius="sm"
                withBorder
                style={{ background: "#fff" }}
              >
                <Text size={10} fw={600} c="blue.6" mb={6}>
                  <IconUsers
                    size={12}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  STATUS
                </Text>
                <Flex gap={6}>
                  <Form.Item name="status_kepegawaian" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Kepegawaian"
                      loading={isLoadingStatusKepegawaian}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={statusKepegawaian?.map((item) => ({
                        value: item.status_kep_id,
                        label: item.status_kep,
                      }))}
                      style={{ width: 130 }}
                    />
                  </Form.Item>
                  <Form.Item name="kedudukan_id" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Kedudukan"
                      loading={isLoadingKedudukan}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={kedudukanHukum?.map((item) => ({
                        value: item.kedudukan_id,
                        label: item.kedudukan_hukum,
                      }))}
                      style={{ width: 140 }}
                    />
                  </Form.Item>
                </Flex>
              </Paper>

              {/* Section: Golongan */}
              <Paper
                p="xs"
                radius="sm"
                withBorder
                style={{ background: "#fff" }}
              >
                <Text size={10} fw={600} c="teal.6" mb={6}>
                  <IconMoodCheck
                    size={12}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  GOLONGAN
                </Text>
                <Flex gap={6} align="center">
                  <Form.Item name="pangkat_id" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Exact"
                      loading={isLoadingPangkat}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={pangkat?.map((item) => ({
                        value: item.pangkat_id,
                        label: `${item.gol_ruang} - ${item.pangkat}`,
                      }))}
                      style={{ width: 160 }}
                    />
                  </Form.Item>
                  <Text size={10} c="dimmed">
                    atau
                  </Text>
                  <Form.Item name="pangkat_id_min" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Min"
                      loading={isLoadingPangkat}
                      allowClear
                      options={pangkat?.map((item) => ({
                        value: item.pangkat_id,
                        label: item.gol_ruang,
                      }))}
                      style={{ width: 70 }}
                    />
                  </Form.Item>
                  <Text size="xs" c="dimmed">
                    —
                  </Text>
                  <Form.Item name="pangkat_id_max" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Max"
                      loading={isLoadingPangkat}
                      allowClear
                      options={pangkat?.map((item) => ({
                        value: item.pangkat_id,
                        label: item.gol_ruang,
                      }))}
                      style={{ width: 70 }}
                    />
                  </Form.Item>
                </Flex>
              </Paper>

              {/* Section: Pendidikan */}
              <Paper
                p="xs"
                radius="sm"
                withBorder
                style={{ background: "#fff" }}
              >
                <Text size={10} fw={600} c="violet.6" mb={6}>
                  <IconSchool
                    size={12}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  PENDIDIKAN
                </Text>
                <Flex gap={6} align="center">
                  <Form.Item name="jenjang_id" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Exact"
                      loading={isLoadingJenjang}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={jenjang?.map((item) => ({
                        value: item.jenjang_id,
                        label: item.jenjang_pendidikan,
                      }))}
                      style={{ width: 90 }}
                    />
                  </Form.Item>
                  <Text size={10} c="dimmed">
                    atau
                  </Text>
                  <Form.Item name="jenjang_id_min" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Min"
                      loading={isLoadingJenjang}
                      allowClear
                      options={jenjang?.map((item) => ({
                        value: item.jenjang_id,
                        label: item.jenjang_pendidikan,
                      }))}
                      style={{ width: 70 }}
                    />
                  </Form.Item>
                  <Text size="xs" c="dimmed">
                    —
                  </Text>
                  <Form.Item name="jenjang_id_max" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Max"
                      loading={isLoadingJenjang}
                      allowClear
                      options={jenjang?.map((item) => ({
                        value: item.jenjang_id,
                        label: item.jenjang_pendidikan,
                      }))}
                      style={{ width: 70 }}
                    />
                  </Form.Item>
                </Flex>
              </Paper>

              {/* Section: Pribadi */}
              <Paper
                p="xs"
                radius="sm"
                withBorder
                style={{ background: "#fff" }}
              >
                <Text size={10} fw={600} c="orange.6" mb={6}>
                  <IconPray
                    size={12}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  PRIBADI
                </Text>
                <Flex gap={6}>
                  <Form.Item name="agama_id" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Agama"
                      loading={isLoadingAgama}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={agama?.map((item) => ({
                        value: item.agama_id,
                        label: item.agama,
                      }))}
                      style={{ width: 100 }}
                    />
                  </Form.Item>
                  <Form.Item name="status_kawin_id" style={formItemStyle}>
                    <Select
                      size="small"
                      placeholder="Perkawinan"
                      loading={isLoadingStatusKawin}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={statusKawin?.map((item) => ({
                        value: item.status_kawin_id,
                        label: item.status_kawin,
                      }))}
                      style={{ width: 110 }}
                    />
                  </Form.Item>
                </Flex>
              </Paper>

              {/* Section: Usia */}
              <Paper
                p="xs"
                radius="sm"
                withBorder
                style={{ background: "#fff" }}
              >
                <Text size={10} fw={600} c="cyan.6" mb={6}>
                  <IconCalendarUser
                    size={12}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  USIA
                </Text>
                <Flex gap={6} align="center">
                  <Form.Item name="usia_min" style={formItemStyle}>
                    <InputNumber
                      size="small"
                      placeholder="Min"
                      min={18}
                      max={70}
                      style={{ width: 60 }}
                    />
                  </Form.Item>
                  <Text size="xs" c="dimmed">
                    —
                  </Text>
                  <Form.Item name="usia_max" style={formItemStyle}>
                    <InputNumber
                      size="small"
                      placeholder="Max"
                      min={18}
                      max={70}
                      style={{ width: 60 }}
                    />
                  </Form.Item>
                  <Text size={10} c="dimmed">
                    thn
                  </Text>
                </Flex>
              </Paper>

              {/* Section: BUP */}
              <Paper
                p="xs"
                radius="sm"
                withBorder
                style={{ background: "#fff" }}
              >
                <Text size={10} fw={600} c="red.6" mb={6}>
                  <IconHourglass
                    size={12}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  BUP
                </Text>
                <Flex gap={6} align="center">
                  <Form.Item name="bup_min" style={formItemStyle}>
                    <InputNumber
                      size="small"
                      placeholder="Min"
                      min={50}
                      max={70}
                      style={{ width: 60 }}
                    />
                  </Form.Item>
                  <Text size="xs" c="dimmed">
                    —
                  </Text>
                  <Form.Item name="bup_max" style={formItemStyle}>
                    <InputNumber
                      size="small"
                      placeholder="Max"
                      min={50}
                      max={70}
                      style={{ width: 60 }}
                    />
                  </Form.Item>
                  <Text size={10} c="dimmed">
                    thn
                  </Text>
                </Flex>
              </Paper>
            </Flex>
          </Paper>
        )}
      </Form>
    </Stack>
  );
}

export default EmployeesTableFilterAdmin;
