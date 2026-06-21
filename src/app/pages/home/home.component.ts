import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    resource,
    signal,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { AddDuaModalComponent } from '../../components/add-dua-modal/add-dua-modal.component';
import { DuaCardComponent } from '../../components/dua-card/dua-card.component';
import type { Dua } from '../../models/dua.model';
import { DuaService } from '../../services/dua.service';

@Component({
    selector: 'app-home',
    imports: [
        DuaCardComponent,
        AddDuaModalComponent,
        LucideDynamicIcon,
        HlmSkeletonImports,
    ],
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
        if (duas.length === 0) return undefined;
        const seed = getDailySeed(0);
        const random = mulberry32(seed);
        const index = Math.floor(random() * duas.length);
        return duas[index];
    });

    quranDuas = computed(() => {
        const duas = (this.libraryDuasResource.value() ?? []).filter(
            (d) => d.source === 'Quran',
        );
        return getDailySelection(duas, 5, getDailySeed(100));
    });

    sunnahDuas = computed(() => {
        const duas = (this.libraryDuasResource.value() ?? []).filter(
            (d) => d.source === 'Sunnah',
        );
        return getDailySelection(duas, 5, getDailySeed(200));
    });

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

        this.duaService.addUserDua(data.text, data.category, dua.id);
        this.closeCategoryModal();
        this.userDuasResource.reload();
    }
}

function getDailySeed(offset = 0): number {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return year * 10000 + month * 100 + day + offset;
}

function mulberry32(a: number) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seededShuffle<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    const random = mulberry32(seed);
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

function getDailySelection<T>(array: T[], count: number, seed: number): T[] {
    if (array.length <= count) {
        return array;
    }
    return seededShuffle(array, seed).slice(0, count);
}
