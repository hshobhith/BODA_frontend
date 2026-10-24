"use client";

import { MapPin, Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Address } from "@/types/address";

interface AddressCardProps {
  address: Address;
  onSetDefault?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function AddressCard({
  address,
  onSetDefault,
  onEdit,
  onDelete,
  isDeleting,
}: AddressCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 py-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{address.label}</span>
              {address.isDefault && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Star className="size-3 fill-current" /> Default
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
              {address.pincode}, {address.country}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {!address.isDefault && onSetDefault && (
            <Button type="button" size="sm" variant="outline" onClick={onSetDefault}>
              Set default
            </Button>
          )}
          {onEdit && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onEdit}
              aria-label="Edit address"
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={isDeleting}
              onClick={onDelete}
              aria-label="Delete address"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
