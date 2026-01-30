import { type PortraitData, type Sex, type CultureId, type TitleRank } from '@/lib/gameTypes';

interface PortraitProps {
  portrait: PortraitData;
  sex: Sex;
  culture: CultureId;
  rank?: TitleRank | null;
  alive: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SKIN_TONES = [
  '#FFDFC4', '#F0C8A8', '#D4A574', '#C68642', '#8D5524', '#5C3A21'
];

const HAIR_COLORS = [
  '#2C1810', '#4A3728', '#8B4513', '#D2691E', '#FFD700', '#C0C0C0', '#1C1C1C', '#8B0000'
];

const CULTURE_CLOTHING_COLORS: Record<CultureId, { primary: string; secondary: string }> = {
  anglo: { primary: '#1E3A5F', secondary: '#8B4513' },
  frankish: { primary: '#4A0E4E', secondary: '#FFD700' },
  norse: { primary: '#2F4F4F', secondary: '#B8860B' },
  iberian: { primary: '#8B0000', secondary: '#FFD700' },
};

const RANK_HEADWEAR: Record<TitleRank, string> = {
  barony: 'circlet',
  county: 'coronet',
  duchy: 'ducal',
  kingdom: 'crown',
  empire: 'imperial',
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function Portrait({ portrait, sex, culture, rank, alive, size = 'md', className = '' }: PortraitProps) {
  const rand = seededRandom(portrait.seed);
  
  const sizes = {
    sm: { width: 40, height: 50 },
    md: { width: 60, height: 75 },
    lg: { width: 80, height: 100 },
    xl: { width: 120, height: 150 },
  };
  
  const { width, height } = sizes[size];
  const centerX = width / 2;
  const centerY = height / 2;
  
  const skinTone = SKIN_TONES[portrait.skinTone % SKIN_TONES.length];
  const hairColor = HAIR_COLORS[portrait.hairColor % HAIR_COLORS.length];
  const clothingColors = CULTURE_CLOTHING_COLORS[culture];
  
  const headWidth = width * 0.45;
  const headHeight = height * 0.38;
  const headY = height * 0.32;
  
  const headShapes = [
    `M${centerX - headWidth/2},${headY + headHeight * 0.3} 
     Q${centerX - headWidth/2},${headY} ${centerX},${headY - headHeight * 0.1}
     Q${centerX + headWidth/2},${headY} ${centerX + headWidth/2},${headY + headHeight * 0.3}
     Q${centerX + headWidth/2},${headY + headHeight} ${centerX},${headY + headHeight * 1.1}
     Q${centerX - headWidth/2},${headY + headHeight} ${centerX - headWidth/2},${headY + headHeight * 0.3}`,
    `M${centerX - headWidth/2},${headY + headHeight * 0.2} 
     Q${centerX - headWidth/2.2},${headY - headHeight * 0.1} ${centerX},${headY - headHeight * 0.15}
     Q${centerX + headWidth/2.2},${headY - headHeight * 0.1} ${centerX + headWidth/2},${headY + headHeight * 0.2}
     Q${centerX + headWidth/2.1},${headY + headHeight * 0.9} ${centerX},${headY + headHeight}
     Q${centerX - headWidth/2.1},${headY + headHeight * 0.9} ${centerX - headWidth/2},${headY + headHeight * 0.2}`,
    `M${centerX - headWidth/2.2},${headY + headHeight * 0.25} 
     Q${centerX - headWidth/2},${headY} ${centerX},${headY - headHeight * 0.05}
     Q${centerX + headWidth/2},${headY} ${centerX + headWidth/2.2},${headY + headHeight * 0.25}
     Q${centerX + headWidth/2.3},${headY + headHeight * 0.85} ${centerX},${headY + headHeight * 1.05}
     Q${centerX - headWidth/2.3},${headY + headHeight * 0.85} ${centerX - headWidth/2.2},${headY + headHeight * 0.25}`,
  ];
  
  const headPath = headShapes[portrait.headShape % headShapes.length];
  
  const eyeY = headY + headHeight * 0.35;
  const eyeSpacing = headWidth * 0.28;
  const eyeWidth = headWidth * 0.18;
  const eyeHeight = headHeight * 0.12;
  
  const eyeStyles = [
    { shape: 'almond', lidOffset: 0.15 },
    { shape: 'round', lidOffset: 0.1 },
    { shape: 'narrow', lidOffset: 0.2 },
  ];
  const eyeStyle = eyeStyles[portrait.eyeStyle % eyeStyles.length];
  
  const noseY = headY + headHeight * 0.55;
  const noseHeight = headHeight * 0.25;
  
  const mouthY = headY + headHeight * 0.78;
  const mouthWidth = headWidth * 0.3;
  
  const hairStyles = sex === 'male' ? [
    { type: 'short', path: `M${centerX - headWidth/1.8},${headY} Q${centerX},${headY - headHeight * 0.3} ${centerX + headWidth/1.8},${headY} L${centerX + headWidth/2},${headY + headHeight * 0.15} L${centerX - headWidth/2},${headY + headHeight * 0.15} Z` },
    { type: 'medium', path: `M${centerX - headWidth/1.6},${headY + headHeight * 0.1} Q${centerX - headWidth/1.5},${headY - headHeight * 0.2} ${centerX},${headY - headHeight * 0.35} Q${centerX + headWidth/1.5},${headY - headHeight * 0.2} ${centerX + headWidth/1.6},${headY + headHeight * 0.1} L${centerX + headWidth/2.2},${headY + headHeight * 0.25} L${centerX - headWidth/2.2},${headY + headHeight * 0.25} Z` },
    { type: 'bald', path: '' },
    { type: 'receding', path: `M${centerX - headWidth/2.5},${headY + headHeight * 0.05} Q${centerX},${headY - headHeight * 0.1} ${centerX + headWidth/2.5},${headY + headHeight * 0.05} L${centerX + headWidth/2.3},${headY + headHeight * 0.12} L${centerX - headWidth/2.3},${headY + headHeight * 0.12} Z` },
  ] : [
    { type: 'long', path: `M${centerX - headWidth/1.5},${headY} Q${centerX},${headY - headHeight * 0.4} ${centerX + headWidth/1.5},${headY} L${centerX + headWidth/1.3},${headY + headHeight * 1.5} Q${centerX},${headY + headHeight * 1.6} ${centerX - headWidth/1.3},${headY + headHeight * 1.5} Z` },
    { type: 'braided', path: `M${centerX - headWidth/1.6},${headY} Q${centerX},${headY - headHeight * 0.35} ${centerX + headWidth/1.6},${headY} L${centerX + headWidth/1.4},${headY + headHeight * 1.3} L${centerX - headWidth/1.4},${headY + headHeight * 1.3} Z` },
    { type: 'updo', path: `M${centerX - headWidth/1.7},${headY - headHeight * 0.05} Q${centerX - headWidth/2},${headY - headHeight * 0.4} ${centerX},${headY - headHeight * 0.5} Q${centerX + headWidth/2},${headY - headHeight * 0.4} ${centerX + headWidth/1.7},${headY - headHeight * 0.05} L${centerX + headWidth/2.2},${headY + headHeight * 0.2} L${centerX - headWidth/2.2},${headY + headHeight * 0.2} Z` },
    { type: 'veiled', path: `M${centerX - headWidth/1.4},${headY - headHeight * 0.1} Q${centerX},${headY - headHeight * 0.35} ${centerX + headWidth/1.4},${headY - headHeight * 0.1} L${centerX + headWidth/1.2},${headY + headHeight * 1.4} Q${centerX},${headY + headHeight * 1.5} ${centerX - headWidth/1.2},${headY + headHeight * 1.4} Z` },
  ];
  
  const hairStyle = hairStyles[portrait.hairStyle % hairStyles.length];
  
  const beardStyles = sex === 'male' ? [
    { type: 'none', path: '' },
    { type: 'stubble', path: '' },
    { type: 'short', path: `M${centerX - headWidth * 0.3},${headY + headHeight * 0.7} Q${centerX},${headY + headHeight * 1.15} ${centerX + headWidth * 0.3},${headY + headHeight * 0.7} L${centerX + headWidth * 0.25},${headY + headHeight * 0.65} L${centerX - headWidth * 0.25},${headY + headHeight * 0.65} Z` },
    { type: 'full', path: `M${centerX - headWidth * 0.38},${headY + headHeight * 0.5} Q${centerX - headWidth * 0.4},${headY + headHeight * 1.1} ${centerX},${headY + headHeight * 1.3} Q${centerX + headWidth * 0.4},${headY + headHeight * 1.1} ${centerX + headWidth * 0.38},${headY + headHeight * 0.5} L${centerX + headWidth * 0.32},${headY + headHeight * 0.45} L${centerX - headWidth * 0.32},${headY + headHeight * 0.45} Z` },
  ] : [{ type: 'none', path: '' }];
  
  const beardStyle = beardStyles[portrait.beardStyle % beardStyles.length];
  
  const clothingY = height * 0.72;
  
  const renderCrown = () => {
    if (!rank) return null;
    const crownY = headY - headHeight * 0.25;
    const crownWidth = headWidth * 0.6;
    const crownHeight = headHeight * 0.25;
    
    const crownColors: Record<TitleRank, { main: string; gem: string }> = {
      barony: { main: '#B8860B', gem: '#4169E1' },
      county: { main: '#C0C0C0', gem: '#DC143C' },
      duchy: { main: '#FFD700', gem: '#50C878' },
      kingdom: { main: '#FFD700', gem: '#9400D3' },
      empire: { main: '#FFD700', gem: '#DC143C' },
    };
    
    const colors = crownColors[rank];
    
    if (rank === 'barony') {
      return (
        <g>
          <ellipse cx={centerX} cy={crownY + crownHeight * 0.7} rx={crownWidth * 0.6} ry={crownHeight * 0.3} fill={colors.main} stroke="#8B7500" strokeWidth="0.5" />
          <circle cx={centerX} cy={crownY + crownHeight * 0.4} r={crownHeight * 0.15} fill={colors.gem} />
        </g>
      );
    }
    
    const points = rank === 'empire' ? 7 : rank === 'kingdom' ? 5 : rank === 'duchy' ? 4 : 3;
    let crownPath = `M${centerX - crownWidth/2},${crownY + crownHeight}`;
    
    for (let i = 0; i <= points; i++) {
      const x = centerX - crownWidth/2 + (crownWidth / points) * i;
      const isPoint = i % 1 === 0 && i < points;
      if (isPoint) {
        crownPath += ` L${x + crownWidth/(points*2)},${crownY}`;
      }
      if (i < points) {
        crownPath += ` L${x + crownWidth/points},${crownY + crownHeight * 0.6}`;
      }
    }
    crownPath += ` L${centerX + crownWidth/2},${crownY + crownHeight} Z`;
    
    return (
      <g>
        <path d={crownPath} fill={colors.main} stroke="#8B7500" strokeWidth="0.5" />
        <ellipse cx={centerX} cy={crownY + crownHeight * 0.85} rx={crownWidth * 0.55} ry={crownHeight * 0.2} fill={colors.main} stroke="#8B7500" strokeWidth="0.5" />
        {Array.from({ length: Math.min(points, 3) }).map((_, i) => (
          <circle 
            key={i} 
            cx={centerX + (i - 1) * crownWidth * 0.25} 
            cy={crownY + crownHeight * 0.5} 
            r={crownHeight * 0.1} 
            fill={colors.gem} 
          />
        ))}
      </g>
    );
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className={`rounded-md ${!alive ? 'grayscale opacity-70' : ''}`}
      >
        <defs>
          <linearGradient id={`bg-${portrait.seed}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={clothingColors.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={clothingColors.secondary} stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={`skin-${portrait.seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={skinTone} />
            <stop offset="100%" stopColor={skinTone} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        
        <rect x="0" y="0" width={width} height={height} fill={`url(#bg-${portrait.seed})`} />
        
        <path 
          d={`M${centerX - width * 0.4},${clothingY} 
              Q${centerX},${clothingY - height * 0.05} ${centerX + width * 0.4},${clothingY}
              L${width},${height} L0,${height} Z`}
          fill={clothingColors.primary}
        />
        <path 
          d={`M${centerX - width * 0.15},${clothingY} 
              Q${centerX},${clothingY + height * 0.08} ${centerX + width * 0.15},${clothingY}
              L${centerX + width * 0.1},${height} L${centerX - width * 0.1},${height} Z`}
          fill={clothingColors.secondary}
        />
        
        <ellipse 
          cx={centerX} 
          cy={clothingY - height * 0.02} 
          rx={width * 0.12} 
          ry={height * 0.04}
          fill={skinTone}
        />
        
        {hairStyle.path && hairStyle.type === 'long' && (
          <path d={hairStyle.path} fill={hairColor} opacity="0.9" />
        )}
        
        <path d={headPath} fill={`url(#skin-${portrait.seed})`} stroke={skinTone} strokeWidth="0.5" />
        
        <g>
          <ellipse 
            cx={centerX - eyeSpacing} 
            cy={eyeY} 
            rx={eyeWidth} 
            ry={eyeHeight}
            fill="white"
          />
          <ellipse 
            cx={centerX - eyeSpacing} 
            cy={eyeY} 
            rx={eyeWidth * 0.5} 
            ry={eyeHeight * 0.7}
            fill="#4A3728"
          />
          <ellipse 
            cx={centerX - eyeSpacing} 
            cy={eyeY} 
            rx={eyeWidth * 0.25} 
            ry={eyeHeight * 0.35}
            fill="#1C1C1C"
          />
          <ellipse 
            cx={centerX - eyeSpacing + eyeWidth * 0.15} 
            cy={eyeY - eyeHeight * 0.2} 
            rx={eyeWidth * 0.1} 
            ry={eyeHeight * 0.15}
            fill="white"
            opacity="0.7"
          />
          
          <ellipse 
            cx={centerX + eyeSpacing} 
            cy={eyeY} 
            rx={eyeWidth} 
            ry={eyeHeight}
            fill="white"
          />
          <ellipse 
            cx={centerX + eyeSpacing} 
            cy={eyeY} 
            rx={eyeWidth * 0.5} 
            ry={eyeHeight * 0.7}
            fill="#4A3728"
          />
          <ellipse 
            cx={centerX + eyeSpacing} 
            cy={eyeY} 
            rx={eyeWidth * 0.25} 
            ry={eyeHeight * 0.35}
            fill="#1C1C1C"
          />
          <ellipse 
            cx={centerX + eyeSpacing + eyeWidth * 0.15} 
            cy={eyeY - eyeHeight * 0.2} 
            rx={eyeWidth * 0.1} 
            ry={eyeHeight * 0.15}
            fill="white"
            opacity="0.7"
          />
          
          <path 
            d={`M${centerX - eyeSpacing - eyeWidth * 1.1},${eyeY - eyeHeight * 0.8} Q${centerX - eyeSpacing},${eyeY - eyeHeight * 1.3} ${centerX - eyeSpacing + eyeWidth * 1.1},${eyeY - eyeHeight * 0.6}`}
            stroke={hairColor}
            strokeWidth="1.5"
            fill="none"
          />
          <path 
            d={`M${centerX + eyeSpacing - eyeWidth * 1.1},${eyeY - eyeHeight * 0.6} Q${centerX + eyeSpacing},${eyeY - eyeHeight * 1.3} ${centerX + eyeSpacing + eyeWidth * 1.1},${eyeY - eyeHeight * 0.8}`}
            stroke={hairColor}
            strokeWidth="1.5"
            fill="none"
          />
        </g>
        
        <path 
          d={`M${centerX},${noseY - noseHeight * 0.3} 
              Q${centerX + headWidth * 0.08},${noseY + noseHeight * 0.3} ${centerX},${noseY + noseHeight * 0.5}
              Q${centerX - headWidth * 0.05},${noseY + noseHeight * 0.55} ${centerX - headWidth * 0.08},${noseY + noseHeight * 0.4}`}
          stroke={`${skinTone}99`}
          strokeWidth="1"
          fill="none"
        />
        
        <path 
          d={`M${centerX - mouthWidth/2},${mouthY} Q${centerX},${mouthY + headHeight * 0.08} ${centerX + mouthWidth/2},${mouthY}`}
          stroke="#8B4513"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        
        {beardStyle.path && (
          <path d={beardStyle.path} fill={hairColor} opacity="0.85" />
        )}
        
        {hairStyle.path && hairStyle.type !== 'long' && (
          <path d={hairStyle.path} fill={hairColor} />
        )}
        
        {renderCrown()}
      </svg>
      
      {!alive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
}
