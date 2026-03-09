import { GROUP_COLORS } from './Map';

export function ScoreBoard({ ranking, compact = false }) {
  if (!ranking || ranking.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-1">
        {ranking.map((team, index) => (
          <div
            key={team.name}
            className="flex justify-between items-center text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }}
              />
              <span className="text-gray-300">{index + 1}. {team.name}</span>
            </span>
            <span className="font-mono text-white">{team.points} pts</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ranking.map((team, index) => (
        <div
          key={team.name}
          className={`flex justify-between items-center p-3 rounded-lg ${
            index === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' :
            index === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
            index === 2 ? 'bg-orange-600/20 border border-orange-600/50' :
            'bg-gray-800'
          }`}
        >
          <span className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${
              index === 0 ? 'text-yellow-500' :
              index === 1 ? 'text-gray-400' :
              index === 2 ? 'text-orange-600' :
              'text-gray-500'
            }`}>
              {index + 1}.
            </span>
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length] }}
            />
            <span className="text-white font-medium">{team.name}</span>
          </span>
          <span className="font-mono text-xl text-white font-bold">{team.points} pts</span>
        </div>
      ))}
    </div>
  );
}

export default ScoreBoard;
