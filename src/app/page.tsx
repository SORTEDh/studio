import { Header } from "@/components/header";
import { PrescriptionAnalyzer } from "@/components/prescription-analyzer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 font-headline">
              AI-Powered Prescription Analysis
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Upload a prescription image to automatically extract medication
              details. A tool for medical staff to streamline workflow.
            </p>
          </div>
          <PrescriptionAnalyzer />
           <Alert variant="destructive" className="max-w-3xl mx-auto mt-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>For Demonstration Purposes Only</AlertTitle>
            <AlertDescription>
              This is a pilot application and should not be used for real medical decisions. The information provided by the AI may be inaccurate. Always consult with a qualified healthcare professional for any medical concerns.
            </AlertDescription>
          </Alert>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Patient Support MVP. All rights reserved.
      </footer>
    </div>
  );
}
