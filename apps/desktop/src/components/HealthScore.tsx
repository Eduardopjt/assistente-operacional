import './HealthScore.css';

interface HealthScoreProps {
  score: number;
}

export default function HealthScore({ score }: HealthScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return '#22C55E'; // Green
    if (s >= 60) return '#FACC15'; // Yellow
    if (s >= 40) return '#FB923C'; // Orange
    return '#EF4444'; // Red
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excelente';
    if (s >= 60) return 'Bom';
    if (s >= 40) return 'Atenção';
    return 'Crítico';
  };

  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="health-score">
      <div className="score-circle">
        <svg width="120" height="120">
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="score-value">
          <span className="score-number" style={{ color }}>{score}</span>
          <span className="score-max">/100</span>
        </div>
      </div>
      <div className="score-label" style={{ color }}>
        {getScoreLabel(score)}
      </div>
    </div>
  );
}
