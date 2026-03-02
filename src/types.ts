export type GamePhase = 'LOBBY' | 'SETUP_PLACEMENT' | 'PLAYING' | 'GAME_OVER';
export type TurnPhase = 'REINFORCEMENT' | 'POWERUP' | 'ATTACK' | 'STRATEGIC_MOVE' | 'DRAW_CARD';

export interface Player {
  id: string;
  name: string;
  faction: string;
  troopsToPlace: number;
  isHost: boolean;
  isAlive: boolean;
  hasConqueredThisTurn: boolean;
  cardsCount: number;
  objectiveRevealed: boolean;
}

export interface PrivatePlayerInfo {
  cards: Card[];
  objective: Objective | null;
}

export interface TerritoryState {
  owner: string | null; // player id
  troops: number;
}

export interface CombatState {
  attackerId: string;
  defenderId: string;
  sourceTerritory: string;
  targetTerritory: string;
  attackerDice: number;
  defenderDice: number;
  attackerRolls?: number[];
  defenderRolls?: number[];
  status: 'WAITING_FOR_DEFENDER' | 'RESOLVED' | 'CONQUERED';
}

export interface GameState {
  roomId: string;
  phase: GamePhase;
  turnPhase: TurnPhase;
  turn: number;
  currentPlayerIndex: number;
  territories: Record<string, TerritoryState>;
  log: string[];
  players: Player[];
  combatState: CombatState | null;
  whiteWalkersEnabled: boolean;
  winner: string | null;
}

export type CardSymbol = 'LANCE' | 'SWORD' | 'BOW' | 'WILD';

export interface Card {
  id: string;
  type: 'TERRITORY' | 'SPECIAL';
  symbol?: CardSymbol;
  territoryId?: string;
  name?: string;
  effect?: string;
  specialType?: 'ACTIVE' | 'PASSIVE' | 'FREE';
}

export interface Objective {
  id: string;
  description: string;
}
