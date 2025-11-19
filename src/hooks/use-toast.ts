import { toast as sonnerToast } from "sonner"

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description?: string; variant?: "default" | "destructive" }) => {
      if (variant === "destructive") {
        sonnerToast.error(title, { description ,style: {
            background: "#dc2626",   
            color: "white",
            border: "1px solid #b91c1c",
          },})
      } else {
        sonnerToast.success(title, { description,style :{
          background: "#16a34a",
          color: "white",
          border: "1px solid #15803d",
        } })
      }
    }
  }
}
