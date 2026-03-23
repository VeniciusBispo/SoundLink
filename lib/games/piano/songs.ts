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
    duration: 15,
    notes: [
      { time: 0.0, lane: 0 }, { time: 0.5, lane: 0 }, { time: 1.0, lane: 2 }, { time: 1.5, lane: 2 },
      { time: 2.0, lane: 3 }, { time: 2.5, lane: 3 }, { time: 3.0, lane: 2 },
      { time: 4.0, lane: 1 }, { time: 4.5, lane: 1 }, { time: 5.0, lane: 0 }, { time: 5.5, lane: 0 },
      { time: 6.0, lane: 3 }, { time: 6.5, lane: 1 }, { time: 7.0, lane: 0 },
      { time: 8.0, lane: 2 }, { time: 8.5, lane: 2 }, { time: 9.0, lane: 1 }, { time: 9.5, lane: 1 },
      { time: 10.0, lane: 0 }, { time: 10.5, lane: 0 }, { time: 11.0, lane: 3 }
    ]
  },
  {
    id: 'jingle-bells',
    title: 'Jingle Bells',
    artist: 'Christmas',
    bpm: 120,
    duration: 18,
    notes: [
      { time: 0.0, lane: 1 }, { time: 0.4, lane: 1 }, { time: 0.8, lane: 1 },
      { time: 1.2, lane: 1 }, { time: 1.6, lane: 1 }, { time: 2.0, lane: 1 },
      { time: 2.4, lane: 1 }, { time: 2.8, lane: 3 }, { time: 3.2, lane: 0 }, { time: 3.6, lane: 1 }, { time: 4.0, lane: 2 },
      { time: 4.8, lane: 2 }, { time: 5.2, lane: 2 }, { time: 5.6, lane: 2 }, { time: 6.0, lane: 2 },
      { time: 6.4, lane: 1 }, { time: 6.8, lane: 1 }, { time: 7.2, lane: 1 }, { time: 7.6, lane: 1 }
    ]
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy',
    artist: 'Beethoven',
    bpm: 110,
    duration: 20,
    notes: [
      { time: 0.0, lane: 2 }, { time: 0.5, lane: 2 }, { time: 1.0, lane: 3 }, { time: 1.5, lane: 3 },
      { time: 2.0, lane: 3 }, { time: 2.5, lane: 2 }, { time: 3.0, lane: 1 }, { time: 3.5, lane: 0 },
      { time: 4.0, lane: 0 }, { time: 4.5, lane: 1 }, { time: 5.0, lane: 2 }, { time: 5.5, lane: 2 },
      { time: 6.0, lane: 1 }, { time: 6.5, lane: 1 },
      { time: 8.0, lane: 2 }, { time: 8.5, lane: 2 }, { time: 9.0, lane: 3 }, { time: 9.5, lane: 3 },
      { time: 10.0, lane: 3 }, { time: 10.5, lane: 2 }, { time: 11.0, lane: 1 }, { time: 11.5, lane: 0 },
    ]
  },
  {
    id: 'fuer-elise',
    title: 'Für Elise',
    artist: 'Beethoven',
    bpm: 125,
    duration: 15,
    notes: [
      { time: 0.0, lane: 3 }, { time: 0.3, lane: 2 }, { time: 0.6, lane: 3 }, { time: 0.9, lane: 2 },
      { time: 1.2, lane: 3 }, { time: 1.5, lane: 0 }, { time: 1.8, lane: 2 }, { time: 2.1, lane: 1 },
      { time: 2.4, lane: 0 },
      { time: 3.5, lane: 2 }, { time: 3.8, lane: 3 }, { time: 4.1, lane: 0 }, { time: 4.4, lane: 1 },
      { time: 4.7, lane: 2 },
    ]
  },
  {
    id: 'swan-lake',
    title: 'Swan Lake',
    artist: 'Tchaikovsky',
    bpm: 90,
    duration: 25,
    notes: [
      { time: 0.0, lane: 0 }, { time: 1.0, lane: 1 }, { time: 1.5, lane: 2 }, { time: 2.0, lane: 3 },
      { time: 3.0, lane: 2 }, { time: 3.5, lane: 1 }, { time: 4.0, lane: 0 },
      { time: 5.5, lane: 0 }, { time: 6.5, lane: 1 }, { time: 7.0, lane: 2 }, { time: 7.5, lane: 3 },
    ]
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D',
    artist: 'Pachelbel',
    bpm: 80,
    duration: 30,
    notes: [
      { time: 0.0, lane: 2 }, { time: 0.8, lane: 1 }, { time: 1.6, lane: 0 }, { time: 2.4, lane: 3 },
      { time: 3.2, lane: 2 }, { time: 4.0, lane: 1 }, { time: 4.8, lane: 0 }, { time: 5.6, lane: 3 },
      { time: 7.0, lane: 0 }, { time: 7.2, lane: 1 }, { time: 7.4, lane: 2 }, { time: 7.6, lane: 3 },
    ]
  }
];
