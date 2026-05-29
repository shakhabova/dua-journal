import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import type { Dua } from '../../models/dua.model';
import { DuaService } from '../../services/dua.service';

@Component({
    selector: 'app-home',
    imports: [DuaCardComponent, AddDuaModalComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
    private duaService = inject(DuaService);

    dailyDua = signal<Dua>(this.duaService.getDailyDua());
    quranDuas = signal<Dua[]>(
        this.duaService.getLibraryDuas().filter((d) => d.source === 'Quran'),
    );
    sunnahDuas = signal<Dua[]>(
        this.duaService.getLibraryDuas().filter((d) => d.source === 'Sunnah'),
    );

    addedDuaIds = computed(() => {
        const ids = this.duaService
            .userDuas()
            .map((dua) => dua.originalDuaId)
            .filter((id): id is string => !!id);
        return new Set(ids);
    });
    isCategoryModalOpen = signal(false);
    selectedLibraryDua = signal<Dua | null>(null);

    addToMyDuas(dua: Dua) {
        this.selectedLibraryDua.set(dua);
        this.isCategoryModalOpen.set(true);
    }

    closeCategoryModal() {
        this.isCategoryModalOpen.set(false);
        this.selectedLibraryDua.set(null);
    }

    saveLibraryDua(data: { text: string; category: string }) {
        const dua = this.selectedLibraryDua();
        if (!dua) return;

        this.duaService.addUserDua(data.text, data.category, dua.id, {
            textAr: dua.textAr,
            transcription: dua.transcription,
            reference: dua.reference,
        });
        this.closeCategoryModal();
    }
}
