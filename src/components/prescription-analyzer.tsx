
"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { AnalyzePrescriptionImageOutput } from "@/ai/flows/analyze-prescription-image";
import { analyzePrescriptionAction } from "@/app/actions";

export function PrescriptionAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzePrescriptionImageOutput | null>(
    null
  );
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) {
        // 4MB limit for GenAI API
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 4MB.",
        });
        return;
      }
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setResult(null); // Clear previous results
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please upload a prescription image.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const dataUri = await fileToDataUri(file);
      const analysisResult = await analyzePrescriptionAction({
        prescriptionImageDataUri: dataUri,
      });

      if (analysisResult.error) {
        throw new Error(analysisResult.error);
      }

      setResult(analysisResult.data);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2">
          <div className="p-6 flex flex-col items-center justify-center bg-secondary/30">
            <form onSubmit={handleSubmit} className="w-full">
              <label
                htmlFor="prescription-upload"
                className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
              >
                {previewUrl ? (
                  <>
                    <Image
                      src={previewUrl}
                      alt="Prescription preview"
                      fill
                      style={{ objectFit: "contain" }}
                      className="rounded-lg p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-7 w-7"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove image</span>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, or WEBP (MAX. 4MB)
                    </p>
                  </div>
                )}
                <input
                  id="prescription-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                />
              </label>
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={!file || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Prescription"
                )}
              </Button>
            </form>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground font-headline">
              Analysis Results
            </h3>
            {isLoading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                  <div className="h-12 bg-muted rounded w-full animate-pulse"></div>
                </div>
              </div>
            )}
            {!isLoading && !result && (
              <div className="text-muted-foreground text-center py-10">
                <p>Results will be displayed here after analysis.</p>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Medication Name
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {result.medicationName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Dosage
                  </p>
                  <p className="text-lg">{result.dosage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Frequency
                  </p>
                  <p className="text-lg">{result.frequency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Additional Notes
                  </p>
                  <p className="text-base bg-muted p-3 rounded-md">
                    {result.additionalNotes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
