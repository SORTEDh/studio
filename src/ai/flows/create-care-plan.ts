
'use server';
/**
 * @fileOverview A flow that analyzes a prescription, creates a care plan, and associated tasks.
 *
 * - createCarePlan - The main function to trigger the flow.
 * - CreateCarePlanInput - The input type for the flow.
 * - CreateCarePlanOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getFirebase } from '@/firebase-server';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";


// Schemas from analyze-prescription-image.ts
const AnalyzePrescriptionImageOutputSchema = z.object({
  medicationName: z.string().describe('The name of the medication.'),
  dosage: z.string().describe('The dosage of the medication.'),
  frequency: z.string().describe('The frequency of the medication.'),
  additionalNotes: z.string().describe('Any additional notes from the prescription.'),
});


const CreateCarePlanInputSchema = z.object({
  prescriptionImageDataUri: z
    .string()
    .describe(
      "A prescription image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CreateCarePlanInput = z.infer<typeof CreateCarePlanInputSchema>;

const TaskSchema = z.object({
  type: z.string().describe("Type of the task, e.g., 'Medication', 'Appointment'"),
  text_en: z.string().describe('Task description in English.'),
  text_kn: z.string().describe('Task description in Kannada.'),
  dueDate: z.string().describe('Due date for the task in ISO 8601 format.'),
  status: z.enum(['Pending', 'Completed', 'Missed']).describe('Status of the task.'),
});

const PrescriptionSchema = AnalyzePrescriptionImageOutputSchema.extend({
  id: z.string(),
  patientId: z.string(),
  imageUrl: z.string(),
  createdAt: z.string(),
  status: z.enum(['Active', 'Inactive', 'Pending', 'Reviewed', 'Flagged']),
});

const CarePlanSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  prescriptionId: z.string(),
  createdAt: z.string(),
});


const CreateCarePlanOutputSchema = z.object({
  prescription: PrescriptionSchema,
  carePlan: CarePlanSchema,
  tasks: z.array(TaskSchema.extend({ id: z.string() })),
});
export type CreateCarePlanOutput = z.infer<typeof CreateCarePlanOutputSchema>;


export async function createCarePlan(
  input: CreateCarePlanInput
): Promise<{data?: CreateCarePlanOutput, error?: string}> {
    try {
        const result = await createCarePlanFlow(input);
        return { data: result }
    } catch (e: any) {
        console.error(e);
        return { error: e.message || 'An unknown error occurred.'}
    }
}


const analyzePrescriptionPrompt = ai.definePrompt({
  name: 'analyzePrescriptionPromptForCarePlan',
  input: { schema: CreateCarePlanInputSchema },
  output: { schema: AnalyzePrescriptionImageOutputSchema },
  prompt: `You are an AI assistant that analyzes prescription images and extracts key information.

  Analyze the following prescription image and extract the medication name, dosage, frequency, and any additional notes. Return a JSON object with the medicationName, dosage, frequency, and additionalNotes fields populated. If some information is not visible or cannot be determined, populate the field with "unknown".

  Prescription Image: {{media url=prescriptionImageDataUri}}
  `,
});

const generateTasksPrompt = ai.definePrompt({
    name: 'generateTasksPrompt',
    input: { schema: AnalyzePrescriptionImageOutputSchema },
    output: { schema: z.object({ tasks: z.array(TaskSchema) }) },
    prompt: `You are a helpful medical assistant. Based on the following prescription information, generate a list of tasks for the patient. Create tasks for taking medication for the next 7 days based on the frequency.

    Medication: {{{medicationName}}}
    Dosage: {{{dosage}}}
    Frequency: {{{frequency}}}
    Notes: {{{additionalNotes}}}

    The current date is ${new Date().toISOString()}.
    Return a JSON object with a "tasks" array.
    `
})


const createCarePlanFlow = ai.defineFlow(
  {
    name: 'createCarePlanFlow',
    inputSchema: CreateCarePlanInputSchema,
    outputSchema: CreateCarePlanOutputSchema,
  },
  async (input) => {
    const { firestore, auth } = getFirebase();
    const storage = getStorage();
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User is not authenticated.');
    }

    // 1. Analyze the prescription image
    const { output: analysis } = await analyzePrescriptionPrompt(input);
    if (!analysis) {
        throw new Error('Could not analyze prescription');
    }

    // 2. Upload image to Firebase Storage
    const imageRef = ref(storage, `prescriptions/${user.uid}/${Date.now()}`);
    const uploadResult = await uploadString(input.prescriptionImageDataUri, imageRef, 'data_url');
    const imageUrl = await getDownloadURL(uploadResult.ref);


    // 3. Save the Prescription to Firestore
    const prescriptionRef = doc(collection(firestore, `users/${user.uid}/prescriptions`));
    const prescriptionData = {
        ...analysis,
        id: prescriptionRef.id,
        patientId: user.uid,
        imageUrl,
        createdAt: serverTimestamp(),
        status: 'Active',
    };
    await setDoc(prescriptionRef, prescriptionData);
    
    // 4. Create a Care Plan in Firestore
    const carePlanRef = doc(collection(firestore, `users/${user.uid}/carePlans`));
    const carePlanData = {
        id: carePlanRef.id,
        patientId: user.uid,
        prescriptionId: prescriptionRef.id,
        createdAt: serverTimestamp(),
    };
    await setDoc(carePlanRef, carePlanData);

    // 5. Generate tasks based on the analysis
    const { output: tasksOutput } = await generateTasksPrompt(analysis);
    if (!tasksOutput) {
        throw new Error('Could not generate tasks');
    }

    // 6. Save tasks to Firestore
    const savedTasks = [];
    for (const task of tasksOutput.tasks) {
        const taskRef = doc(collection(firestore, `users/${user.uid}/carePlans/${carePlanRef.id}/tasks`));
        const taskData = { ...task, id: taskRef.id, carePlanId: carePlanRef.id };
        await setDoc(taskRef, taskData);
        savedTasks.push(taskData);
    }
    
    // This is a workaround because serverTimestamp() returns a token, not a date.
    const finalPrescriptionData = {
        ...prescriptionData,
        createdAt: new Date().toISOString()
    }
    const finalCarePlanData = {
        ...carePlanData,
        createdAt: new Date().toISOString()
    }

    return {
      prescription: finalPrescriptionData,
      carePlan: finalCarePlanData,
      tasks: savedTasks,
    };
  }
);
