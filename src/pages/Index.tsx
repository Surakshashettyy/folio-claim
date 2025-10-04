import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/SummaryCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { ExpenseSubmissionModal } from "@/components/ExpenseSubmissionModal";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, FileSpreadsheet } from "lucide-react";
import { Expense, ExpenseSummary } from "@/types/expense";
import { extractReceiptData, OCRResult } from "@/services/ocrService";

const Index = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [ocrData, setOcrData] = useState<OCRResult | null>(null);

  // Mock data - replace with Firebase queries
  const [summary] = useState<ExpenseSummary>({
    draft: 5467,
    submitted: 33674,
    approved: 500,
  });

  const [expenses] = useState<Expense[]>([
    {
      id: "1",
      employee: "Sarah",
      description: "Restaurant bill",
      date: "2025-10-04",
      category: "Food",
      paidBy: "Sarah",
      remarks: "None",
      amount: 5000,
      currency: "INR",
      status: "draft",
      createdAt: "2025-10-04",
      updatedAt: "2025-10-04",
    },
    {
      id: "2",
      employee: "Sarah",
      description: "Client gift",
      date: "2025-10-02",
      category: "Gifts",
      paidBy: "Company Card",
      remarks: "VIP Client",
      amount: 15000,
      currency: "INR",
      status: "submitted",
      createdAt: "2025-10-02",
      updatedAt: "2025-10-02",
    },
    {
      id: "3",
      employee: "Sarah",
      description: "Flight Ticket",
      date: "2025-10-01",
      category: "Travel",
      paidBy: "Sarah",
      remarks: "Trip to Delhi",
      amount: 25000,
      currency: "INR",
      status: "approved",
      createdAt: "2025-10-01",
      updatedAt: "2025-10-01",
    },
  ]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingUpload(true);
    toast({
      title: "Processing receipt...",
      description: "Extracting data from your receipt using OCR",
    });

    try {
      const ocrResult = await extractReceiptData(file);
      setOcrData(ocrResult);
      setIsModalOpen(true);
      
      toast({
        title: "Success!",
        description: "Receipt data extracted. Please review and complete the form.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingUpload(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleNewExpense = () => {
    setOcrData(null);
    setIsModalOpen(true);
  };

  const handleSubmitExpense = (data: any) => {
    console.log("Submitting expense:", data);
    // TODO: Save to Firebase
    toast({
      title: "Expense submitted!",
      description: "Your expense has been submitted for approval.",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Employee Expense Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track and manage your expense claims
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            onClick={handleUploadClick}
            disabled={isProcessingUpload}
            className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
          >
            <Upload className="h-4 w-4" />
            {isProcessingUpload ? "Processing..." : "Upload Receipt"}
          </Button>
          <Button
            onClick={handleNewExpense}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
          <Button
            variant="outline"
            className="gap-2 ml-auto"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            amount={`${summary.draft} INR`}
            label="To submit (Draft)"
            variant="draft"
          />
          <SummaryCard
            amount={`${summary.submitted} INR`}
            label="Waiting approval"
            variant="submitted"
          />
          <SummaryCard
            amount={`${summary.approved} INR`}
            label="Approved"
            variant="approved"
          />
        </div>

        {/* Expense Table */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Expense History</h2>
          <ExpenseTable expenses={expenses} />
        </div>

        {/* Submission Modal */}
        <ExpenseSubmissionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleSubmitExpense}
          prefilledData={ocrData}
        />
      </div>
    </div>
  );
};

export default Index;
