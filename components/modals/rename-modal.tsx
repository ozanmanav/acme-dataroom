"use client";

import { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseModal } from "./base-modal";

interface RenameModalProps {
  currentName: string;
  itemType: "folder" | "file";
  onRename: (newName: string) => Promise<void>;
  onClose: () => void;
  existingNames: string[];
}

export function RenameModal({
  currentName,
  itemType,
  onRename,
  onClose,
  existingNames,
}: RenameModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    setNewName(currentName);
  }, [currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newName.trim();

    if (!trimmedName) {
      setError(`${itemType === "folder" ? "Folder" : "File"} name is required`);
      return;
    }

    if (trimmedName === currentName) {
      onClose();
      return;
    }

    if (trimmedName.length > 50) {
      setError(
        `${
          itemType === "folder" ? "Folder" : "File"
        } name must be 50 characters or less`
      );
      return;
    }

    if (!/^[a-zA-Z0-9\s\-_().]+$/.test(trimmedName)) {
      setError(
        `${
          itemType === "folder" ? "Folder" : "File"
        } name contains invalid characters`
      );
      return;
    }

    if (existingNames.includes(trimmedName)) {
      setError(`A ${itemType} with this name already exists`);
      return;
    }

    try {
      setIsRenaming(true);
      setError("");
      await onRename(trimmedName);
      onClose();
    } catch (error) {
      setError(`Failed to rename ${itemType}. Please try again.`);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewName(value);

    if (value.trim()) {
      if (error) {
        setError("");
      }
    }
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={`Rename ${itemType === "folder" ? "Folder" : "File"}`}
      icon={<Edit2 size={20} className="text-blue-600" />}
      closeButtonDisabled={isRenaming}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="itemName" className="text-sm font-medium text-gray-700">
            {itemType === "folder" ? "Folder" : "File"} Name
          </Label>
          <Input
            type="text"
            id="itemName"
            value={newName}
            onChange={handleInputChange}
            placeholder={`Enter ${itemType} name`}
            disabled={isRenaming}
            autoFocus
            className="mt-2"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isRenaming}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isRenaming || !newName.trim() || newName.trim() === currentName
            }
          >
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
