'use server';

/**
 * @fileOverview An AI agent that generates a description for a file.
 * 
 * - generateFileDescription - A function that generates a description for a file.
 * - GenerateFileDescriptionInput - The input type for the generateFileDescription function.
 * - GenerateFileDescriptionOutput - The return type for the generateFileDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFileDescriptionInputSchema = z.object({
  fileName: z.string().describe('The name of the file.'),
  fileContent: z.string().describe('The content of the file.'),
});
export type GenerateFileDescriptionInput = z.infer<
  typeof GenerateFileDescriptionInputSchema
>;

const GenerateFileDescriptionOutputSchema = z.object({
  description: z.string().describe('A description of the file.'),
});
export type GenerateFileDescriptionOutput = z.infer<
  typeof GenerateFileDescriptionOutputSchema
>;

export async function generateFileDescription(
  input: GenerateFileDescriptionInput
): Promise<GenerateFileDescriptionOutput> {
  return generateFileDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFileDescriptionPrompt',
  input: {schema: GenerateFileDescriptionInputSchema},
  output: {schema: GenerateFileDescriptionOutputSchema},
  prompt: `You are an AI assistant that helps users understand their files.\n  Generate a concise description for the following file.  The description should be no more than 2 sentences.\n
  Filename: {{{fileName}}}\n  Content: {{{fileContent}}}\n  `,
});

const generateFileDescriptionFlow = ai.defineFlow(
  {
    name: 'generateFileDescriptionFlow',
    inputSchema: GenerateFileDescriptionInputSchema,
    outputSchema: GenerateFileDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
