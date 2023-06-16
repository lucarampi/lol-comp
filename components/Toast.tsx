import { Button, useToast } from "@chakra-ui/react";

interface ToastProps {
  action: string;
  id: string;
  message: string;
}

export default function Toast({ action, id, message }: ToastProps) {
  const toast = useToast();
  const toastId = `${action}-${id}`;
  return (
    !toast.isActive(toastId) &&
    toast({
      id,
      title: message
    })
  );
}
