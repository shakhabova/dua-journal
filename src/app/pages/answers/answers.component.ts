import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    resource,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import { DuaService } from '../../services/dua.service';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
    selector: 'app-answers',
    imports: [CommonModule, FormsModule, RouterModule, AddDuaModalComponent, DuaCardComponent, LucideDynamicIcon],
    templateUrl: './answers.component.html',
    styleUrl: './answers.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnswersComponent {
    private duaService = inject(DuaService);
    private noteUpdate$ = new Subject<{ id: string; note: string }>();

    userDuasResource = resource({
        loader: () => this.duaService.getUserDuas(),
    });

    answeredDuas = computed(() =>
        (this.userDuasResource.value() ?? []).filter((d) => d.isAnswered),
    );

    isModalOpen = signal(false);
    isEditMode = signal(false);
    editingDuaId = signal<string | null>(null);
    editInitialText = signal('');
    editInitialCategory = signal('');

    constructor() {
        this.noteUpdate$
            .pipe(debounceTime(300), takeUntilDestroyed())
            .subscribe(({ id, note }) => {
                this.duaService.updateAnswerNote(id, note);
            });
    }

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
        const editingDuaId = this.editingDuaId();
        if (this.isEditMode() && editingDuaId) {
            this.duaService.updateUserDua(
                editingDuaId,
                data.text,
                data.category,
            );
        }
        this.closeModal();
        this.userDuasResource.reload();
    }

    deleteDua(id: string) {
        this.duaService.deleteUserDua(id);
        this.userDuasResource.reload();
    }

    unmarkAnswered(id: string) {
        this.duaService.unmarkAsAnswered(id);
        this.userDuasResource.reload();
    }

    updateAnswerNote(id: string, note: string) {
        this.noteUpdate$.next({ id, note });
    }
}
