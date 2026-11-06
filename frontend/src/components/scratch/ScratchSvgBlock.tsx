import React from 'react';

export type ScratchBlockCategory =
  | 'motion'
  | 'looks'
  | 'sound'
  | 'event'
  | 'control'
  | 'sensing'
  | 'operator'
  | 'variable';

export type ScratchBlockType = 'hat' | 'stack' | 'c-block' | 'reporter' | 'boolean';

export interface ScratchBlockArg {
  type: 'text' | 'number-input' | 'string-input' | 'dropdown' | 'icon';
  value: string | number;
  options?: string[];
}

export interface ScratchSvgBlockProps {
  category: ScratchBlockCategory;
  type: ScratchBlockType;
  args: ScratchBlockArg[];
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const SCRATCH_COLORS: Record<
  ScratchBlockCategory,
  { fill: string; stroke: string; text: string }
> = {
  motion: { fill: '#4C97FF', stroke: '#3373CC', text: '#ffffff' },
  looks: { fill: '#9966FF', stroke: '#774DCB', text: '#ffffff' },
  sound: { fill: '#D65CD6', stroke: '#BD42BD', text: '#ffffff' },
  event: { fill: '#FFBF00', stroke: '#CC9900', text: '#573c00' },
  control: { fill: '#FFAB19', stroke: '#CF8B17', text: '#ffffff' },
  sensing: { fill: '#5CB1D6', stroke: '#2E8EB8', text: '#ffffff' },
  operator: { fill: '#59C059', stroke: '#389438', text: '#ffffff' },
  variable: { fill: '#FF8C1A', stroke: '#DB6E00', text: '#ffffff' },
};

export const ScratchSvgBlock: React.FC<ScratchSvgBlockProps> = ({
  category,
  type,
  args,
  width = 240,
  height = 42,
  className = '',
  onClick,
  children,
}) => {
  const colors = SCRATCH_COLORS[category] || SCRATCH_COLORS.motion;

  // Render Stack Block Path (Scratch 3.0 Jigsaw Notch on top and bottom)
  const renderStackPath = (w: number, h: number) => {
    return `
      M 0,4 
      A 4,4 0 0,1 4,0 
      H 12 
      c 2,0 3,1 4,2 
      l 4,4 
      c 1,1 2,2 4,2 
      h 12 
      c 2,0 3,-1 4,-2 
      l 4,-4 
      c 1,-1 2,-2 4,-2 
      H ${w - 4} 
      A 4,4 0 0,1 ${w},4 
      V ${h - 4} 
      A 4,4 0 0,1 ${w - 4},${h} 
      H 48 
      c -2,0 -3,1 -4,2 
      l -4,4 
      c -1,1 -2,2 -4,2 
      h -12 
      c -2,0 -3,-1 -4,-2 
      l -4,-4 
      c -1,-1 -2,-2 -4,-2 
      H 4 
      A 4,4 0 0,1 0,${h - 4} 
      Z
    `;
  };

  // Render Hat Block Path (Iconic Scratch 3.0 Hat Dome curve on top, puzzle tab at bottom)
  const renderHatPath = (w: number, h: number) => {
    return `
      M 0,16 
      c 0,-4 3,-10 12,-14 
      c 18,-8 52,-8 70,0 
      c 8,4 12,10 12,14 
      H ${w - 4} 
      A 4,4 0 0,1 ${w},20 
      V ${h - 4} 
      A 4,4 0 0,1 ${w - 4},${h} 
      H 48 
      c -2,0 -3,1 -4,2 
      l -4,4 
      c -1,1 -2,2 -4,2 
      h -12 
      c -2,0 -3,-1 -4,-2 
      l -4,-4 
      c -1,-1 -2,-2 -4,-2 
      H 4 
      A 4,4 0 0,1 0,${h - 4} 
      Z
    `;
  };

  // Render C-Block Path (Loop with inner mouth)
  const renderCBlockPath = (w: number, totalH: number) => {
    const topBarH = 34;
    const bottomBarH = 24;
    const mouthW = w - 18;
    return `
      M 0,4 
      A 4,4 0 0,1 4,0 
      H 12 
      c 2,0 3,1 4,2 
      l 4,4 
      c 1,1 2,2 4,2 
      h 12 
      c 2,0 3,-1 4,-2 
      l 4,-4 
      c 1,-1 2,-2 4,-2 
      H ${w - 4} 
      A 4,4 0 0,1 ${w},4 
      V ${topBarH - 4} 
      A 4,4 0 0,1 ${w - 4},${topBarH} 
      H 48 
      c -2,0 -3,1 -4,2 
      l -4,4 
      c -1,1 -2,2 -4,2 
      h -12 
      c -2,0 -3,-1 -4,-2 
      l -4,-4 
      c -1,-1 -2,-2 -4,-2 
      H 22 
      A 4,4 0 0,0 18,${topBarH + 4} 
      V ${totalH - bottomBarH - 4} 
      A 4,4 0 0,0 22,${totalH - bottomBarH} 
      H 12 
      c 2,0 3,1 4,2 
      l 4,4 
      c 1,1 2,2 4,2 
      h 12 
      c 2,0 3,-1 4,-2 
      l 4,-4 
      c 1,-1 2,-2 4,-2 
      H ${mouthW - 4} 
      A 4,4 0 0,1 ${mouthW},${totalH - bottomBarH + 4} 
      V ${totalH - 4} 
      A 4,4 0 0,1 ${mouthW - 4},${totalH} 
      H 48 
      c -2,0 -3,1 -4,2 
      l -4,4 
      c -1,1 -2,2 -4,2 
      h -12 
      c -2,0 -3,-1 -4,-2 
      l -4,-4 
      c -1,-1 -2,-2 -4,-2 
      H 4 
      A 4,4 0 0,1 0,${totalH - 4} 
      Z
    `;
  };

  // Reporter Block Shape (Rounded Capsule Pill)
  if (type === 'reporter') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-xs select-none cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
        style={{
          backgroundColor: colors.fill,
          borderColor: colors.stroke,
          borderWidth: '1px',
          color: colors.text,
        }}
      >
        {args.map((arg, i) => (
          <span key={i} className="mx-0.5">
            {arg.value}
          </span>
        ))}
      </div>
    );
  }

  // Boolean Block Shape (Pointed Hexagon)
  if (type === 'boolean') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center px-4 py-1 text-xs font-bold shadow-xs select-none cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
        style={{
          backgroundColor: colors.fill,
          color: colors.text,
          clipPath:
            'polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%)',
        }}
      >
        {args.map((arg, i) => (
          <span key={i} className="mx-0.5">
            {arg.value}
          </span>
        ))}
      </div>
    );
  }

  // C-Block Container with nested children
  if (type === 'c-block') {
    const totalHeight = height > 60 ? height : 90;
    return (
      <div
        onClick={onClick}
        className={`relative inline-block select-none cursor-pointer group ${className}`}
        style={{ width }}
      >
        <svg
          width={width}
          height={totalHeight + 8}
          className="overflow-visible filter drop-shadow-sm"
        >
          <path
            d={renderCBlockPath(width, totalHeight)}
            fill={colors.fill}
            stroke={colors.stroke}
            strokeWidth="1"
          />
        </svg>

        {/* Content on Top Bar */}
        <div className="absolute top-1.5 left-4 right-4 flex items-center gap-1.5 text-xs font-bold text-white z-10">
          {args.map((arg, i) => {
            if (arg.type === 'icon') {
              return <span key={i}>{arg.value}</span>;
            }
            if (arg.type === 'number-input' || arg.type === 'string-input') {
              return (
                <span
                  key={i}
                  className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-inner"
                >
                  {arg.value}
                </span>
              );
            }
            return <span key={i} style={{ color: colors.text }}>{arg.value}</span>;
          })}
        </div>

        {/* Nested Inner Content Slot */}
        <div className="absolute top-[36px] left-[24px] right-2 min-h-[28px] flex flex-col gap-1 z-10 py-1">
          {children || (
            <div className="text-[11px] text-white/70 italic px-2 py-1">
              {category === 'control' ? '[ Tarik balok ke sini ]' : ''}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard Hat or Stack Block SVG Rendering
  const effectiveHeight = type === 'hat' ? Math.max(height, 50) : height;
  const pathData =
    type === 'hat'
      ? renderHatPath(width, effectiveHeight)
      : renderStackPath(width, effectiveHeight);

  const topOffset = type === 'hat' ? 'top-4' : 'top-2';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none cursor-grab active:cursor-grabbing group ${className}`}
      style={{ width }}
    >
      <svg
        width={width}
        height={effectiveHeight + 8}
        className="overflow-visible filter drop-shadow-sm transition-transform duration-100 group-hover:-translate-y-0.5"
      >
        <path
          d={pathData}
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth="1"
        />
      </svg>

      {/* Floating Field Content Inside the Block */}
      <div
        className={`absolute ${topOffset} left-3.5 right-3.5 flex items-center gap-1.5 text-xs font-bold text-white z-10 pointer-events-none`}
      >
        {args.map((arg, i) => {
          if (arg.type === 'icon') {
            return (
              <span key={i} className="text-sm">
                {arg.value}
              </span>
            );
          }
          if (arg.type === 'number-input' || arg.type === 'string-input') {
            return (
              <span
                key={i}
                className="bg-white text-gray-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-inner border border-gray-200"
              >
                {arg.value}
              </span>
            );
          }
          if (arg.type === 'dropdown') {
            return (
              <span
                key={i}
                className="bg-black/20 text-white px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1"
              >
                <span>{arg.value}</span>
                <span className="text-[9px]">▼</span>
              </span>
            );
          }
          return (
            <span key={i} style={{ color: colors.text }}>
              {arg.value}
            </span>
          );
        })}
      </div>
    </div>
  );
};

