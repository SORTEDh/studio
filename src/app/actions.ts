
"use server";

import {
  createCarePlan,
  type CreateCarePlanInput,
  type CreateCarePlanOutput,
} from "@/ai/flows/create-care-plan";
import {
  analyzePrescriptionImage,
  type AnalyzePrescriptionImageOutput,
} from "@/ai/flows/analyze-prescription-image";
import { getFirebase } from "@/firebase-server";
import { z } from "zod";

const analyzeActionInputSchema = z.object({
  prescriptionImageDataUri: z.string(),
});

const createPlanActionInputSchema = z.object({
    prescriptionImageDataUri: z.string(),
    patientId: z.string().optional(),
});


type ServerActionResult<T> = {
  data?: T;
  error?: string;
};

export async function createCarePlanAction(
  input: CreateCarePlanInput
): Promise<ServerActionResult<CreateCarePlanOutput>> {
  try {
    const validatedInput = createPlanActionInputSchema.safeParse(input);
    if (!validatedInput.success) {
      return { error: "Invalid input." };
    }

    const result = await createCarePlan(validatedInput.data);
    if (result.error) {
        return { error: result.error };
    }
    return { data: result.data };
  } catch (error) {
    console.error("Error in createCarePlanAction:", error);
    return {
      error: "An unexpected error occurred during analysis. Please try again.",
    };
  }
}

export async function analyzePrescriptionAction(
  input: { prescriptionImageDataUri: string }
): Promise<ServerActionResult<AnalyzePrescriptionImageOutput>> {
    try {
        const validatedInput = analyzeActionInputSchema.safeParse(input);
        if (!validatedInput.success) {
            return { error: "Invalid input." };
        }
    
        const result = await analyzePrescriptionImage(validatedInput.data);
        return { data: result };
    } catch (error) {
        console.error("Error in analyzePrescriptionAction:", error);
        return {
            error: "An unexpected error occurred during analysis. Please try again.",
        };
    }
}
