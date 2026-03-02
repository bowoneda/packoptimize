"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Loader2 } from "lucide-react";
import { useCreateItem } from "@/hooks/use-items";
import { toast } from "sonner";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CsvRow {
  sku: string;
  name: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  isFragile?: string;
  canRotate?: string;
  [key: string]: string | undefined;
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const createItem = useCreateItem();

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRows(results.data);
      },
    });
  }, []);

  const handleImport = async () => {
    setImporting(true);
    let created = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        await createItem.mutateAsync({
          sku: row.sku,
          name: row.name,
          width: Number(row.width),
          height: Number(row.height),
          depth: Number(row.depth),
          weight: Number(row.weight),
          isFragile: row.isFragile?.toLowerCase() === "true",
          canRotate: row.canRotate?.toLowerCase() !== "false",
        });
        created++;
      } catch {
        errors++;
      }
    }

    toast.success(`Imported ${created} items${errors > 0 ? `, ${errors} failed` : ""}`);
    setImporting(false);
    setRows([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Items from CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {rows.length === 0 ? (
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Drop a CSV file or click to browse
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Required columns: sku, name, width, height, depth, weight
              </span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </label>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Preview ({Math.min(rows.length, 5)} of {rows.length} rows)
              </p>
              <div className="max-h-60 overflow-auto rounded-md border">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>W</TableHead>
                      <TableHead>H</TableHead>
                      <TableHead>D</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 5).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.width}</TableCell>
                        <TableCell>{row.height}</TableCell>
                        <TableCell>{row.depth}</TableCell>
                        <TableCell>{row.weight}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRows([])}>
                  Clear
                </Button>
                <Button
                  className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300"
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Import {rows.length} items
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
