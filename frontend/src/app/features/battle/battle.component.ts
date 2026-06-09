import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card';
import { GameStateService } from '../../core/state/game.state.service';

@Component({
  selector: 'app-battle',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './battle.component.html',
  styleUrl: './battle.component.scss',
})
export class BattleComponent {
  constructor(public gameState: GameStateService) {}
}
