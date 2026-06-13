import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    resource,
    signal,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import type { Dua } from '../../models/dua.model';
import { DuaService } from '../../services/dua.service';

@Component({
    selector: 'app-home',
    imports: [DuaCardComponent, AddDuaModalComponent, LucideDynamicIcon],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
    private duaService = inject(DuaService);

    userDuasResource = resource({
        params: () => this.duaService.userDuasTrigger(),
        loader: () => this.duaService.getUserDuas(),
    });

    libraryDuasResource = resource({
        loader: () => this.duaService.getLibraryDuas(),
    });

    dailyDua = computed<Dua | undefined>(() => {
        const duas = this.libraryDuasResource.value() ?? [];
        return duas[0];
    });

    quranDuas = computed(() =>
        (this.libraryDuasResource.value() ?? []).filter(
            (d) => d.source === 'Quran',
        ),
    );

    sunnahDuas = computed(() =>
        (this.libraryDuasResource.value() ?? []).filter(
            (d) => d.source === 'Sunnah',
        ),
    );

    addedDuaIds = computed(() => {
        const ids = (this.userDuasResource.value() ?? [])
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
        this.userDuasResource.reload();
    }
}
