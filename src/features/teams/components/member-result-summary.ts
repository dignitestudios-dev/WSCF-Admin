import { MemberResult } from '../services/team.service';

/**
 * Why a player did not end up on the team, in the admin's words.
 *
 * The backend reports a status and a machine reason per member; a bare "3 of 4
 * added" leaves the admin to guess which one and why, so every non-add outcome
 * gets an explanation here.
 */
export function explainMemberResult(result: MemberResult): string | null {
  const name = result.name || 'That player';

  switch (result.status) {
    case 'skipped':
      return `${name} is already on this team`;
    case 'failed':
      if (result.reason === 'inactive') {
        return `${name} is inactive — activate the account first`;
      }
      if (result.reason === 'not_found') {
        return `${name} no longer exists`;
      }
      if (result.reason === 'not_in_team') {
        return `${name} is not on this team`;
      }
      return `${name} could not be added`;
    default:
      return null;
  }
}

/**
 * Everything that did not simply succeed, ready to show under the summary toast.
 * Returns an empty array when the whole batch went through.
 */
export function collectMemberProblems(results: MemberResult[] = []): string[] {
  return results
    .map(explainMemberResult)
    .filter((message): message is string => Boolean(message));
}

/** "Ryder Barker was moved from Knights" — worth saying, but not a problem. */
export function collectMemberMoves(results: MemberResult[] = []): string[] {
  return results
    .filter((result) => result.status === 'switched')
    .map(
      (result) =>
        `${result.name || 'A player'} was moved${
          result.fromTeam?.name ? ` from ${result.fromTeam.name}` : ' from another team'
        }`
    );
}
