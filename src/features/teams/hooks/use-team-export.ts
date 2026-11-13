import { useState } from 'react';
import { teamService } from '@/features/teams/services/team.service';
import { toast } from '@/lib/toast';

/**
 * Downloads one team's roster as a CSV. Tracks which team is being prepared so
 * its own button can show a spinner while other rows stay usable.
 */
export function useTeamExport() {
  const [exportingId, setExportingId] = useState<string | null>(null);

  const exportTeam = async (teamId: string, code?: string | null) => {
    if (exportingId) return;
    try {
      setExportingId(teamId);
      const blob = await teamService.exportTeam(teamId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-${code || teamId}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Team file exported.');
    } catch (error) {
      console.error('Failed to export team:', error);
      toast.error('Failed to export the team file. Please try again.');
    } finally {
      setExportingId(null);
    }
  };

  return { exportTeam, exportingId };
}
