import { useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onAnalysisComplete: (results: any[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const FileUpload = ({ onAnalysisComplete, isLoading, setIsLoading }: FileUploadProps) => {
  const [bucketName, setBucketName] = useState("");
  const [blobName, setBlobName] = useState("");
  const [sheetName, setSheetName] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!bucketName.trim() || !blobName.trim() || !sheetName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter bucket name, file name, and sheet name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const payload = {
      bucket_name: bucketName.trim(),
      blob_name: blobName.trim(),
      sheet_name: sheetName.trim(),
    };

    try {
      const response = await fetch("https://ai-data-remediation.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log("Raw response text:", text);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}\n${text}`);
      }

      let results;
      try {
        results = JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        throw new Error("Server returned invalid JSON. Check console for raw response.");
      }

      if (results.error) {
        throw new Error(results.error);
      }

      onAnalysisComplete(results);
      toast({
        title: "Analysis Complete",
        description: `Found ${results.length} data quality issues`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze the file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Analyze Data Quality Report from GCS
        </CardTitle>
        <CardDescription>
          Enter your GCS bucket, file name, and sheet name to analyze data quality issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bucket-name">GCS Bucket Name</Label>
            <Input
              id="bucket-name"
              type="text"
              placeholder="e.g. my-bucket"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blob-name">GCS File Name (Blob Name)</Label>
            <Input
              id="blob-name"
              type="text"
              placeholder="e.g. myfile.xlsx"
              value={blobName}
              onChange={(e) => setBlobName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheet-name">Sheet Name</Label>
            <Input
              id="sheet-name"
              type="text"
              placeholder="e.g. Sheet1"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <Button 
          onClick={handleAnalyze} 
          disabled={!bucketName.trim() || !blobName.trim() || !sheetName.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Data Quality
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
