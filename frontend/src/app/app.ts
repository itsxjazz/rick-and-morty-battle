import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './shared/components/card/card';
import { IntroComponent } from './features/intro/intro.component';
import { SelectionComponent } from './features/selection/selection.component';
import { BattleComponent } from './features/battle/battle.component';
import { GameStateService } from './core/state/game.state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    IntroComponent,
    SelectionComponent,
    BattleComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  constructor(public gameState: GameStateService) {}
}
