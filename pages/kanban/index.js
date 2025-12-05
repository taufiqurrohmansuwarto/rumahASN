import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Input,
  Segmented,
  Row,
  Col,
  Empty,
  Spin,
  Space,
  Typography,
  Flex,
  Breadcrumb,
} from "antd";
import {
  IconPlus,
  IconSearch,
  IconLayoutKanban,
  IconFolder,
} from "@tabler/icons-react";
import Head from "next/head";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ProjectCard from "@/components/Kanban/ProjectCard";
import CreateProjectModal from "@/components/Kanban/CreateProjectModal";
import { getProjects } from "../../services/kanban.services";

const { Text, Title } = Typography;

function KanbanDashboard() {
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: projects, isLoading } = useQuery(
    ["kanban-projects", showArchived],
    () => getProjects({ archived: showArchived }),
    { keepPreviousData: true }
  );

  const filteredProjects = projects?.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Kanban Project</title>
      </Head>

      <PageContainer
        title="Kanban Project"
        subTitle="Kelola project dan tugas tim Anda"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>Kanban</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <div style={{ padding: "0 0 24px 0" }}>
          {/* Header Actions */}
          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={12}
            style={{ marginBottom: 24 }}
          >
            <Space size={12} wrap>
              <Input
                placeholder="Cari project..."
                allowClear
                style={{ width: 250 }}
                prefix={<IconSearch size={16} color="#bfbfbf" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Segmented
                value={showArchived ? "archived" : "active"}
                onChange={(v) => setShowArchived(v === "archived")}
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "archived", label: "Arsip" },
                ]}
              />
            </Space>
            <Button
              type="primary"
              icon={<IconPlus size={16} />}
              onClick={() => setCreateModalOpen(true)}
              style={{
                backgroundColor: "#fa541c",
                borderColor: "#fa541c",
              }}
            >
              Buat Project
            </Button>
          </Flex>

          {/* Projects Grid */}
          {isLoading ? (
            <Flex justify="center" align="center" style={{ minHeight: 300 }}>
              <Spin size="large" />
            </Flex>
          ) : filteredProjects?.length === 0 ? (
            <Flex
              vertical
              justify="center"
              align="center"
              style={{ minHeight: 300 }}
            >
              <Empty
                image={
                  <IconFolder
                    size={64}
                    color="#d9d9d9"
                    style={{ marginBottom: 8 }}
                  />
                }
                imageStyle={{ height: 80 }}
                description={
                  <Text type="secondary">
                    {search
                      ? "Tidak ada project yang cocok"
                      : showArchived
                      ? "Belum ada project yang diarsipkan"
                      : "Belum ada project"}
                  </Text>
                }
              >
                {!search && !showArchived && (
                  <Button
                    type="primary"
                    icon={<IconPlus size={16} />}
                    onClick={() => setCreateModalOpen(true)}
                    style={{
                      backgroundColor: "#fa541c",
                      borderColor: "#fa541c",
                    }}
                  >
                    Buat Project Pertama
                  </Button>
                )}
              </Empty>
            </Flex>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredProjects?.map((project) => (
                <Col key={project.id} xs={24} sm={12} md={8} lg={6}>
                  <ProjectCard project={project} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </PageContainer>

      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}

KanbanDashboard.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

KanbanDashboard.Auth = {
  action: "manage",
  subject: "tickets",
};

export default KanbanDashboard;
