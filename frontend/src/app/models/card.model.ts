export interface Card {
  _id: string;
  name: string;
  image: string;
  species: string;
  status: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  stats: {
    survival: number;
    popularity: number;
    weirdness: number;
    complexity: number;
  };
}