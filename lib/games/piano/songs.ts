export interface Note {
  time: number; // In seconds
  lane: number; // 0 to 3
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  notes: Note[];
}

export const PIANO_SONGS: Song[] = [
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    artist: 'Classic',
    bpm: 100,
    duration: 12,
    notes: [
      { time: 0.0, lane: 0 }, { time: 0.5, lane: 0 }, { time: 1.0, lane: 2 }, { time: 1.5, lane: 2 },
      { time: 2.0, lane: 3 }, { time: 2.5, lane: 3 }, { time: 3.0, lane: 2 },
      { time: 4.0, lane: 1 }, { time: 4.5, lane: 1 }, { time: 5.0, lane: 0 }, { time: 5.5, lane: 0 },
      { time: 6.0, lane: 3 }, { time: 6.5, lane: 1 }, { time: 7.0, lane: 0 },
    ]
  },
  {
    id: 'jingle-bells',
    title: 'Jingle Bells',
    artist: 'Christmas',
    bpm: 120,
    duration: 15,
    notes: [
      { time: 0.0, lane: 1 }, { time: 0.4, lane: 1 }, { time: 0.8, lane: 1 },
      { time: 1.6, lane: 1 }, { time: 2.0, lane: 1 }, { time: 2.4, lane: 1 },
      { time: 3.2, lane: 1 }, { time: 3.6, lane: 3 }, { time: 4.0, lane: 0 }, { time: 4.4, lane: 1 }, { time: 4.8, lane: 2 },
    ]
  }
];
