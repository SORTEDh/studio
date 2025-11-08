
"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  createCarePlanAction,
} from "@/app/actions";
import type { CreateCarePlanOutput } from "@/ai/flows/create-care-plan";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

export function PrescriptionUploader() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateCarePlanOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) {
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
      setResult(null);
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
    if (!file || !user) {
      toast({
        variant: "destructive",
        title: "No file or user",
        description: "Please upload a prescription image and make sure you are logged in.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const dataUri = await fileToDataUri(file);
      const analysisResult = await createCarePlanAction({
        prescriptionImageDataUri: dataUri,
        patientId: user.uid,
        actorId: user.uid
      });

      if (analysisResult.error) {
        throw new Error(analysisResult.error);
      }

      setResult(analysisResult.data);
      toast({
        title: "Care Plan Created!",
        description: `Successfully created a new care plan for ${analysisResult.data?.prescription.medicationName}.`,
      });
      router.push("/dashboard/prescriptions");
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
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
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
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
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
            disabled={!file || isLoading || !user}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing & Creating Plan...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Care Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
