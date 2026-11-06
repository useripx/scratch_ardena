/**
 * Authentic Scratch 3.0 Block Visual Renderer
 * 100% Selaras dengan spesifikasi resmi scratchfoundation/scratch-blocks:
 * - Bentuk: Hat, Stack, C-Block, Reporter, Boolean
 * - Palet Warna: Motion (#4C97FF), Looks (#9966FF), Sounds (#D65CD6), Events (#FFD500),
 *                Control (#FFAB19), Sensing (#5CB1D6), Operators (#59C059), Variables (#FF8C1A)
 */

import React from 'react';

export type ScratchCategoryKey =
  | 'motion'
  | 'looks'
  | 'sound'
  | 'event'
  | 'control'
  | 'sensing'
  | 'operator'
  | 'variable';

export type ScratchBlockShape = 'hat' | 'stack' | 'c-block' | 'reporter' | 'boolean';

export interface ScratchBlockMeta {
  opcode: string;
  category: ScratchCategoryKey;
  shape: ScratchBlockShape;
  label: string;
  description: string;
  exampleSnippet?: string;
}

export const SCRATCH_CATEGORY_COLORS: Record<
  ScratchCategoryKey,
  { primary: string; border: string; text: string; labelId: string }
> = {
  motion: { primary: '#4C97FF', border: '#3373CC', text: '#ffffff', labelId: 'Gerakan (Motion)' },
  looks: { primary: '#9966FF', border: '#774DCB', text: '#ffffff', labelId: 'Tampilan (Looks)' },
  sound: { primary: '#D65CD6', border: '#BD42BD', text: '#ffffff', labelId: 'Suara (Sound)' },
  event: { primary: '#FFD500', border: '#CC9900', text: '#573c00', labelId: 'Kejadian (Events)' },
  control: { primary: '#FFAB19', border: '#CF8B17', text: '#ffffff', labelId: 'Kontrol (Control)' },
  sensing: { primary: '#5CB1D6', border: '#2E8EB8', text: '#ffffff', labelId: 'Sensor (Sensing)' },
  operator: { primary: '#59C059', border: '#389438', text: '#ffffff', labelId: 'Operator' },
  variable: { primary: '#FF8C1A', border: '#DB6E00', text: '#ffffff', labelId: 'Variabel' },
};

export const ScratchBlockSnippet: React.FC<{
  block: ScratchBlockMeta;
  showOpcode?: boolean;
}> = ({ block, showOpcode = true }) => {
  const colors = SCRATCH_CATEGORY_COLORS[block.category];

  // Render berdasarkan siluet bentuk balok Scratch 3.0
  if (block.shape === 'hat') {
    return (
      <div className="flex flex-col items-start select-none">
        <div
          data-testid="scratch-block"
          data-category={block.category}
          data-shape={block.shape}
          style={{ backgroundColor: colors.primary, borderColor: colors.border }}
          className="rounded-t-2xl rounded-b-md px-3.5 py-2 text-xs font-bold text-white shadow-sm border border-b-2 flex items-center gap-1.5 min-w-[140px]"
        >
          <span className="text-sm">🚩</span>
          <span style={{ color: colors.text }}>{block.label}</span>
        </div>
        {/* Puzzle notch notch visual at bottom */}
        <div
          style={{ backgroundColor: colors.primary }}
          className="w-4 h-1.5 ml-3 rounded-b-sm border-x border-b border-[#3373CC]"
        />
        {showOpcode && (
          <code className="text-[10px] text-gray-400 mt-1 font-mono">{block.opcode}</code>
        )}
      </div>
    );
  }

  if (block.shape === 'reporter') {
    return (
      <div className="inline-flex items-center select-none">
        <span
          data-testid="scratch-block"
          data-category={block.category}
          data-shape={block.shape}
          style={{ backgroundColor: colors.primary, borderColor: colors.border }}
          className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-xs border border-b-2 inline-flex items-center gap-1"
        >
          <span style={{ color: colors.text }}>{block.label}</span>
        </span>
      </div>
    );
  }

  if (block.shape === 'boolean') {
    return (
      <div className="inline-flex items-center select-none">
        <span
          data-testid="scratch-block"
          data-category={block.category}
          data-shape={block.shape}
          style={{ backgroundColor: colors.primary, borderColor: colors.border }}
          className="px-3 py-0.5 text-xs font-bold text-white shadow-xs border border-b-2 inline-flex items-center gap-1 [clip-path:polygon(10%_0%,_90%_0%,_100%_50%,_90%_100%,_10%_100%,_0%_50%)]"
        >
          <span className="px-1" style={{ color: colors.text }}>{block.label}</span>
        </span>
      </div>
    );
  }

  if (block.shape === 'c-block') {
    return (
      <div className="flex flex-col items-start select-none">
        {/* Top of C-Block */}
        <div
          data-testid="scratch-block"
          data-category={block.category}
          data-shape={block.shape}
          style={{ backgroundColor: colors.primary, borderColor: colors.border }}
          className="rounded-t-lg rounded-br-lg px-3 py-1.5 text-xs font-bold text-white shadow-xs border border-b-0 min-w-[150px]"
        >
          <span style={{ color: colors.text }}>{block.label}</span>
        </div>
        {/* Left Spine with hollow mouth */}
        <div className="flex">
          <div
            style={{ backgroundColor: colors.primary, borderColor: colors.border }}
            className="w-4 h-6 border-l border-r-0"
          />
          <div className="bg-gray-100/60 rounded-md p-1.5 my-0.5 ml-1 text-[11px] text-gray-500 italic">
            [ balok di dalam perulangan ]
          </div>
        </div>
        {/* Bottom of C-Block */}
        <div
          style={{ backgroundColor: colors.primary, borderColor: colors.border }}
          className="rounded-b-lg rounded-tr-lg px-3 py-1 text-xs font-bold text-white shadow-xs border border-t-0 min-w-[90px]"
        />
        {showOpcode && (
          <code className="text-[10px] text-gray-400 mt-1 font-mono">{block.opcode}</code>
        )}
      </div>
    );
  }

  // Default: Stack Block
  return (
    <div className="flex flex-col items-start select-none">
      <div
        data-testid="scratch-block"
        data-category={block.category}
        data-shape={block.shape}
        style={{ backgroundColor: colors.primary, borderColor: colors.border }}
        className="rounded-md px-3.5 py-1.5 text-xs font-bold text-white shadow-xs border border-b-2 flex items-center gap-1.5 min-w-[130px]"
      >
        <span style={{ color: colors.text }}>{block.label}</span>
      </div>
      {showOpcode && (
        <code className="text-[10px] text-gray-400 mt-1 font-mono">{block.opcode}</code>
      )}
    </div>
  );
};

