import { ScratchBlockCategory, ScratchBlockType, ScratchBlockArg } from './ScratchSvgBlock';

export interface ScratchBlockDef {
  id: string;
  category: ScratchBlockCategory;
  type: ScratchBlockType;
  argsId: ScratchBlockArg[];
  argsEn: ScratchBlockArg[];
  defaultWidth?: number;
}

export const SCRATCH_BLOCKS_LIBRARY: Record<ScratchBlockCategory, ScratchBlockDef[]> = {
  event: [
    {
      id: 'event_whenflagclicked',
      category: 'event',
      type: 'hat',
      argsId: [
        { type: 'icon', value: '🚩' },
        { type: 'text', value: 'ketika bendera hijau diklik' },
      ],
      argsEn: [
        { type: 'icon', value: '🚩' },
        { type: 'text', value: 'when green flag clicked' },
      ],
      defaultWidth: 230,
    },
    {
      id: 'event_whenkeypressed',
      category: 'event',
      type: 'hat',
      argsId: [
        { type: 'text', value: 'ketika tombol' },
        { type: 'dropdown', value: 'spasi' },
        { type: 'text', value: 'ditekan' },
      ],
      argsEn: [
        { type: 'text', value: 'when' },
        { type: 'dropdown', value: 'space' },
        { type: 'text', value: 'key pressed' },
      ],
      defaultWidth: 240,
    },
    {
      id: 'event_whenthisspriteclicked',
      category: 'event',
      type: 'hat',
      argsId: [{ type: 'text', value: 'ketika sprite ini diklik' }],
      argsEn: [{ type: 'text', value: 'when this sprite clicked' }],
      defaultWidth: 200,
    },
  ],

  motion: [
    {
      id: 'motion_movesteps',
      category: 'motion',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'gerak' },
        { type: 'number-input', value: 10 },
        { type: 'text', value: 'langkah' },
      ],
      argsEn: [
        { type: 'text', value: 'move' },
        { type: 'number-input', value: 10 },
        { type: 'text', value: 'steps' },
      ],
      defaultWidth: 175,
    },
    {
      id: 'motion_turnright',
      category: 'motion',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'putar' },
        { type: 'icon', value: '↻' },
        { type: 'number-input', value: 15 },
        { type: 'text', value: 'derajat' },
      ],
      argsEn: [
        { type: 'text', value: 'turn' },
        { type: 'icon', value: '↻' },
        { type: 'number-input', value: 15 },
        { type: 'text', value: 'degrees' },
      ],
      defaultWidth: 185,
    },
    {
      id: 'motion_gotoxy',
      category: 'motion',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'pergi ke x:' },
        { type: 'number-input', value: 0 },
        { type: 'text', value: 'y:' },
        { type: 'number-input', value: 0 },
      ],
      argsEn: [
        { type: 'text', value: 'go to x:' },
        { type: 'number-input', value: 0 },
        { type: 'text', value: 'y:' },
        { type: 'number-input', value: 0 },
      ],
      defaultWidth: 205,
    },
    {
      id: 'motion_changexby',
      category: 'motion',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'ubah x sebesar' },
        { type: 'number-input', value: 10 },
      ],
      argsEn: [
        { type: 'text', value: 'change x by' },
        { type: 'number-input', value: 10 },
      ],
      defaultWidth: 175,
    },
  ],

  control: [
    {
      id: 'control_forever',
      category: 'control',
      type: 'c-block',
      argsId: [
        { type: 'icon', value: '🔄' },
        { type: 'text', value: 'selamanya' },
      ],
      argsEn: [
        { type: 'icon', value: '🔄' },
        { type: 'text', value: 'forever' },
      ],
      defaultWidth: 190,
    },
    {
      id: 'control_repeat',
      category: 'control',
      type: 'c-block',
      argsId: [
        { type: 'text', value: 'ulangi' },
        { type: 'number-input', value: 10 },
        { type: 'text', value: 'kali' },
      ],
      argsEn: [
        { type: 'text', value: 'repeat' },
        { type: 'number-input', value: 10 },
      ],
      defaultWidth: 180,
    },
    {
      id: 'control_wait',
      category: 'control',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'tunggu' },
        { type: 'number-input', value: 1 },
        { type: 'text', value: 'detik' },
      ],
      argsEn: [
        { type: 'text', value: 'wait' },
        { type: 'number-input', value: 1 },
        { type: 'text', value: 'seconds' },
      ],
      defaultWidth: 170,
    },
  ],

  variable: [
    {
      id: 'data_setvariableto',
      category: 'variable',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'atur' },
        { type: 'dropdown', value: 'Skor' },
        { type: 'text', value: 'ke' },
        { type: 'number-input', value: 0 },
      ],
      argsEn: [
        { type: 'text', value: 'set' },
        { type: 'dropdown', value: 'Score' },
        { type: 'text', value: 'to' },
        { type: 'number-input', value: 0 },
      ],
      defaultWidth: 195,
    },
    {
      id: 'data_changevariableby',
      category: 'variable',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'ubah' },
        { type: 'dropdown', value: 'Skor' },
        { type: 'text', value: 'sebesar' },
        { type: 'number-input', value: 1 },
      ],
      argsEn: [
        { type: 'text', value: 'change' },
        { type: 'dropdown', value: 'Score' },
        { type: 'text', value: 'by' },
        { type: 'number-input', value: 1 },
      ],
      defaultWidth: 215,
    },
    {
      id: 'data_variable',
      category: 'variable',
      type: 'reporter',
      argsId: [{ type: 'text', value: 'Skor' }],
      argsEn: [{ type: 'text', value: 'Score' }],
    },
  ],

  looks: [
    {
      id: 'looks_sayforsecs',
      category: 'looks',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'katakan' },
        { type: 'string-input', value: 'Halo!' },
        { type: 'text', value: 'selama' },
        { type: 'number-input', value: 2 },
        { type: 'text', value: 'detik' },
      ],
      argsEn: [
        { type: 'text', value: 'say' },
        { type: 'string-input', value: 'Hello!' },
        { type: 'text', value: 'for' },
        { type: 'number-input', value: 2 },
        { type: 'text', value: 'seconds' },
      ],
      defaultWidth: 240,
    },
    {
      id: 'looks_nextcostume',
      category: 'looks',
      type: 'stack',
      argsId: [{ type: 'text', value: 'kostum berikutnya' }],
      argsEn: [{ type: 'text', value: 'next costume' }],
      defaultWidth: 170,
    },
  ],

  sound: [
    {
      id: 'sound_playuntildone',
      category: 'sound',
      type: 'stack',
      argsId: [
        { type: 'text', value: 'mainkan suara' },
        { type: 'dropdown', value: 'pop' },
        { type: 'text', value: 'sampai selesai' },
      ],
      argsEn: [
        { type: 'text', value: 'play sound' },
        { type: 'dropdown', value: 'pop' },
        { type: 'text', value: 'until done' },
      ],
      defaultWidth: 240,
    },
  ],

  sensing: [
    {
      id: 'sensing_touchingobject',
      category: 'sensing',
      type: 'boolean',
      argsId: [
        { type: 'text', value: 'menyentuh' },
        { type: 'dropdown', value: 'Player' },
        { type: 'text', value: '?' },
      ],
      argsEn: [
        { type: 'text', value: 'touching' },
        { type: 'dropdown', value: 'Player' },
        { type: 'text', value: '?' },
      ],
    },
  ],

  operator: [
    {
      id: 'operator_add',
      category: 'operator',
      type: 'reporter',
      argsId: [
        { type: 'number-input', value: '' },
        { type: 'text', value: '+' },
        { type: 'number-input', value: '' },
      ],
      argsEn: [
        { type: 'number-input', value: '' },
        { type: 'text', value: '+' },
        { type: 'number-input', value: '' },
      ],
    },
    {
      id: 'operator_random',
      category: 'operator',
      type: 'reporter',
      argsId: [
        { type: 'text', value: 'pilih acak' },
        { type: 'number-input', value: 1 },
        { type: 'text', value: 'hingga' },
        { type: 'number-input', value: 10 },
      ],
      argsEn: [
        { type: 'text', value: 'pick random' },
        { type: 'number-input', value: 1 },
        { type: 'text', value: 'to' },
        { type: 'number-input', value: 10 },
      ],
    },
  ],
};

