import { GROUP_COLORS } from './Map';

export function GroupSelector({ groups, currentIndex, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((group, index) => (
        <button
          key={group}
          onClick={() => onChange(index)}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            index === currentIndex
              ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
              : 'opacity-60 hover:opacity-100'
          }`}
          style={{
            backgroundColor: GROUP_COLORS[index % GROUP_COLORS.length],
            color: 'white'
          }}
        >
          {group}
        </button>
      ))}
    </div>
  );
}

export default GroupSelector;
