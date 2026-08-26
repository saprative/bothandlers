import { tool } from 'ai';
import { z } from 'zod';

// Mock DB call for now
const fetchOnCallUsers = async (teamId: string) => {
  // In a real implementation, this would query DynamoDB OneTable schedules for the team
  if (teamId === 'team_finance') {
    return [
      { id: 'usr_abc123', name: 'Alice Finance', currentlyOnCall: true }
    ];
  }
  return [];
};

export const getOnCallTool = tool({
  description: 'Fetches the currently available, on-call users for a specific team.',
  parameters: z.object({
    teamId: z.string().describe('The ID of the team to check for on-call users.'),
  }),
  execute: async ({ teamId }) => {
    const users = await fetchOnCallUsers(teamId);
    return {
      users,
      count: users.length,
    };
  },
});
