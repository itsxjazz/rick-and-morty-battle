import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card';
import { GameStateService } from '../../core/state/game.state.service';

@Component({
  selector: 'app-selection',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './selection.component.html',
  styleUrl: './selection.component.scss',
})
export class SelectionComponent {
  constructor(public gameState: GameStateService) {}
}
