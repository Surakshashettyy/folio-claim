import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";
import { extractReceiptData, OCRResult } from "@/services/ocrService";

interface ExpenseSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  prefilledData?: OCRResult | null;
}

export function ExpenseSubmissionModal({
  open,
  onOpenChange,
  onSubmit,
  prefilledData,
}: ExpenseSubmissionModalProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    expenseDate: "",
    category: "",
    paidBy: "",
    amount: "",
    currency: "INR",
    remarks: "",
  });

  // Prefill form when OCR data is available
  useEffect(() => {
    if (prefilledData) {
      setFormData({
        description: prefilledData.description,
        expenseDate: prefilledData.date,
        category: "",
        paidBy: "",
        amount: prefilledData.amount.toString(),
        currency: prefilledData.currency,
        remarks: prefilledData.vendor || "",
      });
    }
  }, [prefilledData]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFile(file);
    setIsProcessing(true);

    toast({
      title: "Processing receipt...",
      description: "Extracting data from your receipt using OCR",
    });

    try {
      const ocrResult = await extractReceiptData(file);
      setFormData({
        description: ocrResult.description,
        expenseDate: ocrResult.date,
        category: formData.category,
        paidBy: formData.paidBy,
        amount: ocrResult.amount.toString(),
        currency: ocrResult.currency,
        remarks: ocrResult.vendor || "",
      });

      toast({
        title: "Success!",
        description: "Receipt data extracted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process receipt. Please enter details manually.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      receiptFile,
    });
    // Reset form
    setFormData({
      description: "",
      expenseDate: "",
      category: "",
      paidBy: "",
      amount: "",
      currency: "INR",
      remarks: "",
    });
    setReceiptFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Submit New Expense
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("receipt-upload")?.click()}
            disabled={isProcessing}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isProcessing ? "Processing..." : "Attach Receipt"}
          </Button>
          <input
            id="receipt-upload"
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          {receiptFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{receiptFile.name}</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Draft → Waiting approval → Approved
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g., Dinner with Client"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseDate">Expense Date</Label>
              <Input
                id="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) =>
                  setFormData({ ...formData, expenseDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Accommodation">Accommodation</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Gifts">Gifts</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Select
                value={formData.paidBy}
                onValueChange={(value) =>
                  setFormData({ ...formData, paidBy: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee (Personal Card)</SelectItem>
                  <SelectItem value="Company">Company Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Total Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="1500"
                  className="flex-1"
                  required
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Optional notes for approver"
              />
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold mb-2">Approval History Log</h4>
            <p className="text-sm text-muted-foreground">
              Log will appear here after submission.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            Submit Expense
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
