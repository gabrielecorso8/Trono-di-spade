import { GameState, Player, PrivatePlayerInfo, Card, Objective, TerritoryState, TurnPhase } from '../src/types';
import { TERRITORIES, REGIONS, ADJACENCY } from '../src/gameData';

export class GameRoom {
  roomId: string;
  state: GameState;
  privateInfo: Record<string, PrivatePlayerInfo>;
  deck: Card[];
  discardPile: Card[];
  specialDeck: Card[];
  objectives: Objective[];

  constructor(roomId: string) {
    this.roomId = roomId;
    this.state = {
      roomId,
      phase: 'LOBBY',
      turnPhase: 'REINFORCEMENT',
      turn: 0,
      currentPlayerIndex: 0,
      territories: {},
      log: [],
      players: [],
      combatState: null,
      whiteWalkersEnabled: false,
      winner: null,
    };
    this.privateInfo = {};
    this.deck = [];
    this.discardPile = [];
    this.specialDeck = [];
    this.objectives = [];
    this.initTerritories();
  }

  initTerritories() {
    for (const t of Object.keys(TERRITORIES)) {
      this.state.territories[t] = { owner: null, troops: 0 };
    }
  }

  addPlayer(id: string, name: string, faction: string) {
    if (this.state.phase !== 'LOBBY') return false;
    if (this.state.players.find(p => p.id === id)) return false;
    if (this.state.players.find(p => p.faction === faction)) return false;

    const isHost = this.state.players.length === 0;
    this.state.players.push({
      id,
      name,
      faction,
      troopsToPlace: 0,
      isHost,
      isAlive: true,
      hasConqueredThisTurn: false,
      cardsCount: 0,
      objectiveRevealed: false,
    });
    this.privateInfo[id] = { cards: [], objective: null };
    this.log(`Player ${name} (${faction}) joined the room.`);
    return true;
  }

  removePlayer(id: string) {
    const playerIndex = this.state.players.findIndex(p => p.id === id);
    if (playerIndex !== -1) {
      const player = this.state.players[playerIndex];
      this.state.players.splice(playerIndex, 1);
      delete this.privateInfo[id];
      this.log(`Player ${player.name} left the room.`);
      
      // If host left, reassign host
      if (player.isHost && this.state.players.length > 0) {
        this.state.players[0].isHost = true;
      }
      return true;
    }
    return false;
  }

  log(msg: string) {
    this.state.log.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    if (this.state.log.length > 50) this.state.log.shift();
  }

  // --- GAME LOGIC ---

  startGame(whiteWalkersEnabled: boolean) {
    if (this.state.phase !== 'LOBBY') return false;
    if (this.state.players.length < 2 || this.state.players.length > 5) return false;

    this.state.whiteWalkersEnabled = whiteWalkersEnabled;
    this.state.phase = 'SETUP_PLACEMENT';
    this.log('Game started! Distributing territories...');

    // Initialize deck
    this.initDeck();

    // 1. Initial troops
    const numPlayers = this.state.players.length;
    const initialTroops = numPlayers === 5 ? 25 : numPlayers === 4 ? 30 : numPlayers === 3 ? 35 : 40;
    this.state.players.forEach(p => p.troopsToPlace = initialTroops);

    // 2. Distribute territories
    let availableTerritories = Object.keys(TERRITORIES);
    if (whiteWalkersEnabled) {
      availableTerritories = availableTerritories.filter(t => TERRITORIES[t as keyof typeof TERRITORIES].region !== 'beyond_the_wall');
      // Assign beyond the wall to white walkers (we'll represent them as owner 'white_walkers')
      availableTerritories.filter(t => TERRITORIES[t as keyof typeof TERRITORIES].region === 'beyond_the_wall').forEach(t => {
        this.state.territories[t] = { owner: 'white_walkers', troops: 3 };
      });
    }

    // Shuffle and distribute
    availableTerritories = this.shuffle(availableTerritories);
    let playerIdx = 0;
    for (const t of availableTerritories) {
      const p = this.state.players[playerIdx];
      this.state.territories[t] = { owner: p.id, troops: 1 };
      p.troopsToPlace--;
      playerIdx = (playerIdx + 1) % numPlayers;
    }

    // 3. Objectives (mock for now)
    this.state.players.forEach(p => {
      this.privateInfo[p.id].objective = { id: 'obj1', description: 'Conquer 24 territories' };
    });

    // 4. Determine starting player (who has King's Landing, else random)
    const klOwner = this.state.territories['kings_landing']?.owner;
    if (klOwner) {
      this.state.currentPlayerIndex = this.state.players.findIndex(p => p.id === klOwner);
    } else {
      this.state.currentPlayerIndex = 0;
    }

    this.log(`${this.state.players[this.state.currentPlayerIndex].name} starts placing troops.`);
    return true;
  }

