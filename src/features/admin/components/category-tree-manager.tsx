"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoryTree } from "@/features/categories/hooks";
import type { Category } from "@/types/category";
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from "../hooks";

interface CategoryFormState {
  mode: "create" | "edit";
  parentId?: string;
  category?: Category;
}

function CategoryRow({
  category,
  depth,
  onAddChild,
  onEdit,
  onDelete,
}: {
  category: Category;
  depth: number;
  onAddChild: (parentId: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  return (
    <div>
      <div
        className="flex items-center justify-between gap-2 border-b py-2"
        style={{ paddingLeft: depth * 20 }}
      >
        <span className="text-sm text-foreground">{category.name}</span>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label="Add subcategory"
            onClick={() => onAddChild(category.id)}
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label="Edit category"
            onClick={() => onEdit(category)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            aria-label="Delete category"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </div>
      {category.children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          depth={depth + 1}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function CategoryTreeManager() {
  const treeQuery = useCategoryTree();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formState, setFormState] = useState<CategoryFormState | null>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  function openCreate(parentId?: string) {
    setFormState({ mode: "create", parentId });
    setName("");
    setImageUrl("");
  }

  function openEdit(category: Category) {
    setFormState({ mode: "edit", category });
    setName(category.name);
    setImageUrl(category.imageUrl ?? "");
  }

  function handleSubmit() {
    if (!formState) return;
    if (formState.mode === "create") {
      createCategory.mutate(
        { name, imageUrl: imageUrl || undefined, parentId: formState.parentId },
        { onSuccess: () => setFormState(null) }
      );
    } else if (formState.category) {
      updateCategory.mutate(
        { id: formState.category.id, payload: { name, imageUrl: imageUrl || undefined } },
        { onSuccess: () => setFormState(null) }
      );
    }
  }

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage the category hierarchy shown across the storefront.
        </p>
        <Button size="sm" className="gap-1" onClick={() => openCreate()}>
          <Plus className="size-3.5" /> Add top-level category
        </Button>
      </div>

      {treeQuery.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="rounded-md border p-2">
          {(treeQuery.data ?? []).map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              depth={0}
              onAddChild={openCreate}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
          {(treeQuery.data ?? []).length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">No categories yet.</p>
          )}
        </div>
      )}

      <Dialog open={!!formState} onOpenChange={(open) => !open && setFormState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formState?.mode === "create" ? "New category" : "Edit category"}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="cat-name">Name</FieldLabel>
              <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="cat-image">Image URL (optional)</FieldLabel>
              <Input
                id="cat-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormState(null)}>
              Cancel
            </Button>
            <Button disabled={!name.trim() || isPending} onClick={handleSubmit}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This fails if the category still has subcategories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteCategory.mutate(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
