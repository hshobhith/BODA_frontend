import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderItem } from "@/types/order";

export function OrderItemsTable({ items }: { items: OrderItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead className="text-right">Unit price</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <span className="font-medium text-foreground">{item.productNameSnapshot}</span>
              {!!item.addons?.length && (
                <p className="text-xs text-muted-foreground">
                  {item.addons
                    .map((addon) => (addon.price > 0 ? `${addon.name} (+₹${addon.price})` : addon.name))
                    .join(", ")}
                </p>
              )}
            </TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right">&#8377;{item.unitPrice.toFixed(2)}</TableCell>
            <TableCell className="text-right">&#8377;{item.total.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
