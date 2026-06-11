import { Injectable, signal, computed, ChangeDetectorRef } from '@angular/core';
import { Card } from '../../shared/models/card.model';
import { CardService } from '../services/card.service';
import { GAME_TEXTS } from '../../constants/game-texts';

export type GameState = 'INTRO' | 'DEALING' | 'SELECTION' | 'BATTLE';
export type BattleResult = 'VICTORY' | 'DEFEAT' | 'DRAW';

export interface Scoreboard {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
}

export interface BattleRound {
  attr: string;
  pVal: number;
  eVal: number;
  winner: 'PLAYER' | 'ENEMY' | 'DRAW';
}

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  // --- STATE SIGNALS ---
  private readonly _gameState = signal<GameState>('INTRO');
  private readonly _allCards = signal<Card[]>([]);
  private readonly _heroOptions = signal<Card[]>([]);
  private readonly _playerCard = signal<Card | null>(null);
  private readonly _enemyCard = signal<Card | null>(null);
  private readonly _isModalOpen = signal<boolean>(false);
  private readonly _language = signal<'PT' | 'EN'>('PT');
  private readonly _loading = signal<boolean>(false);
  private readonly _errorMessage = signal<string | null>(null);
  
  // --- SCOREBOARD SIGNALS ---
  private readonly _scoreboard = signal<Scoreboard>({
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
  });

  // --- BATTLE MECHANICS SIGNALS ---
  private readonly _battleResult = signal<BattleResult | null>(null);
  private readonly _playerRoundWins = signal<number>(0);
  private readonly _enemyRoundWins = signal<number>(0);
  private readonly _battleRounds = signal<BattleRound[]>([]);

  // --- READ-ONLY EXPOSED SIGNALS ---
  readonly gameState = this._gameState.asReadonly();
  readonly allCards = this._allCards.asReadonly();
  readonly heroOptions = this._heroOptions.asReadonly();
  readonly playerCard = this._playerCard.asReadonly();
  readonly enemyCard = this._enemyCard.asReadonly();
  readonly isModalOpen = this._isModalOpen.asReadonly();
  readonly language = this._language.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly scoreboard = this._scoreboard.asReadonly();
  readonly battleResult = this._battleResult.asReadonly();
  readonly playerRoundWins = this._playerRoundWins.asReadonly();
  readonly enemyRoundWins = this._enemyRoundWins.asReadonly();
  readonly battleRounds = this._battleRounds.asReadonly();

  // --- COMPUTED SIGNALS ---
  readonly texts = computed(() => GAME_TEXTS[this._language()]);
  readonly isDataReady = computed(() => this._allCards().length > 0);

  constructor(private cardService: CardService) {
    this.detectLanguage();
    this.loadScoreboard();
    this.fetchCardsFromDatabase();
  }

  // --- LANGUAGE MANAGEMENT ---
  private detectLanguage() {
    const saved = localStorage.getItem('rick_battle_lang') as 'PT' | 'EN';
    if (saved) {
      this._language.set(saved);
    }
  }

  changeLanguage(lang: 'PT' | 'EN') {
    this._language.set(lang);
    localStorage.setItem('rick_battle_lang', lang);
  }

  // --- DATABASE DATA ---
  fetchCardsFromDatabase() {
    this._errorMessage.set(null);
    this.cardService.getCards().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this._allCards.set(data);
        } else {
          this._errorMessage.set('Portal vazio. Verifique o banco de dados.');
        }
      },
      error: (err) => {
        console.error('Erro ao conectar com o backend:', err);
        this._errorMessage.set('Erro de conexão com o portal.');
      },
    });
  }

  // --- SCOREBOARD ---
  private loadScoreboard() {
    const saved = localStorage.getItem('rick_battle_score');
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        this._scoreboard.set({ ...this._scoreboard(), ...savedData });
      } catch (e) {
        console.error('Erro ao fazer parse do scoreboard:', e);
      }
    }
  }

  private updateScoreboard(result: BattleResult) {
    const current = this._scoreboard();
    let wins = current.wins;
    let losses = current.losses;
    let draws = current.draws;
    let currentStreak = current.currentStreak;
    let bestStreak = current.bestStreak;

    if (result === 'VICTORY') {
      wins++;
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    } else if (result === 'DEFEAT') {
      losses++;
      currentStreak = 0;
    } else {
      draws++;
      currentStreak = 0;
    }

    const updated = { wins, losses, draws, currentStreak, bestStreak };
    this._scoreboard.set(updated);
    localStorage.setItem('rick_battle_score', JSON.stringify(updated));
  }

  // --- GAME FLOW ---
  async startGame() {
    if (!this.isDataReady() || this._allCards().length === 0) return;

    this._loading.set(true);
    this._playerCard.set(null);
    this._enemyCard.set(null);
    this._battleResult.set(null);

    const selectedCards = this.getRandomCards(4);
    this._heroOptions.set(selectedCards);

    const imageUrls = selectedCards.map((c) => c.image).filter(Boolean);
    try {
      await this.preloadImages(imageUrls);
    } catch (e) {
      console.error('Erro ao pré-carregar imagens das variantes:', e);
    }

    this._gameState.set('DEALING');

    setTimeout(() => {
      this._gameState.set('SELECTION');
      this._loading.set(false);
    }, 2500);
  }

  chooseCard(card: Card) {
    this._playerCard.set(card);
  }

  async goToBattle() {
    const playerCard = this._playerCard();
    if (!playerCard) return;

    let enemyPool = this._allCards().filter((c) => c._id !== playerCard._id);
    let allowedTiers: string[] = [];

    switch (playerCard.rarity) {
      case 'LEGENDARY':
        allowedTiers = ['EPIC', 'LEGENDARY'];
        break;
      case 'EPIC':
        allowedTiers = ['RARE', 'EPIC', 'LEGENDARY'];
        break;
      case 'RARE':
        allowedTiers = ['COMMON', 'RARE', 'EPIC'];
        break;
      default:
        allowedTiers = ['COMMON', 'RARE'];
        break;
    }

    const validEnemies = enemyPool.filter((c) => allowedTiers.includes(c.rarity));
    if (validEnemies.length > 0) {
      enemyPool = validEnemies;
    }

    const chosenEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    this._enemyCard.set(chosenEnemy);

    if (chosenEnemy && chosenEnemy.image) {
      this._loading.set(true);
      try {
        await this.preloadImages([chosenEnemy.image]);
      } catch (e) {
        console.error('Erro ao pré-carregar imagem do inimigo:', e);
      }
      this._loading.set(false);
    }

    this._gameState.set('BATTLE');
    this._battleRounds.set([]);
    this._playerRoundWins.set(0);
    this._enemyRoundWins.set(0);
    this._battleResult.set(null);

    const texts = this.texts();
    const attributes = [
      { key: 'survival', label: texts.STATS.survival },
      { key: 'popularity', label: texts.STATS.popularity },
      { key: 'weirdness', label: texts.STATS.weirdness },
    ];

    const roundOrder = [...attributes].sort(() => Math.random() - 0.5);

    for (let round of roundOrder) {
      await this.wait(1000);

      const pVal = playerCard.stats[round.key as keyof typeof playerCard.stats] || 0;
      const eVal = chosenEnemy.stats[round.key as keyof typeof chosenEnemy.stats] || 0;

      let roundWinner: 'PLAYER' | 'ENEMY' | 'DRAW';
      if (pVal > eVal) {
        this._playerRoundWins.update(v => v + 1);
        roundWinner = 'PLAYER';
      } else if (eVal > pVal) {
        this._enemyRoundWins.update(v => v + 1);
        roundWinner = 'ENEMY';
      } else {
        roundWinner = 'DRAW';
      }

      this._battleRounds.update(rounds => [...rounds, { attr: round.label, pVal, eVal, winner: roundWinner }]);
    }

    await this.wait(800);

    const playerWins = this._playerRoundWins();
    const enemyWins = this._enemyRoundWins();
    let finalResult: BattleResult;

    if (playerWins > enemyWins) {
      finalResult = 'VICTORY';
    } else if (enemyWins > playerWins) {
      finalResult = 'DEFEAT';
    } else {
      finalResult = 'DRAW';
    }

    this._battleResult.set(finalResult);
    this.updateScoreboard(finalResult);
  }

  private wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  exitGame() {
    this._gameState.set('INTRO');
    this._playerCard.set(null);
  }

  getRandomCards(amount: number): Card[] {
    return [...this._allCards()].sort(() => 0.5 - Math.random()).slice(0, amount);
  }

  toggleModal(state: boolean) {
    this._isModalOpen.set(state);
  }

  private preloadImages(urls: string[]): Promise<void[]> {
    const promises = urls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
    });
    return Promise.all(promises);
  }
}
