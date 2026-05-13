export type Player = {
  id: string;
  name: string;
  avatar: string;
  points: number;
  latest: string;
};

export const MOCK_PLAYERS: Player[] = [
  { id: "1", name: "Daan Nagtegaal", avatar: "🦊", points: 2840, latest: "Solved Crossword" },
  { id: "2", name: "Marieke de Vries", avatar: "🐼", points: 2710, latest: "Trivia +100" },
  { id: "3", name: "Joris van Dijk", avatar: "🦉", points: 2455, latest: "Won Darts Challenge" },
  { id: "4", name: "Sanne Bakker", avatar: "🦄", points: 2210, latest: "Code V3-READY" },
  { id: "5", name: "Bram Janssen", avatar: "🐺", points: 2050, latest: "Solved Trivia" },
  { id: "6", name: "Eva Mulder", avatar: "🦋", points: 1890, latest: "Code COMPOSITION" },
  { id: "7", name: "Tim Visser", avatar: "🐙", points: 1720, latest: "Crossword +75" },
  { id: "8", name: "Lotte Smit", avatar: "🦜", points: 1640, latest: "Migrated 12 files" },
  { id: "9", name: "Ruben Peters", avatar: "🐸", points: 1510, latest: "Code TELEPORT" },
  { id: "10", name: "Fleur Hendriks", avatar: "🦔", points: 1420, latest: "Trivia +50" },
  { id: "11", name: "Niels van der Berg", avatar: "🐢", points: 1280, latest: "Solved Crossword" },
  { id: "12", name: "Iris Brouwer", avatar: "🦩", points: 1150, latest: "Code PINIA" },
  { id: "13", name: "Thijs Maas", avatar: "🐳", points: 1040, latest: "Trivia +100" },
  { id: "14", name: "Anouk Vermeer", avatar: "🦊", points: 920, latest: "Manual +10" },
  { id: "15", name: "Sven Bos", avatar: "🐯", points: 810, latest: "Code SETUP" },
  { id: "16", name: "Maud de Boer", avatar: "🐰", points: 720, latest: "Crossword +50" },
  { id: "17", name: "Lars Kuiper", avatar: "🦁", points: 640, latest: "Code REACTIVE" },
  { id: "18", name: "Yara Dekker", avatar: "🐨", points: 530, latest: "Trivia +10" },
  { id: "19", name: "Pim Vos", avatar: "🦝", points: 410, latest: "Migrated 3 files" },
  { id: "20", name: "Jasmijn Roos", avatar: "🦓", points: 280, latest: "Code V3-READY" },
];

export const CURRENT_USER = {
  name: "Daan Nagtegaal",
  avatar: "🦊",
  points: 2840,
  email: "daan@vuemigration.dev",
};
