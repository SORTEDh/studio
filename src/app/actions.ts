
"use server";

import {
  createCarePlan,
  type CreateCarePlanInput,
} from "@/ai/flows/create-care-plan";
import {
  analyzePrescriptionImage,
  type AnalyzePrescriptionImageOutput,
} from "@/ai/flows/analyze-prescription-image";

import { z } from "zod";

const actionInputSchema = z.object({
  prescriptionImageDataUri: z.string(),
});

type ServerActionResult<T> = {
  data?: T;
  error?: string;
};

export async function createCarePlanAction(
  input: CreateCarePlanInput
): Promise<ServerActionResult<CreateCarePlanOutput>> {
  try {
    const validatedInput = actionInputSchema.safeParse(input);
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
  input: CreateCarePlanInput
): Promise<ServerActionResult<AnalyzePrescriptionImageOutput>> {
    try {
        const validatedInput = actionInputSchema.safeParse(input);
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
