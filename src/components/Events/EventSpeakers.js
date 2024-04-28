import { eventSpeakers } from "@/services/events.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

const FormModalEventSpeaker = ({ open, handleClose, eventId }) => {
  return <div>FormModalEventSpeaker</div>;
};

function EventSpeakers() {
  const router = useRouter();
  const { eventId } = router.query;

  const [openCreateModal, setOpenCreateModal] = React.useState(false);
  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => setOpenCreateModal(false);

  //   edit
  const [openEditModal, setOpenEditModal] = React.useState(false);
  const [currentEdit, setCurrentEdit] = React.useState(null);

  const handleOpenEditModal = (data) => {
    setCurrentEdit(data);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setCurrentEdit(null);
    setOpenEditModal(false);
  };

  const { data, isLoading } = useQuery(
    ["event-speakers", eventId],
    () => eventSpeakers(eventId),
    {
      enabled: !!eventId,
    }
  );
  return <div>{JSON.stringify(data)}</div>;
}

export default EventSpeakers;
