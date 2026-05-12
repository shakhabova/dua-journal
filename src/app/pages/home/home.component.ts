import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuaService } from '../../services/dua.service';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import { Dua } from '../../models/dua.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DuaCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private duaService = inject(DuaService);
  
  dailyDua: Dua = this.duaService.getDailyDua();
  quranDuas: Dua[] = this.duaService.getLibraryDuas().filter(d => d.source === 'Quran');
  sunnahDuas: Dua[] = this.duaService.getLibraryDuas().filter(d => d.source === 'Sunnah');

  addedDuaIds = signal<Set<string>>(new Set());

  addToMyDuas(dua: Dua) {
    this.duaService.addUserDua(dua.textRu, dua.source === 'Quran' ? 'Коран' : 'Сунна');
    this.addedDuaIds.update(set => {
      const newSet = new Set(set);
      newSet.add(dua.id);
      return newSet;
    });
  }
}
