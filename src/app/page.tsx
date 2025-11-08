import { Header } from "@/components/header";
import { PrescriptionAnalyzer } from "@/components/prescription-analyzer";

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
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Patient Support MVP. All rights reserved.
      </footer>
    </div>
  );
}
