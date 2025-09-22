"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Edit2 } from "lucide-react";
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

interface RenameModalProps {
  currentName: string;
  itemType: "folder" | "file";
  onRename: (newName: string) => Promise<void>;
  onClose: () => void;
  existingNames: string[];
}

// Zod schema for rename validation
const renameSchema = z.object({
  newName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_().]+$/, "Name contains invalid characters")
    .transform((val) => val.trim()),
});

type RenameFormData = z.infer<typeof renameSchema>;

export function RenameModal({
  currentName,
  itemType,
  onRename,
  onClose,
  existingNames,
}: RenameModalProps) {
  const form = useForm<RenameFormData>({
    resolver: zodResolver(
      renameSchema
        .refine((data) => data.newName !== currentName, {
          message: "New name must be different from current name",
          path: ["newName"],
        })
        .refine((data) => !existingNames.includes(data.newName), {
          message: `A ${itemType} with this name already exists`,
          path: ["newName"],
        })
    ),
    defaultValues: {
      newName: currentName,
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Update form value when currentName changes
  useEffect(() => {
    setValue("newName", currentName);
  }, [currentName, setValue]);

  const onSubmit = async (data: RenameFormData) => {
    try {
      await onRename(data.newName);
      toast.success(
        `${itemType === "folder" ? "Folder" : "File"} renamed successfully`,
        {
          description: `"${currentName}" has been renamed to "${data.newName}".`,
        }
      );
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : `Failed to rename ${itemType}`;
      toast.error(`Failed to rename ${itemType}`, {
        description: errorMessage,
      });
      form.setError("newName", {
        message: `Failed to rename ${itemType}. Please try again.`,
      });
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={`Rename ${itemType === "folder" ? "Folder" : "File"}`}
      icon={<Edit2 size={20} className="text-blue-600" />}
      closeButtonDisabled={isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="newName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  {itemType === "folder" ? "Folder" : "File"} Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder={`Enter ${itemType} name`}
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
              {isSubmitting ? "Renaming..." : "Rename"}
            </Button>
          </div>
        </form>
      </Form>
    </BaseModal>
  );
}
