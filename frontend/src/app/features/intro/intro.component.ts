import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/state/game.state.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
})
export class IntroComponent {
  constructor(public gameState: GameStateService) {}
}
