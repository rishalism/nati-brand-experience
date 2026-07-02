import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useBrands, useCreateBrand, useDeleteBrand } from "@/features/catalog/catalog.hooks";

const AdminBrands = () => {
  const { data: brands, isLoading } = useBrands();
  const createMutation = useCreateBrand();
  const deleteMutation = useDeleteBrand();
  const [name, setName] = useState("");

  const create = async () => {
    if (!name.trim()) return;
    try {
      await createMutation.mutateAsync({ name: name.trim() });
      setName("");
      toast({ title: "Brand created" });
    } catch (error) {
      toast({ title: "Failed", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wider text-foreground">Brands</h1>
        <p className="text-muted-foreground">Manage product brands.</p>
      </div>

      <div className="flex gap-2 max-w-md">
        <Input placeholder="New brand name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={create} disabled={createMutation.isPending}>
          Add
        </Button>
      </div>

      <div className="rounded-md border border-border max-w-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (
              brands?.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(b.id)}
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
    </div>
  );
};

export default AdminBrands;
