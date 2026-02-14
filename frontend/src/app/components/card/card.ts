import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/card.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class CardComponent {
  @Input() card!: Card;
  @Input() currentTexts: any; // Recebe os textos atuais para tradução

  // Função auxiliar para definir a cor da borda baseada na raridade
  getRarityColor(): string {
    switch (this.card?.rarity) {
      case 'LEGENDARY':
        return '#ffd700'; // Dourado
      case 'EPIC':
        return '#9b59b6'; // Roxo
      case 'RARE':
        return '#3498db'; // Azul
      default:
        return '#95a5a6'; // Cinza (Common)
    }
  }
}
