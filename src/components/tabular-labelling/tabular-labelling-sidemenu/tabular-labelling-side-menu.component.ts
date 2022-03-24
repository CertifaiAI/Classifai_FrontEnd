import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { label } from '../../../shared/types/tabular-labelling/tabular-labelling.model';
import { ModalService } from '../../../shared/components/modal/modal.service';

@Component({
    selector: 'tabular-labelling-side-menu',
    templateUrl: './tabular-labelling-side-menu.component.html',
    styleUrls: ['./tabular-labelling-side-menu.component.scss'],
})
export class TabularLabellingSideMenuComponent implements OnInit, OnChanges {
    invalidInput: boolean = false;
    tempLabels: label[] = [];

    @Input() labels!: label[];
    @Input() selectedConditions!: string[];
    @Input() isToggleLabelSection!: boolean;
    @Input() isToggleConditionsSection!: boolean;
    @Input() conditions!: string[];
    @Output() onCreateLabel: EventEmitter<label> = new EventEmitter();
    @Output() onSelectLabelColor: EventEmitter<string> = new EventEmitter();
    @Output() onDeleteLabel: EventEmitter<label> = new EventEmitter();
    @Output() onSelectLabelIndex: EventEmitter<number> = new EventEmitter();
    @Output() onCreateCondition: EventEmitter<string> = new EventEmitter();
    @Output() onClick: EventEmitter<void> = new EventEmitter();
    @ViewChild('inputLabel') inputLabel!: ElementRef<HTMLInputElement>;

    ngOnInit() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.conditions) {
            this.conditions = changes.conditions.currentValue;
        }
    }

    createLabel(event: any) {
        let label;
        const input = event.target.value.trim();
        if (input === '') {
            return;
        }
        this.inputLabel.nativeElement.value = '';
        const validInput: boolean = input.match(/^[a-zA-Z0-9-]*$/) ? true : false;
        if (validInput) {
            const existName = this.labels.filter((ele) => ele.labelName == input);
            if (existName.length == 0) {
                this.invalidInput = false;
                label = { labelName: input, tagColor: '#254E58' };
            } else {
                this.invalidInput = true;
                console.error('Existing label');
            }
        } else {
            this.invalidInput = true;
            console.error('Invalid label');
        }
        this.onCreateLabel.emit(label);
    }

    selectColor(event: any) {
        const color = event.target.value;
        this.onSelectLabelColor.emit(color);
    }

    removeLabel(label: label) {
        this.onDeleteLabel.emit(label);
    }

    getIndex(index: number) {
        this.onSelectLabelIndex.emit(index);
    }

    createCondition(event: any) {
        const inputCondition = event.target.value.trim();
        if (inputCondition === '') {
            return;
        }
        this.inputLabel.nativeElement.value = '';
        const validInput: boolean = inputCondition.match(/^[a-zA-Z0-9-]*$/) ? true : false;
        if (validInput) {
            this.onCreateCondition.emit(inputCondition);
        } else {
            this.invalidInput = true;
            console.log('Invalid label');
        }
    }

    onClickAddConditions() {
        this.onClick.emit();
    }
}
