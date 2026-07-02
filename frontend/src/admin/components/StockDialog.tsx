import { useState } from "react";
import type { InventoryMovementReason, Product } from "@nati/shared";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api-client";
import { useAdjustInventory } from "@/features/catalog/catalog.hooks";

const REASONS: InventoryMovementReason[] = [
  "RESTOCK",
  "ADJUSTMENT",
  "RETURN",
  "SALE",
  "RESERVATION",
  "RELEASE",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const StockDialog = ({ open, onOpenChange, product }: Props) => {
  const [delta, setDelta] = useState("0");
  const [reason, setReason] = useState<InventoryMovementReason>("RESTOCK");
  const adjust = useAdjustInventory();

  const submit = async () => {
    if (!product) return;
    const value = Number(delta);
    if (!Number.isInteger(value) || value === 0) {
      toast({ title: "Enter a non-zero whole number", variant: "destructive" });
      return;
    }
    try {
      const info = await adjust.mutateAsync({ productId: product.id, input: { delta: value, reason } });
      toast({ title: "Stock adjusted", description: `New quantity: ${info.quantity}` });
      setDelta("0");
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Adjustment failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
        </DialogHeader>
        {product && (
          <p className="text-sm text-muted-foreground">
            {product.name} — current: {product.inventory.quantity}
          </p>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delta">Change (+/-)</Label>
            <Input id="delta" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as InventoryMovementReason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={adjust.isPending}>
            {adjust.isPending ? "Saving..." : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockDialog;
