import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import { DuaService } from '../../services/dua.service';

@Component({
    selector: 'app-my-duas',
    imports: [DuaCardComponent, AddDuaModalComponent],
    templateUrl: './my-duas.component.html',
    styleUrl: './my-duas.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
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
        return duas.filter((d) => d.category === filter);
    });

    activeCount = computed(
        () => this.myDuas().filter((d) => !d.isAnswered).length,
    );
    answeredCount = computed(
        () => this.myDuas().filter((d) => d.isAnswered).length,
    );

    isModalOpen = signal(false);
    isEditMode = signal(false);
    isFilterOpen = signal(false);
    editingDuaId = signal<string | null>(null);
    editInitialText = signal('');
    editInitialCategory = signal('');

    toggleFilter() {
        this.isFilterOpen.update((v) => !v);
    }

    openModal() {
        this.isEditMode.set(false);
        this.editInitialText.set('');
        this.editInitialCategory.set('Ризк');
        this.isModalOpen.set(true);
    }

    openEditModal(id: string) {
        const dua = this.myDuas().find((d) => d.id === id);
        if (dua) {
            this.isEditMode.set(true);
            this.editingDuaId.set(id);
            this.editInitialText.set(dua.text);
            this.editInitialCategory.set(dua.category || 'Ризк');
            this.isModalOpen.set(true);
        }
    }

    closeModal() {
        this.isModalOpen.set(false);
    }

    saveNewDua(data: { text: string; category: string }) {
        if (this.isEditMode() && this.editingDuaId()) {
            this.duaService.updateUserDua(
                this.editingDuaId()!,
                data.text,
                data.category,
            );
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
        this.isFilterOpen.set(false);
    }
}
