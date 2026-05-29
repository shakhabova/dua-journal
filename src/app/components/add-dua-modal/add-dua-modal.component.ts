import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    input,
    type OnInit,
    Output,
    signal,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-dua-modal',
    imports: [FormsModule],
    templateUrl: './add-dua-modal.component.html',
    styleUrl: './add-dua-modal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDuaModalComponent implements OnInit {
    editMode = input(false);
    initialText = input('');
    initialCategory = input('Ризк');

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ text: string; category: string }>();

    newText = signal('');
    selectedCategory = signal('Ризк');

    categories = ['Ризк', 'Семья', 'Здоровье', 'Друзья', 'Работа'];

    ngOnInit() {
        this.newText.set(this.initialText());
        this.selectedCategory.set(this.initialCategory());
    }

    selectCategory(cat: string) {
        this.selectedCategory.set(cat);
    }

    onSave() {
        if (this.newText().trim().length > 0) {
            this.save.emit({
                text: this.newText().trim(),
                category: this.selectedCategory(),
            });
        }
    }

    onClose() {
        this.close.emit();
    }
}
