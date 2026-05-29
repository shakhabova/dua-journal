import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-dua-modal',
    imports: [FormsModule],
    templateUrl: './add-dua-modal.component.html',
    styleUrl: './add-dua-modal.component.css'
})
export class AddDuaModalComponent implements OnInit {
  @Input() editMode = false;
  @Input() initialText = '';
  @Input() initialCategory = 'Ризк';
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ text: string, category: string }>();

  newText = '';
  selectedCategory = 'Ризк';
  
  categories = ['Ризк', 'Семья', 'Здоровье', 'Друзья', 'Работа'];

  ngOnInit() {
    this.newText = this.initialText;
    this.selectedCategory = this.initialCategory;
  }

  selectCategory(cat: string) {
    this.selectedCategory = cat;
  }

  onSave() {
    if (this.newText.trim().length > 0) {
      this.save.emit({ text: this.newText.trim(), category: this.selectedCategory });
    }
  }

  onClose() {
    this.close.emit();
  }
}
