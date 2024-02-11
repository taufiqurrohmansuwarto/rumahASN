import {
  getPermissions,
  getRolePermissions,
  getRoles,
  updateRolePermission,
} from "@/services/managements.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Checkbox, Form, Select, message, Tooltip, Table } from "antd";
import React, { useEffect } from "react";

const UserTable = ({ users }) => {
  const columns = [
    {
      title: "Name",
      dataIndex: "username",
    },
    {
      title: "NIP",
      dataIndex: "employee_number",
    },
    {
      title: "Perangkat Daerah",
      key: "perangkat_daerah",
      render: (text, record) => (
        <span>{record?.info?.perangkat_daerah?.detail}</span>
      ),
    },
  ];
  return (
    <Table
      columns={columns}
      pagination={false}
      dataSource={users}
      rowKey={(row) => row?.custom_id}
    />
  );
};

function RolesPermissions() {
  const [role, setRole] = React.useState(null);
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateRolePermission(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah role");
      },
      onError: () => {
        message.error("Gagal mengubah role");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["roles-permissions", "roles"]);
      },
    }
  );

  const { data: roles, isLoading } = useQuery(["roles"], () => getRoles(), {});
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery(
    ["permissions"],
    () => getPermissions(role),
    {}
  );

  const { data: rolePermissions, isLoading: isLoadingRolePermissions } =
    useQuery(["roles-permissions", role], () => getRolePermissions(role), {
      enabled: !!role,
    });

  const handleChange = async (value) => {
    setRole(value);
  };

  useEffect(() => {
    if (rolePermissions) {
      form.setFieldsValue({
        permissions: rolePermissions?.permission_value,
      });
    }
  }, [rolePermissions, role, permissions, form]);

  const handleSubmit = async () => {
    try {
      const data = await form.validateFields();
      const payload = {
        id: role,
        data,
      };
      update(payload);
    } catch (error) {
      message.error("Gagal mengubah role");
    }
  };

  return (
    <>
      <Select
        style={{
          width: "100%",
          marginBottom: "20px",
        }}
        onChange={handleChange}
        showSearch
        optionFilterProp="name"
        placeholder="Select a role"
        allowClear
      >
        {roles?.map((role) => (
          <Select.Option name={role?.name} key={role.id} value={role.id}>
            {role.name}
          </Select.Option>
        ))}
      </Select>
      <>
        {rolePermissions && role && (
          <>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item name="permissions" label="Permissions">
                <Checkbox.Group>
                  {permissions?.map((permission) => (
                    <Tooltip
                      key={permission?.id}
                      title={permission?.description}
                    >
                      <Checkbox value={permission?.id}>
                        {permission?.name} - {permission?.resource}
                      </Checkbox>
                    </Tooltip>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  Submit
                </Button>
              </Form.Item>
            </Form>
            <UserTable users={rolePermissions?.users} />
          </>
        )}
      </>
    </>
  );
}

export default RolesPermissions;
