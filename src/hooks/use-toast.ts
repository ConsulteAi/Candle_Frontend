import { toast as sonnerToast, ExternalToast } from "sonner"

type ToastProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
  action?: React.ReactNode
} & ExternalToast

function toast({ title, description, variant, ...props }: ToastProps) {
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      ...props,
    })
  }

  return sonnerToast.success(title, {
    description,
    ...props,
  })
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  }
}

export { useToast, toast }
