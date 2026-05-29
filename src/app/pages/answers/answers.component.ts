import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';
import { DuaService } from '../../services/dua.service';

@Component({
    selector: 'app-answers',
    imports: [CommonModule, FormsModule, RouterModule, AddDuaModalComponent],
    templateUrl: './answers.component.html',
    styleUrl: './answers.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswersComponent {
    private duaService = inject(DuaService);

    answeredDuas = computed(() =>
        this.duaService.userDuas().filter((d) => d.isAnswered),
    );

    isModalOpen = signal(false);
    isEditMode = signal(false);
    editingDuaId = signal<string | null>(null);
    editInitialText = signal('');
    editInitialCategory = signal('');

    openEditModal(id: string) {
        const dua = this.answeredDuas().find((d) => d.id === id);
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
        }
        this.closeModal();
    }

    deleteDua(id: string) {
        this.duaService.deleteUserDua(id);
    }

    unmarkAnswered(id: string) {
        this.duaService.unmarkAsAnswered(id);
    }

    updateAnswerNote(id: string, note: string) {
        this.duaService.updateAnswerNote(id, note);
    }
}
