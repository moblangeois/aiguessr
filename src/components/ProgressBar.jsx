import { motion } from 'framer-motion';

export function ProgressBar({ current, total, label }) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-emerald-400 text-sm font-medium">{label}</span>
          <span className="text-emerald-200/70 text-sm font-mono">
            {current}/{total}
          </span>
        </div>
      )}
      <div className="h-2 bg-[#1a2f28] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
        />
      </div>
    </div>
  );
}

export function CircularProgress({ progress, size = 60, strokeWidth = 6, color = "#10b981" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a2f28"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-sm">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export function QuestionProgressDots({ current, total, answers }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < current;
        const isCurrent = index === current;
        const hasAnswer = answers && Object.keys(answers).length > 0;

        return (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              isCurrent
                ? 'bg-amber-500 ring-2 ring-amber-500/50 ring-offset-2 ring-offset-[#0f1f1a]'
                : isCompleted
                  ? hasAnswer
                    ? 'bg-emerald-500'
                    : 'bg-emerald-700'
                  : 'bg-[#253d34]'
            }`}
            title={`Question ${index + 1}`}
          />
        );
      })}
    </div>
  );
}

export default ProgressBar;
