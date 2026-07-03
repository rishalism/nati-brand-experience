import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import type { ProductImage } from "@nati/shared";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api-client";
import {
  useDeleteProductImage,
  useSetPrimaryImage,
  useUploadProductImage,
} from "@/features/catalog/catalog.hooks";

interface Props {
  productId: string;
  initialImages: ProductImage[];
}

const byPosition = (a: ProductImage, b: ProductImage) => a.position - b.position;

/** Image gallery manager for the product edit dialog. Seeds from the product's
 * images and keeps a local copy in sync with the full Product each mutation
 * returns, so it never depends on the parent re-fetching. */
const ProductImageManager = ({ productId, initialImages }: Props) => {
  const [images, setImages] = useState<ProductImage[]>(initialImages);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reseed only when the target product changes — not on every parent render,
  // which would clobber the optimistic local updates below.
  useEffect(() => {
    setImages(initialImages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const upload = useUploadProductImage();
  const setPrimary = useSetPrimaryImage();
  const remove = useDeleteProductImage();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        const product = await upload.mutateAsync({ productId, file });
        setImages(product.images);
      } catch (error) {
        toast({
          title: `Upload failed: ${file.name}`,
          description: getErrorMessage(error),
          variant: "destructive",
        });
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handlePrimary = async (imageId: string) => {
    try {
      const product = await setPrimary.mutateAsync({ productId, imageId });
      setImages(product.images);
    } catch (error) {
      toast({
        title: "Couldn’t set primary",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await remove.mutateAsync({ productId, imageId });
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const sorted = [...images].sort(byPosition);
  const busy = upload.isPending || setPrimary.isPending || remove.isPending;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Images</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {upload.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="mr-2 h-4 w-4" />
          )}
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {sorted.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No images yet. Upload up to 5 MB each (JPG, PNG, WebP).
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {sorted.map((img) => (
            <div
              key={img.id}
              className={`group relative aspect-square overflow-hidden rounded-md border ${
                img.isPrimary ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
              {img.isPrimary && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isPrimary && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:text-white"
                    disabled={busy}
                    onClick={() => handlePrimary(img.id)}
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7 text-white hover:text-white"
                  disabled={busy}
                  onClick={() => handleDelete(img.id)}
                  title="Delete image"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
