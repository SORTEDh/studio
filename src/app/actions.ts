"use server";

import {
  analyzePrescriptionImage,
  type AnalyzePrescriptionImageInput,
  type AnalyzePrescriptionImageOutput,
} from "@/ai/flows/analyze-prescription-image";
import { z } from "zod";

const actionInputSchema = z.object({
  prescriptionImageDataUri: z.string(),
});

type ServerActionResult = {
  data?: AnalyzePrescriptionImageOutput;
  error?: string;
};

export async function analyzePrescription(
  input: AnalyzePrescriptionImageInput
): Promise<ServerActionResult> {
  try {
    const validatedInput = actionInputSchema.safeParse(input);
    if (!validatedInput.success) {
      return { error: "Invalid input." };
    }

    const result = await analyzePrescriptionImage(validatedInput.data);
    return { data: result };
  } catch (error) {
    console.error("Error in analyzePrescription action:", error);
    // In a real app, you'd want to log this error to a service
    return {
      error: "An unexpected error occurred during analysis. Please try again.",
    };
  }
}
