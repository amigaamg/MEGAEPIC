import axios from 'axios';

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_API_KEY = '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';

interface AiNarrativeInput {
  patientName?: string;
  age?: number;
  sex?: string;
  occupation?: string;
  residence?: string;
  chiefComplaint: string;
  duration?: string;
  onset?: string;
  patientWords?: string;
  answers: Record<string, string>;
}

interface AiNarrativeResult {
  hpi: string;
  examination?: string;
  summary?: string;
  style: 'consultant_sounding' | 'standard';
}

export async function generateAiHpiNarrative(input: AiNarrativeInput): Promise<AiNarrativeResult> {
  const systemPrompt = `You are a senior consultant physician writing a clinical history for a patient presentation.
Your task is to generate a polished, natural-sounding History of Presenting Illness (HPI) narrative from the structured data provided.

RULES:
- Write in formal clinical English, third person ("the patient", "he", "she")
- Use natural prose, not bullet points
- Include relevant negatives if the data supports it
- The narrative should flow: introduction → onset → character → timing → severity → associated symptoms → modifiers
- Do NOT include management, examination, or investigation suggestions — HPI only
- Be concise but thorough (2-5 paragraphs)
- If insufficient data, write what is available without fabricating
- Never use markdown formatting in the output`;

  const answersSummary = Object.entries(input.answers)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const userPrompt = `Generate a polished HPI narrative from the following clinical data:

Patient: ${input.patientName || 'Unknown'}
Age/Sex: ${input.age || 'Unknown'}-year-old ${input.sex || 'unknown'}
${input.occupation ? `Occupation: ${input.occupation}` : ''}
${input.residence ? `Residence: ${input.residence}` : ''}

Chief Complaint: ${input.chiefComplaint}
${input.duration ? `Duration: ${input.duration}` : ''}
${input.onset ? `Onset: ${input.onset}` : ''}
${input.patientWords ? `Patient's words: "${input.patientWords}"` : ''}

Structured Answers:
${answersSummary || 'No additional data captured yet.'}`;

  try {
    const response = await axios.post(
      NVIDIA_API_URL,
      {
        model: 'deepseek-ai/deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
        reasoning_effort: 'high',
      },
      {
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const hpi = response.data?.choices?.[0]?.message?.content?.trim() || '';

    return {
      hpi,
      style: 'consultant_sounding',
    };
  } catch (error) {
    console.warn('AI narrative generation failed, falling back to deterministic:', error);
    return {
      hpi: '',
      style: 'standard',
    };
  }
}
