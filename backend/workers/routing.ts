import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getTeamsTool } from './tools/get-teams';
import { getOnCallTool } from './tools/get-on-call';
import { z } from 'zod';

// Mock DB call for user validation and audit trail
const validateUserExists = async (userId: string) => {
  return userId === 'usr_abc123';
};

const saveToAuditTrail = async (interventionId: string, event: any) => {
  console.log(`Audit saved for ${interventionId}:`, event);
};

// Response schema
const RoutingDecisionSchema = z.object({
  rationale: z.string(),
  assignedUserId: z.string().nullable(),
});

export const evaluateAgenticRouting = async (intervention: any) => {
  const systemPrompt = `
You are the Agentic Routing Engine.
Your job is to read the intervention context and decide which human user should be paged.
Use the tools provided to look up teams by required skills, and then find who is on call for those teams.
Once you decide, output your rationale and the final assigned user ID.
  `;

  try {
    const { text, toolResults } = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt + '\nIMPORTANT: Your final response MUST be a valid JSON object matching this schema: { "rationale": "string", "assignedUserId": "string" }',
      prompt: JSON.stringify(intervention),
      tools: {
        getTeams: getTeamsTool,
        getOnCall: getOnCallTool,
      },
      maxSteps: 5,
    });

    // Strip markdown code blocks if any
    const cleanText = text.replace(/^```json\n/, '').replace(/\n```$/, '');

    let decision;
    try {
      decision = JSON.parse(cleanText);
    } catch (e) {
      decision = { rationale: text, assignedUserId: null };
    }

    // 4.1 Zod validation
    const parsed = RoutingDecisionSchema.parse(decision);
    
    let finalUserId = parsed.assignedUserId;

    // Validate against directory
    if (finalUserId) {
      const isValid = await validateUserExists(finalUserId);
      if (!isValid) {
        console.warn('LLM hallucinated user ID:', finalUserId);
        finalUserId = null;
      }
    }

    // 4.2 Fallback
    if (!finalUserId) {
      finalUserId = 'admin_user'; // fallback to org admin
    }

    // 3.4 Save to audit trail
    await saveToAuditTrail(intervention.id, {
      type: 'AGENTIC_ROUTING_DECISION',
      rationale: parsed.rationale,
      assignedUserId: finalUserId,
      toolsUsed: toolResults,
    });

    return {
      assignedUserId: finalUserId,
      rationale: parsed.rationale
    };
  } catch (error) {
    console.error('Agentic routing failed', error);
    // Fallback
    return {
      assignedUserId: 'admin_user',
      rationale: 'Fallback due to engine error',
    };
  }
};
