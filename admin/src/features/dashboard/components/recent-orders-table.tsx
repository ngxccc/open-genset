import { getTranslations } from "next-intl/server";
import { Filter, Download } from "lucide-react";
import { Link } from "@opengenset/shared/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { AdminOrder } from "@/types/api";

interface RecentOrdersTableProps {
  orders: AdminOrder[];
}
const orderDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const statusMap: Record<string, string> = {
  PENDING: "processing",
  PROCESSING: "processing",
  SHIPPED: "shipping",
  DELIVERED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "cancelled",
};
interface OrderStatusBadgeProps {
  label: string;
}

const OrderStatusBadge = ({ label }: OrderStatusBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className="rounded border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-none"
    >
      {label}
    </Badge>
  );
};

export async function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const t = await getTranslations("adminDashboard.recentOrders");
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-card px-4 py-3.5">
        <h3 className="text-base font-semibold text-foreground">
          {t("title")}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Filter className="mr-1.5 size-3.5" />
            {t("filter")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Download className="mr-1.5 size-3.5" />
            {t("export")}
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-30">{t("columns.orderId")}</TableHead>
            <TableHead>{t("columns.customer")}</TableHead>
            <TableHead>{t("columns.product")}</TableHead>
            <TableHead>{t("columns.date")}</TableHead>
            <TableHead className="text-right">{t("columns.total")}</TableHead>
            <TableHead className="text-center">{t("columns.status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-xs text-muted-foreground"
              >
                {t("noOrders")}
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => {
              const customerName =
                order.user?.fullName ?? order.customerName ?? "—";
              const items = order.items;
              let productText = "Không có sản phẩm";
              if (items.length > 0) {
                const firstItem = items[0];
                const productName =
                  firstItem.product?.name ?? firstItem.productName;
                productText =
                  items.length > 1
                    ? `${productName} + ${items.length - 1}`
                    : productName;
              }
              const formattedDate = orderDateFormatter.format(
                new Date(order.createdAt),
              );

              const uiStatus = (statusMap[order.status] ?? "processing") as
                | "completed"
                | "processing"
                | "shipping"
                | "cancelled";

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs font-medium text-foreground">
                    <Link
                      href={`/orders/${order.id}`}
                      className="transition-colors hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {customerName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-60 truncate text-xs text-muted-foreground">
                    {productText}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formattedDate}
                  </TableCell>
                  <TableCell className="text-right text-xs font-medium text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <OrderStatusBadge label={t(`status.${uiStatus}`)} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      <div className="border-t border-border/50 py-2.5 text-center">
        <Button
          variant="link"
          asChild
          className="text-xs font-medium text-primary"
        >
          <Link href="/orders">{t("viewAll")}</Link>
        </Button>
      </div>
    </Card>
  );
}
