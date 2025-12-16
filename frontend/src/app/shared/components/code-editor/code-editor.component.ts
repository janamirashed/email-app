import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as ace from 'ace-builds';

@Component({
    selector: 'app-code-editor',
    standalone: true,
    imports: [CommonModule],
    template: '<div #editor class="w-full h-full"></div>',
    styles: [':host { display: block; height: 100%; width: 100%; }']
})
export class CodeEditorComponent implements AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('editor') private editorRef!: ElementRef<HTMLElement>;

    @Input() content: string = '';
    @Input() language: string = 'html';
    @Input() theme: string = 'twilight';
    @Input() readOnly: boolean = false;

    @Output() contentChange = new EventEmitter<string>();

    private editor: ace.Ace.Editor | undefined;

    constructor() { }

    ngAfterViewInit(): void {
        // Set base path to CDN to avoid asset configuration issues
        ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.32.2/src-noconflict');

        this.editor = ace.edit(this.editorRef.nativeElement);
        this.editor.setTheme(`ace/theme/${this.theme}`);
        this.editor.session.setMode(`ace/mode/${this.language}`);
        this.editor.setValue(this.content || '', -1);
        this.editor.setReadOnly(this.readOnly);
        this.editor.setOptions({
            fontSize: '14px',
            showPrintMargin: false,
            useWorker: false, // Disable worker to avoid cross-origin issues with CDN
            minLines: 20,
            maxLines: Infinity
        });

        this.editor.on('change', () => {
            const value = this.editor?.getValue() || '';
            if (value !== this.content) {
                this.content = value;
                this.contentChange.emit(value);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.editor) {
            if (changes['content'] && !this.editor.isFocused()) {
                const currentVal = this.editor.getValue();
                if (currentVal !== this.content) {
                    this.editor.setValue(this.content || '', -1);
                }
            }
            if (changes['theme']) {
                this.editor.setTheme(`ace/theme/${this.theme}`);
            }
            if (changes['language']) {
                this.editor.session.setMode(`ace/mode/${this.language}`);
            }
            if (changes['readOnly']) {
                this.editor.setReadOnly(this.readOnly);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.destroy();
            this.editor.container.remove();
        }
    }
}
