import { tool } from 'ai';
import { z } from 'zod';

// Mock DB call for now
const fetchTeamsBySkill = async (skill: string) => {
  // In a real implementation, this would query DynamoDB OneTable GSI (e.g. SKILL#<skill>)
  if (skill.toLowerCase() === 'finance') {
    return [
      { id: 'team_finance', name: 'Finance Team' }
    ];
  }
  return [];
};

export const getTeamsTool = tool({
  description: 'Fetches teams matching a specific skill or capability.',
  parameters: z.object({
    skill: z.string().describe('The skill or capability to search for (e.g., finance, technical, tier1)'),
  }),
  execute: async ({ skill }) => {
    const teams = await fetchTeamsBySkill(skill);
    return {
      teams,
      count: teams.length,
    };
  },
});
