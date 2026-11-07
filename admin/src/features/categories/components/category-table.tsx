"use client";

import { useTranslations } from "next-intl";
import { Edit } from "lucide-react";
import { Link } from "@opengenset/shared/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { EntityDeleteButton } from "@/components/common";
import { deleteCategoryAction } from "../actions/category.actions";
import type { AdminCategory } from "@/types/api";

interface CategoryTableProps {
  categories: AdminCategory[];
  allCategories?: AdminCategory[];
}

export function CategoryTable({
  categories,
  allCategories = [],
}: CategoryTableProps) {
  const t = useTranslations("adminCategories");
  const cardT = useTranslations("adminCategories.card");
  const tableT = useTranslations("adminCategoryTable");
  const formT = useTranslations("adminCategoryForm");

  const parentMap = new Map(allCategories.map((c) => [c.id, c.name]));

  if (categories.length === 0) {
    return (
      <Card className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-border/60 p-8 text-center shadow-xs">
        <p className="text-sm text-muted-foreground">{tableT("empty")}</p>
      </Card>
    );
  }

  return (
    <Card size="dense" className="overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-semibold">
              {tableT("columns.name")}
            </TableHead>
            <TableHead className="font-semibold">
              {tableT("columns.slug")}
            </TableHead>
            <TableHead className="font-semibold">
              {formT("fields.parentId")}
            </TableHead>
            <TableHead className="font-semibold">
              {formT("fields.description")}
            </TableHead>
            <TableHead className="text-center font-semibold">
              {tableT("columns.status")}
            </TableHead>
            <TableHead className="w-[100px] text-right font-semibold">
              {tableT("columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const parentName = category.parentId
              ? parentMap.get(category.parentId)
              : undefined;
            const status = category.isActive ? "active" : "inactive";

            return (
              <TableRow key={category.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-foreground">
                  <Link
                    href={`/categories/${category.id}/edit`}
                    className="hover:text-primary hover:underline"
                  >
                    {category.name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {category.slug}
                </TableCell>
                <TableCell>
                  {parentName ? (
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal text-muted-foreground"
                    >
                      ↳ {parentName}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/60">—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[280px] truncate text-xs text-muted-foreground">
                  {category.description ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={
                      category.isActive
                        ? "border-border text-xs text-foreground"
                        : "border-destructive/40 text-xs text-destructive"
                    }
                  >
                    {cardT(`status.${status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      title={cardT("actions.edit")}
                    >
                      <Link href={`/categories/${category.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <EntityDeleteButton
                      entityId={category.id}
                      onDelete={deleteCategoryAction}
                      dialogTitle={t("dialogs.delete.title")}
                      dialogDescription={t("dialogs.delete.description", {
                        categoryName: category.name,
                      })}
                      successMessage={t("messages.deleteSuccess")}
                      errorMessage={t("messages.deleteError")}
                      cancelLabel={t("dialogs.delete.cancel")}
                      confirmLabel={t("dialogs.delete.confirm")}
                      deletingLabel={t("dialogs.delete.deleting")}
                      buttonTooltip={cardT("actions.delete")}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
