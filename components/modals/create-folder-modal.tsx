"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BaseModal } from "./base-modal";
import { toast } from "sonner";

interface CreateFolderModalProps {
  onCreateFolder: (name: string) => Promise<void>;
  onClose: () => void;
  existingNames: string[];
}

// Zod schema for folder name validation
const createFolderSchema = z.object({
  folderName: z
    .string()
    .min(1, "Folder name is required")
    .max(50, "Folder name must be 50 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_().]+$/, "Folder name contains invalid characters")
    .transform((val) => val.trim()),
});

type CreateFolderFormData = z.infer<typeof createFolderSchema>;

export function CreateFolderModal({
  onCreateFolder,
  onClose,
  existingNames,
}: CreateFolderModalProps) {
  const form = useForm<CreateFolderFormData>({
    resolver: zodResolver(
      createFolderSchema.refine(
        (data) => !existingNames.includes(data.folderName),
        {
          message: "A folder with this name already exists",
          path: ["folderName"],
        }
      )
    ),
    defaultValues: {
      folderName: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = async (data: CreateFolderFormData) => {
    try {
      await onCreateFolder(data.folderName);
      toast.success("Folder created successfully", {
        description: `"${data.folderName}" has been created in your data room.`,
      });
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create folder";
      toast.error("Failed to create folder", {
        description: errorMessage,
      });
      form.setError("folderName", {
        message: "Failed to create folder. Please try again.",
      });
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Create New Folder"
      icon={<FolderPlus size={20} className="text-blue-600" />}
      closeButtonDisabled={isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="folderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Folder Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter folder name"
                    disabled={isSubmitting}
                    autoFocus
                    className="mt-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </Form>
    </BaseModal>
  );
}
