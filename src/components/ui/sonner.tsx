
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:bg-green-100 group-[.toast]:text-green-900 group-[.toast]:border-green-200",
          error: "group-[.toast]:bg-red-100 group-[.toast]:text-red-900 group-[.toast]:border-red-200",
          warning: "group-[.toast]:bg-yellow-100 group-[.toast]:text-yellow-900 group-[.toast]:border-yellow-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
