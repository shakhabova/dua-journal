import { CommonModule, DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    input,
    Output,
    signal,
} from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';

@Component({
    selector: 'app-dua-card',
    imports: [CommonModule, DatePipe, LucideDynamicIcon],
    templateUrl: './dua-card.component.html',
    styleUrl: './dua-card.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuaCardComponent {
    id = input<string>();
    text = input.required<string>();
    textAr = input<string>();
    transcription = input<string>();
    reference = input<string>();
    category = input<string>();
    date = input<Date | string>();
    isAnswered = input<boolean>(false);
    hideAnswerAction = input<boolean>(false);
    actionText = input<string>();
    isMain = input<boolean>(false); // For the big daily card
    isAdded = input<boolean>(false);
    source = input<string>();

    @Output() actionClick = new EventEmitter<void>();
    @Output() markAnswered = new EventEmitter<string>();
    @Output() editClicked = new EventEmitter<string>();
    @Output() deleteClicked = new EventEmitter<string>();
    @Output() unmarkAnswered = new EventEmitter<string>();

    isAnimating = signal(false);
    isAnimatingAdded = signal(false);
    isExporting = signal(false);
    isFlipped = signal(false);
    showDropdown = signal(false);

    constructor(private eRef: ElementRef) {}

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (
            this.showDropdown() &&
            !this.eRef.nativeElement.contains(event.target)
        ) {
            this.showDropdown.set(false);
        }
    }

    toggleDropdown(event: Event) {
        event.stopPropagation();
        this.showDropdown.update((v) => !v);
    }

    onEdit() {
        this.showDropdown.set(false);
        if (this.id()) this.editClicked.emit(this.id()!);
    }

    onDelete() {
        this.showDropdown.set(false);
        if (this.id()) this.deleteClicked.emit(this.id()!);
    }

    onUnmark() {
        this.showDropdown.set(false);
        if (this.id()) this.unmarkAnswered.emit(this.id()!);
    }

    onBtnClick() {
        if (this.actionText() && !this.isAdded()) {
            this.isAnimatingAdded.set(true);
            setTimeout(() => {
                this.actionClick.emit();
                this.isAnimatingAdded.set(false);
            }, 600);
        }
    }

    async onShare() {
        // Use Left-to-Right Mark (\u200E) to force LTR text direction in chat clients like Telegram
        let shareText = '\u200E';
        if (this.textAr()) {
            shareText += `${this.textAr()}\n\n\u200E`;
        }
        shareText += `«${this.text()}»\n\n\u200E`;

        let sourceLabel = '';
        if (this.source() === 'Quran') {
            sourceLabel = 'Коран';
        } else if (this.source() === 'Sunnah') {
            sourceLabel = 'Сунна';
        } else if (this.reference()) {
            const ref = this.reference()?.toLowerCase() || '';
            if (ref.includes('коран') || ref.includes('сура')) {
                sourceLabel = 'Коран';
            } else if (
                ref.includes('бухари') ||
                ref.includes('муслим') ||
                ref.includes('тирмизи') ||
                ref.includes('дауд') ||
                ref.includes('ахмад') ||
                ref.includes('хаким') ||
                ref.includes('табарани')
            ) {
                sourceLabel = 'Сунна';
            }
        }

        let sourceLine = '';
        if (this.reference()) {
            const ref = this.reference()!;
            const refLower = ref.toLowerCase();
            if (sourceLabel && !refLower.includes(sourceLabel.toLowerCase())) {
                sourceLine = `Источник: ${sourceLabel}, ${ref}`;
            } else {
                sourceLine = `Источник: ${ref}`;
            }
        } else if (sourceLabel) {
            sourceLine = `Источник: ${sourceLabel}`;
        }

        if (sourceLine) {
            shareText += `${sourceLine}\n\n\u200E`;
        }

        shareText += `—\nЛичное пространство ду’а\ndua-journal.com`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Личное пространство ду’а',
                    text: shareText,
                });
            } catch (e) {
                console.error('Share failed', e);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Текст ду’а скопирован в буфер обмена!');
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    }

    onMarkAnswered() {
        if (!this.isAnswered() && this.id()) {
            this.isAnimating.set(true);
            setTimeout(() => {
                this.markAnswered.emit(this.id()!);
                this.isAnimating.set(false);
            }, 600);
        }
    }

    isSunnahDua(): boolean {
        if (this.source() === 'Sunnah') {
            return true;
        }
        if (this.reference()) {
            const ref = this.reference()?.toLowerCase() || '';
            return (
                ref.includes('бухари') ||
                ref.includes('муслим') ||
                ref.includes('тирмизи') ||
                ref.includes('дауд') ||
                ref.includes('ахмад') ||
                ref.includes('хаким') ||
                ref.includes('табарани') ||
                ref.includes('ибн маджа') ||
                ref.includes('маджа')
            );
        }
        return false;
    }

    toggleFlip(event?: Event) {
        if (!this.textAr()) return;

        if (event) {
            const target = event.target as HTMLElement;
            if (
                target.closest('button') ||
                target.closest('textarea') ||
                target.closest('label') ||
                target.closest('.icon-btn') ||
                target.closest('.action-btn') ||
                target.closest('.dropdown-container') ||
                target.closest('.action-wrapper') ||
                target.closest('[card-extension]') ||
                target.closest('.gratitude-block')
            ) {
                return;
            }
        }

        if (this.isExporting()) return;
        this.isFlipped.update((v) => !v);
    }
}
