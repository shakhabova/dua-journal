import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    resource,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LucideDynamicIcon } from '@lucide/angular';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import type { Dua, UserDua } from '../../models/dua.model';
import { DuaService } from '../../services/dua.service';

@Component({
    selector: 'app-library',
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        DuaCardComponent,
        AddDuaModalComponent,
        LucideDynamicIcon,
        HlmSkeletonImports,
    ],
    templateUrl: './library.component.html',
    styleUrl: './library.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent {
    private duaService = inject(DuaService);

    userDuasResource = resource({
        params: () => this.duaService.userDuasTrigger(),
        loader: ({ params }) => this.duaService.getUserDuas(),
    });

    libraryDuasResource = resource({
        loader: () => this.duaService.getLibraryDuas(),
    });

    searchQuery = signal('');
    selectedFilter = signal<'Все' | 'Quran' | 'Sunnah'>('Все');

    addedDuaIds = computed(() => {
        const ids = (this.userDuasResource.value() ?? [])
            .map((dua) => dua.originalDuaId)
            .filter((id): id is string => !!id);
        return new Set(ids);
    });

    filteredDuas = computed(() => {
        let duas = this.libraryDuasResource.value() ?? [];
        const query = this.searchQuery().trim().toLowerCase();
        const filter = this.selectedFilter();

        if (filter !== 'Все') {
            duas = duas.filter((d) => d.source === filter);
        }

        if (query) {
            duas = duas.filter(
                (d) =>
                    d.textRu.toLowerCase().includes(query) ||
                    (d.transcription &&
                        d.transcription.toLowerCase().includes(query)) ||
                    (d.reference &&
                        d.reference.toLowerCase().includes(query)) ||
                    (d.textAr && d.textAr.toLowerCase().includes(query)),
            );
        }

        return duas;
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
