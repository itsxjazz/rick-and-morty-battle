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
  styleUrl: './app.scss'
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
    bestStreak: 0     
  };

  // --- LÓGICA MD3 ---
  playerRoundWins: number = 0;
  enemyRoundWins: number = 0;
  battleRounds: { attr: string, pVal: number, eVal: number, winner: 'PLAYER' | 'ENEMY' | 'DRAW' }[] = [];

  constructor(
    private cardService: CardService,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.detectarIdioma(); // 2. Detecta o idioma salvo
    this.carregarCartasBanco();
    this.carregarPlacar();
  }

  // --- LÓGICA DE IDIOMA ---
  detectarIdioma() {
    const salvo = localStorage.getItem('rick_battle_lang') as 'PT' | 'EN';
    if (salvo) {
      this.mudarIdioma(salvo);
    }
  }

  mudarIdioma(lang: 'PT' | 'EN') {
    this.language = lang;
    this.texts = GAME_TEXTS[lang];
    localStorage.setItem('rick_battle_lang', lang);
    this.cd.detectChanges();
  }

  // --- CARREGAMENTO INICIAL ---
  carregarCartasBanco() {
    this.isDataReady = false;
    this.errorMessage = null;

    this.cardService.getCards().subscribe({
      next: (dados) => {
        if (dados && dados.length > 0) {
          this.allCards = dados;
          this.isDataReady = true;
          this.cd.detectChanges(); 
        } else {
          this.errorMessage = "Portal vazio. Verifique o banco de dados.";
        }
      },
      error: (err) => {
        console.error('Erro ao conectar com o backend:', err);
        this.errorMessage = "Erro de conexão com o portal.";
        this.isDataReady = false;
        this.cd.detectChanges();
      }
    });
  }

  carregarPlacar() {
    const salvo = localStorage.getItem('rick_battle_score');
    if (salvo) {
      const dadosSalvos = JSON.parse(salvo);
      this.scoreboard = { ...this.scoreboard, ...dadosSalvos };
    }
  }

  atualizarPlacar(resultado: 'VICTORY' | 'DEFEAT' | 'DRAW') {
    if (resultado === 'VICTORY') {
      this.scoreboard.wins++;
      this.scoreboard.currentStreak++; 
      
      if (this.scoreboard.currentStreak > this.scoreboard.bestStreak) {
        this.scoreboard.bestStreak = this.scoreboard.currentStreak;
      }
    } else if (resultado === 'DEFEAT') {
      this.scoreboard.losses++;
      this.scoreboard.currentStreak = 0; 
    } else {
      this.scoreboard.draws++;
      this.scoreboard.currentStreak = 0; 
    }
    
    localStorage.setItem('rick_battle_score', JSON.stringify(this.scoreboard));
  }

  // --- FLUXO DE JOGO ---
  iniciarJogo() {
    if (!this.isDataReady || this.allCards.length === 0) return;

    this.gameState = 'DEALING';
    this.loading = true;
    this.playerCard = null;
    this.enemyCard = null;
    this.battleResult = null;
    this.heroOptions = this.pegarCartasAleatorias(4);

    setTimeout(() => {
      this.gameState = 'SELECTION';
      this.loading = false;
      this.cd.detectChanges();
    }, 2500);
  }

  escolherCarta(card: Card) {
    this.playerCard = card;
  }

  async irParaBatalha() {
    if (!this.playerCard) return;

    let poolInimigos = this.allCards.filter(c => c._id !== this.playerCard?._id);
    let tiersPermitidos: string[] = [];

    switch (this.playerCard.rarity) {
      case 'LEGENDARY':
        tiersPermitidos = ['EPIC', 'LEGENDARY'];
        break;
      case 'EPIC':
        tiersPermitidos = ['RARE', 'EPIC', 'LEGENDARY'];
        break;
      case 'RARE':
        tiersPermitidos = ['COMMON', 'RARE', 'EPIC'];
        break;
      default: 
        tiersPermitidos = ['COMMON', 'RARE'];
        break;
    }

    const inimigosValidos = poolInimigos.filter(c => tiersPermitidos.includes(c.rarity));

    if (inimigosValidos.length > 0) {
      poolInimigos = inimigosValidos;
    }

    this.enemyCard = poolInimigos[Math.floor(Math.random() * poolInimigos.length)];

    this.gameState = 'BATTLE';
    this.battleRounds = [];
    this.playerRoundWins = 0;
    this.enemyRoundWins = 0;
    this.battleResult = null;

    // Tradução dos atributos baseada no idioma selecionado
    const atributos = [
      { key: 'survival', label: this.texts.STATS.survival },
      { key: 'popularity', label: this.texts.STATS.popularity },
      { key: 'weirdness', label: this.texts.STATS.weirdness }
    ];
    
    const ordemRodadas = [...atributos].sort(() => Math.random() - 0.5);

    for (let round of ordemRodadas) {
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
      this.atualizarPlacar('VICTORY');
    } else if (this.enemyRoundWins > this.playerRoundWins) {
      this.battleResult = 'DEFEAT';
      this.atualizarPlacar('DEFEAT');
    } else {
      this.battleResult = 'DRAW';
      this.atualizarPlacar('DRAW');
    }

    this.cd.detectChanges();
  }

  private wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sairDoJogo() {
    this.gameState = 'INTRO';
    this.playerCard = null;
    this.carregarCartasBanco(); 
  }

  pegarCartasAleatorias(quantidade: number): Card[] {
    return [...this.allCards].sort(() => 0.5 - Math.random()).slice(0, quantidade);
  }

  toggleModal(state: boolean) {
    this.isModalOpen = state;
    this.cd.detectChanges();
  }
}