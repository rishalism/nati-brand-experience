import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { CreateCouponInput, DiscountType } from "@nati/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api-client";
import { useCoupons, useCreateCoupon, useDeleteCoupon } from "@/features/coupons/coupons.hooks";

const AdminCoupons = () => {
  const { data: coupons, isLoading } = useCoupons();
  const createMutation = useCreateCoupon();
  const deleteMutation = useDeleteCoupon();
  const [open, setOpen] = useState(false);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");
  const [minSubtotal, setMinSubtotal] = useState("");

  const reset = () => {
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("10");
    setMinSubtotal("");
  };

  const submit = async () => {
    const value = Number(discountValue);
    if (!code.trim() || Number.isNaN(value) || value <= 0) {
      toast({ title: "Code and a positive value are required", variant: "destructive" });
      return;
    }
    const input: CreateCouponInput = {
      code: code.trim(),
      discountType,
      discountValue: value,
      minSubtotal: minSubtotal ? Number(minSubtotal) : undefined,
      isActive: true,
    };
    try {
      await createMutation.mutateAsync(input);
      toast({ title: "Coupon created" });
      reset();
      setOpen(false);
    } catch (error) {
      toast({ title: "Failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wider text-foreground">Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount codes.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New coupon
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min subtotal</TableHead>
              <TableHead>Used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (coupons?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No coupons yet.
                </TableCell>
              </TableRow>
            ) : (
              coupons?.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell>
                    {c.discountType === "PERCENTAGE"
                      ? `${c.discountValue}%`
                      : `$${c.discountValue.toFixed(2)}`}
                  </TableCell>
                  <TableCell>{c.minSubtotal != null ? `$${c.minSubtotal.toFixed(2)}` : "—"}</TableCell>
                  <TableCell>{c.usedCount}</TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? "default" : "secondary"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(c.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="c-code">Code</Label>
              <Input id="c-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-value">Value</Label>
                <Input id="c-value" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-min">Minimum subtotal (optional)</Label>
              <Input id="c-min" type="number" value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