  initDeck() {
    const symbols: CardSymbol[] = ['LANCE', 'SWORD', 'BOW'];
    let symbolIdx = 0;
    
    // Create territory cards
    for (const tId of Object.keys(TERRITORIES)) {
      this.deck.push({
        id: `card_${tId}`,
        type: 'TERRITORY',
        symbol: symbols[symbolIdx % 3],
        territoryId: tId,
        name: TERRITORIES[tId as keyof typeof TERRITORIES].name
      });
      symbolIdx++;
    }
    
    // Add 2 wild cards
    this.deck.push({ id: 'wild_1', type: 'TERRITORY', symbol: 'WILD', name: 'Wild Card' });
    this.deck.push({ id: 'wild_2', type: 'TERRITORY', symbol: 'WILD', name: 'Wild Card' });
    
    this.deck = this.shuffle(this.deck);
  }

  placeTroops(playerId: string, territoryId: string, amount: number) {
    if (this.state.phase !== 'SETUP_PLACEMENT' && this.state.turnPhase !== 'REINFORCEMENT') return false;
    const player = this.state.players.find(p => p.id === playerId);
    if (!player || player.troopsToPlace < amount) return false;
    
    // Check if it's their turn
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return false;

    const territory = this.state.territories[territoryId];
    if (territory.owner !== playerId) return false;

    territory.troops += amount;
    player.troopsToPlace -= amount;

    this.log(`${player.name} placed ${amount} troops on ${TERRITORIES[territoryId as keyof typeof TERRITORIES].name}.`);

    if (this.state.phase === 'SETUP_PLACEMENT') {
      // Next player
      this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
      
      // Check if all troops placed
      if (this.state.players.every(p => p.troopsToPlace === 0)) {
        this.state.phase = 'PLAYING';
        this.state.turnPhase = 'REINFORCEMENT';
        this.state.turn = 1;
        // The player who placed last in setup, the next one starts the actual game
        this.calculateReinforcements(this.state.players[this.state.currentPlayerIndex]);
        this.log(`Setup complete. Game begins! Turn 1, ${this.state.players[this.state.currentPlayerIndex].name}'s turn.`);
      } else {
        // Skip players with 0 troops
        while (this.state.players[this.state.currentPlayerIndex].troopsToPlace === 0) {
          this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        }
      }
    }

    return true;
  }

  endReinforcement(playerId: string) {
    if (this.state.phase !== 'PLAYING' || this.state.turnPhase !== 'REINFORCEMENT') return false;
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return false;
    
    const player = this.state.players.find(p => p.id === playerId);
    if (player && player.troopsToPlace > 0) return false; // Must place all

    this.state.turnPhase = 'POWERUP';
    this.log(`${player?.name} finished reinforcements.`);
    return true;
  }

