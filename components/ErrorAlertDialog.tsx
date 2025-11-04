import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ErrorAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  title?: string;
}

export function ErrorAlertDialog({
  open,
  onOpenChange,
  message,
  title = "An error occurred",
}: ErrorAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-700 dark:text-red-400">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-600 dark:text-red-300">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
