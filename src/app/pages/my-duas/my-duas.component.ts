import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuaService } from '../../services/dua.service';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';

@Component({
    selector: 'app-my-duas',
    imports: [CommonModule, DuaCardComponent, AddDuaModalComponent],
    templateUrl: './my-duas.component.html',
    styleUrl: './my-duas.component.css'
})
export class MyDuasComponent {
  private duaService = inject(DuaService);
  
  myDuas = this.duaService.userDuas;
  
  categories = ['Все', 'Ризк', 'Семья', 'Здоровье', 'Друзья', 'Работа'];
  selectedFilter = signal<string>('Все');

  filteredDuas = computed(() => {
    const filter = this.selectedFilter();
    const duas = this.myDuas();
    if (filter === 'Все') return duas;
    return duas.filter(d => d.category === filter);
  });
  
  activeCount = computed(() => this.myDuas().filter(d => !d.isAnswered).length);
  answeredCount = computed(() => this.myDuas().filter(d => d.isAnswered).length);

  isModalOpen = false;
  isEditMode = false;
  isFilterOpen = false;
  editingDuaId: string | null = null;
  editInitialText = '';
  editInitialCategory = '';

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  openModal() {
    this.isEditMode = false;
    this.editInitialText = '';
    this.editInitialCategory = 'Ризк';
    this.isModalOpen = true;
  }

  openEditModal(id: string) {
    const dua = this.myDuas().find(d => d.id === id);
    if(dua) {
      this.isEditMode = true;
      this.editingDuaId = id;
      this.editInitialText = dua.text;
      this.editInitialCategory = dua.category || 'Ризк';
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveNewDua(data: {text: string, category: string}) {
     if(this.isEditMode && this.editingDuaId) {
        this.duaService.updateUserDua(this.editingDuaId, data.text, data.category);
     } else {
        this.duaService.addUserDua(data.text, data.category);
     }
     this.closeModal();
  }

  markAnswered(duaId: string) {
    this.duaService.markAsAnswered(duaId);
  }

  deleteDua(id: string) {
    this.duaService.deleteUserDua(id);
  }

  unmarkAnswered(id: string) {
    this.duaService.unmarkAsAnswered(id);
  }

  setFilter(category: string) {
    this.selectedFilter.set(category);
    this.isFilterOpen = false;
  }
}
