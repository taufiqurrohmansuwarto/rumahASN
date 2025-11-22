import { getOpdFasilitator } from "@/services/master.services";
import { Group, Stack } from "@mantine/core";
import {
  IconBuilding,
  IconFilterOff,
  IconSearch,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Form, Input, TreeSelect } from "antd";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo } from "react";

function EmployeesTableFilter() {
  const router = useRouter();
  const [form] = Form.useForm();

  const { data: unor, isLoading: isLoadingUnor } = useQuery(
    ["unor-fasilitator"],
    () => getOpdFasilitator(),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((values) => {
        const query = { ...router.query, page: 1 };

        // Update or remove search param
        if (values.search && values.search.trim()) {
          query.search = values.search.trim();
        } else {
          delete query.search;
        }

        // Update or remove opd_id param
        if (values.opd_id) {
          query.opd_id = values.opd_id;
        } else {
          delete query.opd_id;
        }

        router.push({
          pathname: router.pathname,
          query,
        });
      }, 500),
    [router]
  );

  const handleValuesChange = useCallback(
    (changedValues, allValues) => {
      // Only debounce search field
      if (changedValues.hasOwnProperty("search")) {
        debouncedSearch(allValues);
      } else {
        // Immediate update for other fields
        const query = { ...router.query, page: 1 };

        if (allValues.opd_id) {
          query.opd_id = allValues.opd_id;
        } else {
          delete query.opd_id;
        }

        if (allValues.search && allValues.search.trim()) {
          query.search = allValues.search.trim();
        } else {
          delete query.search;
        }

        router.push({
          pathname: router.pathname,
          query,
        });
      }
    },
    [router, debouncedSearch]
  );

  const handleReset = () => {
    form.resetFields();
    router.push({
      pathname: router.pathname,
      query: {
        page: 1,
      },
    });
  };

  useEffect(() => {
    form.setFieldsValue({
      search: router?.query?.search || "",
      opd_id: router?.query?.opd_id || undefined,
    });
  }, [router.query, form]);

  const hasActiveFilters = router?.query?.search || router?.query?.opd_id;

  return (
    <Stack spacing="xs">
      <Form form={form} onValuesChange={handleValuesChange}>
        <Group grow align="flex-end" spacing="sm">
          <Form.Item name="search" label="NIP / Nama" style={{ marginBottom: 0 }}>
            <Input
              prefix={<IconSearch size={14} />}
              placeholder="Cari NIP atau nama..."
              allowClear
            />
          </Form.Item>
          <Form.Item name="opd_id" label="Perangkat Daerah" style={{ marginBottom: 0 }}>
            <TreeSelect
              suffixIcon={<IconBuilding size={14} />}
              treeNodeFilterProp="label"
              showSearch
              treeData={unor}
              placeholder="Pilih OPD"
              loading={isLoadingUnor}
              allowClear
            />
          </Form.Item>
          {hasActiveFilters && (
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                icon={<IconFilterOff size={14} />}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Form.Item>
          )}
        </Group>
      </Form>
    </Stack>
  );
}

export default EmployeesTableFilter;
