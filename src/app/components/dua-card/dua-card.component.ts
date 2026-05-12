import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-dua-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dua-card.component.html',
  styleUrl: './dua-card.component.css'
})
export class DuaCardComponent {
  @Input() id?: string;
  @Input() text: string = '';
  @Input() textAr?: string;
  @Input() transcription?: string;
  @Input() reference?: string;
  @Input() category?: string;
  @Input() date?: Date | string;
  @Input() isAnswered?: boolean = false;
  @Input() hideAnswerAction?: boolean = false;
  @Input() actionText?: string;
  @Input() isMain?: boolean = false; // For the big daily card
  @Input() isAdded?: boolean = false;
  
  @Output() actionClick = new EventEmitter<void>();
  @Output() markAnswered = new EventEmitter<string>();
  @Output() editClicked = new EventEmitter<string>();
  @Output() deleteClicked = new EventEmitter<string>();
  @Output() unmarkAnswered = new EventEmitter<string>();

  isAnimating = false;
  isAnimatingAdded = false;
  isExporting = false;
  isFlipped = false;
  showDropdown = false;

  constructor(private eRef: ElementRef, private cdr: ChangeDetectorRef) {}

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(this.showDropdown && !this.eRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  onEdit() {
    this.showDropdown = false;
    if(this.id) this.editClicked.emit(this.id);
  }

  onDelete() {
    this.showDropdown = false;
    if(this.id) this.deleteClicked.emit(this.id);
  }

  onUnmark() {
    this.showDropdown = false;
    if(this.id) this.unmarkAnswered.emit(this.id);
  }

  onBtnClick() {
    if (this.actionText && !this.isAdded) {
      this.isAnimatingAdded = true;
      setTimeout(() => {
        this.actionClick.emit();
        this.isAnimatingAdded = false;
      }, 600);
    }
  }

  async onShare() {
    // Check if we are already sharing to prevent duplicate clicks
    if (this.isExporting) return;
    
    this.isExporting = true;
    this.cdr.detectChanges(); // Trigger Angular to hide UI elements
    await new Promise(r => setTimeout(r, 50)); // allow DOM refresh

    try {
      const element = this.eRef.nativeElement.querySelector('.dua-card');
      const canvas = await html2canvas(element, {
        scale: 2, 
        backgroundColor: '#FAF7F2',
        useCORS: true
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob rendering failed');
        this.isExporting = false;
        this.cdr.detectChanges();

        const file = new File([blob], 'dua.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Личное пространство ду‘а',
              files: [file]
            });
          } catch (e) {
            console.error('Share cancelled or failed', e);
          }
        } else {
          // Fallback download if direct share isn't supported
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'dua-journal.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('html2canvas failed:', err);
      this.isExporting = false;
      this.cdr.detectChanges();
      
      // Final fallback to text copy
      const shareText = `"${this.text}"\n\n${this.reference || ''}\n\n— Личное пространство ду‘а`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Не удалось создать картинку, но текст скопирован!');
      });
    }
  }

  onMarkAnswered() {
    if (!this.isAnswered && this.id) {
      this.isAnimating = true;
      setTimeout(() => {
        this.markAnswered.emit(this.id);
        this.isAnimating = false;
        this.isAnswered = true;
      }, 600);
    }
  }

  toggleFlip(event?: Event) {
    if (!this.textAr) return;

    if (event) {
      const target = event.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('.icon-btn') ||
        target.closest('.action-btn') ||
        target.closest('.dropdown-container') ||
        target.closest('.action-wrapper')
      ) {
        return;
      }
    }

    if (this.isExporting) return;
    this.isFlipped = !this.isFlipped;
  }
}
