import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/SummaryCard";
import { ExpenseTable } from "@/components/ExpenseTable";
import { ExpenseSubmissionModal } from "@/components/ExpenseSubmissionModal";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, FileSpreadsheet } from "lucide-react";
import { Expense, ExpenseSummary } from "@/types/expense";
import { extractReceiptData, OCRResult } from "@/services/ocrService";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Index = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [ocrData, setOcrData] = useState<OCRResult | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load expenses from Firebase in real-time
  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expenseData: Expense[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          employee: data.employee,
          description: data.description,
          date: data.date,
          category: data.category,
          paidBy: data.paidBy,
          remarks: data.remarks || "",
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
        };
      });
      setExpenses(expenseData);
    });

    return () => unsubscribe();
  }, []);

  // Calculate summary from expenses
  const summary: ExpenseSummary = {
    draft: expenses
      .filter(e => e.status === "draft")
      .reduce((sum, e) => sum + e.amount, 0),
    submitted: expenses
      .filter(e => e.status === "submitted")
      .reduce((sum, e) => sum + e.amount, 0),
    approved: expenses
      .filter(e => e.status === "approved")
      .reduce((sum, e) => sum + e.amount, 0),
  };

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

  const handleSubmitExpense = async (data: any) => {
    console.log("Submitting expense:", data);
    
    try {
      let receiptUrl = null;

      // Upload receipt file if exists
      if (data.receiptFile) {
        const fileName = `${Date.now()}_${data.receiptFile.name}`;
        const storageRef = ref(storage, `receipts/${fileName}`);
        await uploadBytes(storageRef, data.receiptFile);
        receiptUrl = await getDownloadURL(storageRef);
      }

      // Save to Firestore
      await addDoc(collection(db, "expenses"), {
        employee: "Sarah", // TODO: Get from auth context
        description: data.description,
        date: data.expenseDate,
        category: data.category,
        paidBy: data.paidBy,
        amount: parseFloat(data.amount),
        currency: data.currency,
        status: "draft",
        remarks: data.remarks || "",
        receiptUrl,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      toast({
        title: "Expense submitted!",
        description: "Your expense has been saved successfully.",
      });
      setIsModalOpen(false);
      setOcrData(null);
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast({
        title: "Error",
        description: "Failed to submit expense. Please try again.",
        variant: "destructive",
      });
    }
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
