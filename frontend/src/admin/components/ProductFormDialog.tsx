import { useEffect, useState } from "react";
import type { Product, ProductStatus } from "@nati/shared";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api-client";
import { useBrands, useCategories, useCreateProduct, useUpdateProduct } from "@/features/catalog/catalog.hooks";
import ProductImageManager from "@/admin/components/ProductImageManager";

const NONE = "__none__";
const STATUSES: ProductStatus[] = ["DRAFT", "ACTIVE", "ARCHIVED"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  status: ProductStatus;
  isFeatured: boolean;
  brandId: string;
  categoryId: string;
  initialStock: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  status: "DRAFT",
  isFeatured: false,
  brandId: NONE,
  categoryId: NONE,
  initialStock: "0",
};

const ProductFormDialog = ({ open, onOpenChange, product }: Props) => {
  const isEdit = Boolean(product);
  const [form, setForm] = useState<FormState>(emptyForm);
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: String(product.price),
        compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
        status: product.status,
        isFeatured: product.isFeatured,
        brandId: product.brand?.id ?? NONE,
        categoryId: product.category?.id ?? NONE,
        initialStock: "0",
      });
    } else {
      setForm(emptyForm);
    }
  }, [product, open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    const price = Number(form.price);
    if (!form.name.trim() || !form.description.trim() || Number.isNaN(price)) {
      toast({ title: "Missing fields", description: "Name, description and price are required.", variant: "destructive" });
      return;
    }
    const compareAtPrice = form.compareAtPrice ? Number(form.compareAtPrice) : undefined;
    const brandId = form.brandId === NONE ? undefined : form.brandId;
    const categoryId = form.categoryId === NONE ? undefined : form.categoryId;

    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({
          id: product.id,
          input: { name: form.name, description: form.description, price, compareAtPrice, status: form.status, isFeatured: form.isFeatured, brandId, categoryId },
        });
        toast({ title: "Product updated" });
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          description: form.description,
          price,
          compareAtPrice,
          currency: "USD",
          status: form.status,
          isFeatured: form.isFeatured,
          brandId,
          categoryId,
          initialStock: Number(form.initialStock) || 0,
        });
        toast({ title: "Product created" });
      }
      onOpenChange(false);
    } catch (error) {
      toast({ title: "Save failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-price">Price</Label>
              <Input id="p-price" type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-compare">Compare-at price</Label>
              <Input id="p-compare" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v as ProductStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="p-stock">Initial stock</Label>
                <Input id="p-stock" type="number" value={form.initialStock} onChange={(e) => set("initialStock", e.target.value)} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={form.brandId} onValueChange={(v) => set("brandId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {brands?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="p-featured" checked={form.isFeatured} onCheckedChange={(v) => set("isFeatured", v === true)} />
            <Label htmlFor="p-featured">Featured</Label>
          </div>

          {isEdit && product ? (
            <div className="border-t border-border pt-4">
              <ProductImageManager productId={product.id} initialImages={product.images} />
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-sm text-muted-foreground">
              Save the product first, then reopen it to add images.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