  playCardSet(playerId: string, cardIds: string[]) {
    if (this.state.phase !== 'PLAYING' || this.state.turnPhase !== 'POWERUP') return false;
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return false;
    
    const privateInfo = this.privateInfo[playerId];
    if (!privateInfo) return false;

    // Check if player has all cards
    const cards = cardIds.map(id => privateInfo.cards.find(c => c.id === id)).filter(Boolean) as Card[];
    if (cards.length !== 3) return false;

    // Validate set
    const symbols = cards.map(c => c.symbol);
    const hasWild = symbols.includes('WILD');
    
    let isValid = false;
    let bonusTroops = 0;

    if (symbols.every(s => s === 'LANCE') || (symbols.filter(s => s === 'LANCE').length === 2 && hasWild)) {
      isValid = true;
      bonusTroops = 4;
    } else if (symbols.every(s => s === 'SWORD') || (symbols.filter(s => s === 'SWORD').length === 2 && hasWild)) {
      isValid = true;
      bonusTroops = 5;
    } else if (symbols.every(s => s === 'BOW') || (symbols.filter(s => s === 'BOW').length === 2 && hasWild)) {
      isValid = true;
      bonusTroops = 6;
    } else if (new Set(symbols.filter(s => s !== 'WILD')).size === symbols.filter(s => s !== 'WILD').length) {
      // All different (or different + wild)
      isValid = true;
      bonusTroops = 7;
    }

    if (!isValid) return false;

    // Add extra bonus for owned territories
    cards.forEach(c => {
      if (c.territoryId && this.state.territories[c.territoryId]?.owner === playerId) {
        this.state.territories[c.territoryId].troops += 2;
        this.log(`${this.state.players[this.state.currentPlayerIndex].name} got +2 bonus troops on ${TERRITORIES[c.territoryId as keyof typeof TERRITORIES].name}.`);
      }
    });

    const player = this.state.players[this.state.currentPlayerIndex];
    player.troopsToPlace += bonusTroops;

    // Remove cards from hand
    privateInfo.cards = privateInfo.cards.filter(c => !cardIds.includes(c.id));
    player.cardsCount = privateInfo.cards.length;

    // Add to discard pile
    this.discardPile.push(...cards);

    this.log(`${player.name} traded a set of cards for ${bonusTroops} troops.`);
    
    // Go back to reinforcement phase to place the new troops
    this.state.turnPhase = 'REINFORCEMENT';
    return true;
  }

  endPowerup(playerId: string) {
    if (this.state.phase !== 'PLAYING' || this.state.turnPhase !== 'POWERUP') return false;
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return false;
    
    this.state.turnPhase = 'ATTACK';
    return true;
  }

  attack(attackerId: string, sourceId: string, targetId: string, dice: number) {
    if (this.state.phase !== 'PLAYING' || this.state.turnPhase !== 'ATTACK') return false;
    if (this.state.players[this.state.currentPlayerIndex].id !== attackerId) return false;
    if (this.state.combatState) return false; // Already in combat

    const source = this.state.territories[sourceId];
    const target = this.state.territories[targetId];

    if (source.owner !== attackerId) return false;
    if (target.owner === attackerId) return false;
    if (source.troops <= dice) return false; // Must leave 1 behind
    if (dice < 1 || dice > 3) return false;

    // Check adjacency
    const isAdjacent = ADJACENCY[sourceId as keyof typeof ADJACENCY]?.includes(targetId);
    if (!isAdjacent) return false;

    this.state.combatState = {
      attackerId,
      defenderId: target.owner || 'neutral',
      sourceTerritory: sourceId,
      targetTerritory: targetId,
      attackerDice: dice,
      defenderDice: 0,
      status: 'WAITING_FOR_DEFENDER'
    };

    const attackerName = this.state.players.find(p => p.id === attackerId)?.name;
    const targetName = TERRITORIES[targetId as keyof typeof TERRITORIES].name;
    this.log(`${attackerName} is attacking ${targetName} with ${dice} dice!`);

    // If neutral or white walkers, auto defend
    if (!target.owner || target.owner === 'white_walkers') {
      this.defend(target.owner || 'neutral', Math.min(2, target.troops));
    }

    return true;
  }

  defend(defenderId: string, dice: number) {
    if (!this.state.combatState || this.state.combatState.status !== 'WAITING_FOR_DEFENDER') return false;
    if (this.state.combatState.defenderId !== defenderId) return false;

    const target = this.state.territories[this.state.combatState.targetTerritory];
    if (dice < 1 || dice > 2 || dice > target.troops) return false;

    this.state.combatState.defenderDice = dice;
    this.state.combatState.status = 'RESOLVED';

    this.resolveCombat();
    return true;
  }

