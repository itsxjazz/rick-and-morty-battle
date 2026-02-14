import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './components/card/card';
import { Card } from './models/card.model';
import { CardService } from './services/card.service';
import { GAME_TEXTS } from './constants/game-texts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  // --- BANCO DE DADOS E OPÇÕES ---
  allCards: Card[] = [];
  heroOptions: Card[] = [];
  playerCard: Card | null = null;
  enemyCard: Card | null = null;
  isModalOpen: boolean = false;

  // --- INTERNACIONALIZAÇÃO (i18n) ---
  language: 'PT' | 'EN' = 'PT'; // Idioma padrão
  texts = GAME_TEXTS[this.language]; // Referência direta para o HTML

  // --- ESTADOS DO JOGO ---
  gameState: 'INTRO' | 'DEALING' | 'SELECTION' | 'BATTLE' = 'INTRO';
  loading = false;
  isDataReady = false;
  errorMessage: string | null = null;

  // --- PLACAR GERAL E STREAK ---
  battleResult: 'VICTORY' | 'DEFEAT' | 'DRAW' | null = null;

  scoreboard = {
    wins: 0,
    losses: 0,
    draws: 0,
    currentStreak: 0,
    bestStreak: 0,
  };

  // --- LÓGICA MD3 ---
  playerRoundWins: number = 0;
  enemyRoundWins: number = 0;
  battleRounds: {
    attr: string;
    pVal: number;
    eVal: number;
    winner: 'PLAYER' | 'ENEMY' | 'DRAW';
  }[] = [];

  constructor(
    private cardService: CardService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.detectLanguage(); // 2. Detecta o idioma salvo
    this.fetchCardsFromDatabase();
    this.loadScoreboard();
  }

  // --- LÓGICA DE IDIOMA ---
  detectLanguage() {
    const saved = localStorage.getItem('rick_battle_lang') as 'PT' | 'EN';
    if (saved) {
      this.changeLanguage(saved);
    }
  }

  changeLanguage(lang: 'PT' | 'EN') {
    this.language = lang;
    this.texts = GAME_TEXTS[lang];
    localStorage.setItem('rick_battle_lang', lang);
    this.cd.detectChanges();
  }

  // --- CARREGAMENTO INICIAL ---
  fetchCardsFromDatabase() {
    this.isDataReady = false;
    this.errorMessage = null;

    this.cardService.getCards().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.allCards = data;
          this.isDataReady = true;
          this.cd.detectChanges();
        } else {
          this.errorMessage = 'Portal vazio. Verifique o banco de dados.';
        }
      },
      error: (err) => {
        console.error('Erro ao conectar com o backend:', err);
        this.errorMessage = 'Erro de conexão com o portal.';
        this.isDataReady = false;
        this.cd.detectChanges();
      },
    });
  }

  loadScoreboard() {
    const saved = localStorage.getItem('rick_battle_score');
    if (saved) {
      const savedData = JSON.parse(saved);
      this.scoreboard = { ...this.scoreboard, ...savedData };
    }
  }

  updateScoreboard(result: 'VICTORY' | 'DEFEAT' | 'DRAW') {
    if (result === 'VICTORY') {
      this.scoreboard.wins++;
      this.scoreboard.currentStreak++;

      if (this.scoreboard.currentStreak > this.scoreboard.bestStreak) {
        this.scoreboard.bestStreak = this.scoreboard.currentStreak;
      }
    } else if (result === 'DEFEAT') {
      this.scoreboard.losses++;
      this.scoreboard.currentStreak = 0;
    } else {
      this.scoreboard.draws++;
      this.scoreboard.currentStreak = 0;
    }

    localStorage.setItem('rick_battle_score', JSON.stringify(this.scoreboard));
  }

  // --- FLUXO DE JOGO ---
  startGame() {
    if (!this.isDataReady || this.allCards.length === 0) return;

    this.gameState = 'DEALING';
    this.loading = true;
    this.playerCard = null;
    this.enemyCard = null;
    this.battleResult = null;
    this.heroOptions = this.getRandomCards(4);

    setTimeout(() => {
      this.gameState = 'SELECTION';
      this.loading = false;
      this.cd.detectChanges();
    }, 2500);
  }

  chooseCard(card: Card) {
    this.playerCard = card;
  }

  async goToBattle() {
    if (!this.playerCard) return;

    let enemyPool = this.allCards.filter((c) => c._id !== this.playerCard?._id);
    let allowedTiers: string[] = [];

    switch (this.playerCard.rarity) {
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

    this.enemyCard = enemyPool[Math.floor(Math.random() * enemyPool.length)];

    this.gameState = 'BATTLE';
    this.battleRounds = [];
    this.playerRoundWins = 0;
    this.enemyRoundWins = 0;
    this.battleResult = null;

    // Tradução dos atributos baseada no idioma selecionado
    const attributes = [
      { key: 'survival', label: this.texts.STATS.survival },
      { key: 'popularity', label: this.texts.STATS.popularity },
      { key: 'weirdness', label: this.texts.STATS.weirdness },
    ];

    const roundOrder = [...attributes].sort(() => Math.random() - 0.5);

    for (let round of roundOrder) {
      await this.wait(1000);

      const pVal = this.playerCard!.stats[round.key as keyof typeof this.playerCard.stats] || 0;
      const eVal = this.enemyCard!.stats[round.key as keyof typeof this.enemyCard.stats] || 0;

      let roundWinner: 'PLAYER' | 'ENEMY' | 'DRAW';
      if (pVal > eVal) {
        this.playerRoundWins++;
        roundWinner = 'PLAYER';
      } else if (eVal > pVal) {
        this.enemyRoundWins++;
        roundWinner = 'ENEMY';
      } else {
        roundWinner = 'DRAW';
      }

      this.battleRounds.push({ attr: round.label, pVal, eVal, winner: roundWinner });
      this.cd.detectChanges();
    }

    await this.wait(800);

    if (this.playerRoundWins > this.enemyRoundWins) {
      this.battleResult = 'VICTORY';
      this.updateScoreboard('VICTORY');
    } else if (this.enemyRoundWins > this.playerRoundWins) {
      this.battleResult = 'DEFEAT';
      this.updateScoreboard('DEFEAT');
    } else {
      this.battleResult = 'DRAW';
      this.updateScoreboard('DRAW');
    }

    this.cd.detectChanges();
  }

  private wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  exitGame() {
    this.gameState = 'INTRO';
    this.playerCard = null;
    this.fetchCardsFromDatabase();
  }

  getRandomCards(amount: number): Card[] {
    return [...this.allCards].sort(() => 0.5 - Math.random()).slice(0, amount);
  }

  toggleModal(state: boolean) {
    this.isModalOpen = state;
    this.cd.detectChanges();
  }
}
