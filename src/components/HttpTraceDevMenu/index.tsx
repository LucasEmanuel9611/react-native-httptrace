import React from "react";
import { HttpTraceModal } from "../HttpTraceModal";
import { useHttpTraceDevMenu } from "./useHttpTraceDevMenu";

interface HttpTraceDevMenuProps {
  enabled?: boolean;
  title?: string;
}

export function HttpTraceDevMenu({
  enabled = true,
  title = "HTTP Trace",
}: HttpTraceDevMenuProps) {
  const {
    modalVisible,
    closeModal,
    title: modalTitle,
  } = useHttpTraceDevMenu({
    title,
    enabled,
  });

  if (!enabled) return null;

  return (
    <HttpTraceModal
      visible={modalVisible}
      onClose={closeModal}
      title={modalTitle}
      showCloseButton={true}
    />
  );
}