  resolveCombat() {
    const combat = this.state.combatState;
    if (!combat) return;

    combat.attackerRolls = Array.from({ length: combat.attackerDice }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
    combat.defenderRolls = Array.from({ length: combat.defenderDice }, () => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);

    let attackerLosses = 0;
    let defenderLosses = 0;

    const pairs = Math.min(combat.attackerDice, combat.defenderDice);
    for (let i = 0; i < pairs; i++) {
      if (combat.attackerRolls[i] > combat.defenderRolls[i]) {
        defenderLosses++;
      } else {
        attackerLosses++;
      }
    }

    const source = this.state.territories[combat.sourceTerritory];
    const target = this.state.territories[combat.targetTerritory];

    source.troops -= attackerLosses;
    target.troops -= defenderLosses;

    this.log(`Combat Result: Attacker lost ${attackerLosses}, Defender lost ${defenderLosses}.`);

    if (target.troops <= 0) {
      combat.status = 'CONQUERED';
      target.owner = combat.attackerId;
      target.troops = 0; // Will be filled by move
      const player = this.state.players.find(p => p.id === combat.attackerId);
      if (player) player.hasConqueredThisTurn = true;
      this.log(`${player?.name} conquered ${TERRITORIES[combat.targetTerritory as keyof typeof TERRITORIES].name}!`);
    } else {
      this.state.combatState = null; // Combat over
    }
  }

  moveTroopsAfterConquest(playerId: string, amount: number) {
    const combat = this.state.combatState;
    if (!combat || combat.status !== 'CONQUERED' || combat.attackerId !== playerId) return false;

    const source = this.state.territories[combat.sourceTerritory];
    const target = this.state.territories[combat.targetTerritory];

    if (amount < combat.attackerDice || amount >= source.troops) return false;

    source.troops -= amount;
    target.troops += amount;

    this.state.combatState = null;
    this.log(`Moved ${amount} troops to newly conquered territory.`);
    return true;
  }

  endAttackPhase(playerId: string) {
    if (this.state.phase !== 'PLAYING' || this.state.turnPhase !== 'ATTACK') return false;
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return false;
    if (this.state.combatState) return false;

    this.state.turnPhase = 'STRATEGIC_MOVE';
    return true;
  }

  strategicMove(playerId: string, sourceId: string, targetId: string, amount: number) {
    if (this.state.phase !== 'PLAYING' || this.state.turnPhase !== 'STRATEGIC_MOVE') return false;
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return false;

    const source = this.state.territories[sourceId];
    const target = this.state.territories[targetId];

    if (source.owner !== playerId || target.owner !== playerId) return false;
    if (source.troops <= amount) return false;
    
    const isAdjacent = ADJACENCY[sourceId as keyof typeof ADJACENCY]?.includes(targetId);
    if (!isAdjacent) return false;

    source.troops -= amount;
    target.troops += amount;

    this.log(`${this.state.players[this.state.currentPlayerIndex].name} performed a strategic move.`);
    this.endTurn(playerId); // Auto end turn after strategic move
    return true;
  }

  endTurn(playerId: string) {
    if (this.state.phase !== 'PLAYING') return false;
    if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return false;
    if (this.state.combatState) return false;

    const player = this.state.players[this.state.currentPlayerIndex];
    
    if (player.hasConqueredThisTurn) {
      this.drawCard(player);
    }

    player.hasConqueredThisTurn = false;

    // Next player
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    if (this.state.currentPlayerIndex === 0) {
      this.state.turn++;
    }

    const nextPlayer = this.state.players[this.state.currentPlayerIndex];
    this.state.turnPhase = 'REINFORCEMENT';
    this.calculateReinforcements(nextPlayer);
    
    this.log(`Turn ${this.state.turn}: ${nextPlayer.name}'s turn.`);
    return true;
  }

  drawCard(player: Player) {
    if (this.deck.length === 0) {
      // Reshuffle discard pile
      this.deck = this.shuffle(this.discardPile);
      this.discardPile = [];
    }

    if (this.deck.length > 0) {
      const card = this.deck.pop()!;
      this.privateInfo[player.id].cards.push(card);
      player.cardsCount++;
      this.log(`${player.name} drew a card.`);
    }
  }

  calculateReinforcements(player: Player) {
    let territoriesCount = 0;
    let castlesCount = 0;
    const regionsOwned: Record<string, boolean> = {};

    for (const [id, t] of Object.entries(this.state.territories)) {
      if (t.owner === player.id) {
        territoriesCount++;
        if (TERRITORIES[id as keyof typeof TERRITORIES].hasCastle) castlesCount++;
      }
    }

    let troops = Math.floor((territoriesCount + castlesCount) / 3);
    if (troops < 3) troops = 3;

    // Check region bonuses
    for (const region of REGIONS) {
      const regionTerritories = Object.keys(TERRITORIES).filter(t => TERRITORIES[t as keyof typeof TERRITORIES].region === region.id);
      const ownsAll = regionTerritories.every(t => this.state.territories[t].owner === player.id);
      if (ownsAll) {
        troops += region.bonus;
      }
    }

    player.troopsToPlace = troops;
    this.log(`${player.name} receives ${troops} reinforcements.`);
  }

  private shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
