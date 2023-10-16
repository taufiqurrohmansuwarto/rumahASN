import { changeStatus } from "@/services/index";
import {
  CheckIcon,
  IssueClosedIcon,
  IssueTrackedByIcon,
} from "@primer/octicons-react";
import { ActionList, ActionMenu, Button, ButtonGroup } from "@primer/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

function ButtonStatus({ currentStatus = "DIKERJAKAN" }) {
  const router = useRouter();
  const { id: ticketId } = router?.query;

  const [status, setStatus] = useState(currentStatus);
  const changeStatusDikerjakan = () => setStatus("DIKERJAKAN");
  const changeStatusDiselesaikan = () => setStatus("SELESAI");

  const { data: userData } = useSession();

  const queryClient = useQueryClient();

  const { mutate: updateStatus, isLoading } = useMutation(
    (data) => changeStatus(data),
    {
      onSuccess: () => {
        message.success("Berhasil merubah status");
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
      },
      onError: () => {
        message.error("Gagal merubah status");
      },
    }
  );

  const handleChangeStatus = () => {
    const data = {
      id: ticketId,
      data: {
        status,
      },
    };
    updateStatus(data);
  };

  return (
    <>
      {(userData?.user?.current_role === "admin" ||
        userData?.user?.current_role === "agent") && (
        <ButtonGroup>
          <Button
            onClick={handleChangeStatus}
            disabled={isLoading}
            leadingIcon={
              status === "DIKERJAKAN" ? IssueTrackedByIcon : IssueClosedIcon
            }
          >
            Pertanyaan {status === "DIKERJAKAN" ? "Dikerjakan" : "Selesai"}
          </Button>
          <ActionMenu>
            <ActionMenu.Button></ActionMenu.Button>

            <ActionMenu.Overlay
              sx={{
                width: 400,
              }}
            >
              <ActionList>
                <ActionList.Item onSelect={changeStatusDikerjakan}>
                  <ActionList.LeadingVisual>
                    <IssueTrackedByIcon />
                  </ActionList.LeadingVisual>
                  Pertanyaan Dikerjakan
                  <ActionList.Description variant="block">
                    Biar Customer ngga marah-marah mending klik ini saja
                  </ActionList.Description>
                  {status === "DIKERJAKAN" && (
                    <ActionList.TrailingVisual>
                      <CheckIcon />
                    </ActionList.TrailingVisual>
                  )}
                </ActionList.Item>
                <ActionList.Item onSelect={changeStatusDiselesaikan}>
                  <ActionList.LeadingVisual>
                    <IssueClosedIcon />
                  </ActionList.LeadingVisual>
                  Pertanyaan Selesai
                  <ActionList.Description variant="block">
                    Kalau perkara sudah selesai jangan lupa klik ini
                  </ActionList.Description>
                  {status === "SELESAI" && (
                    <ActionList.TrailingVisual>
                      <CheckIcon />
                    </ActionList.TrailingVisual>
                  )}
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </ButtonGroup>
      )}
    </>
  );
}

export default ButtonStatus;
