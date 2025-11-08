'use server';

/**
 * @fileOverview AI flow to analyze a prescription image and extract key information.
 *
 * - analyzePrescriptionImage - Function to analyze the prescription image.
 * - AnalyzePrescriptionImageInput - Input type for the analyzePrescriptionImage function.
 * - AnalyzePrescriptionImageOutput - Output type for the analyzePrescriptionImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePrescriptionImageInputSchema = z.object({
  prescriptionImageDataUri: z
    .string()
    .describe(
      'A prescription image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});

export type AnalyzePrescriptionImageInput = z.infer<
  typeof AnalyzePrescriptionImageInputSchema
>;

const AnalyzePrescriptionImageOutputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  dosage: z.string().describe('The dosage of the medication.'),
  frequency: z.string().describe('The frequency of the medication.'),
  additionalNotes: z.string().describe('Any additional notes from the prescription.'),
});

export type AnalyzePrescriptionImageOutput = z.infer<
  typeof AnalyzePrescriptionImageOutputSchema
>;

export async function analyzePrescriptionImage(
  input: AnalyzePrescriptionImageInput
): Promise<AnalyzePrescriptionImageOutput> {
  return analyzePrescriptionImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePrescriptionImagePrompt',
  input: {schema: AnalyzePrescriptionImageInputSchema},
  output: {schema: AnalyzePrescriptionImageOutputSchema},
  prompt: `You are an AI assistant that analyzes prescription images and extracts key information.

  Analyze the following prescription image and extract the medication name, dosage, frequency, and any additional notes.  Return a JSON object with the medicationName, dosage, frequency, and additionalNotes fields populated. If some information is not visible or cannot be determined, populate the field with "unknown".

  Prescription Image: {{media url=prescriptionImageDataUri}}
  `,
});

const analyzePrescriptionImageFlow = ai.defineFlow(
  {
    name: 'analyzePrescriptionImageFlow',
    inputSchema: AnalyzePrescriptionImageInputSchema,
    outputSchema: AnalyzePrescriptionImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
