import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { LabellingModeService } from '../../shared/services/labelling-mode-service';
import { from, Observable, Subject, Subscription } from 'rxjs';
import { GuiColumn, GuiDataType, GuiRowClass } from '@generic-ui/ngx-grid';
import { take, takeUntil } from 'rxjs/operators';
import { ModalBodyStyle } from '../../shared/types/modal/modal.model';
import { ModalService } from '../../shared/components/modal/modal.service';
import {
    annotationsStats,
    Data,
    Features,
    Labels,
    RemovedFeature,
} from '../../shared/types/tabular-labelling/tabular-labelling.model';
import { TabularLabellingLayoutService } from './tabular-labelling-layout.service';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout-api.service';
import { Router } from '@angular/router';
import { ChartProps } from '../../shared/types/dataset-layout/data-set-layout.model';
import { labels_stats } from '../../shared/types/message/message.model';

@Component({
    selector: 'app-tabular-labelling-layout',
    templateUrl: './tabular-labelling-layout.component.html',
    styleUrls: ['./tabular-labelling-layout.component.scss'],
})
export class TabularLabellingLayoutComponent implements OnInit, OnDestroy, OnChanges {
    private subject: Subject<any> = new Subject<any>();
    private subscription!: Subscription;
    projectName: string = '';
    tabularData: any[] = [];
    tabularDataObservable!: Observable<any>;
    headersTypeMap: Map<string, GuiDataType> = new Map<string, GuiDataType>();

    // data grid properties
    sizeOptions: Array<string> = ['5 000', '25 000', '50 000', '100 000', '200 000', '1 000000'];
    selectedSize: string = this.sizeOptions[0];
    columns: Array<GuiColumn> = [];
    source: Array<any> = [];
    labels: Labels[] = [];
    annotations: Labels[] = [];
    annotationIndexMap: Map<number, Labels[]> = new Map();
    retrievedData: Data[] = [];
    features: Features[] = [];
    currentDataIndex: number = 0;
    labeledData: Labels[] = [];
    isToggleSideMenu: boolean = false;
    isToggleLabelSection: boolean = false;
    isToggleGraphSection: boolean = false;
    isToggleExportSection: boolean = false;
    isToggleTabularTableSection: boolean = false;
    isLabelsContainerToggle: boolean = false;
    clickedLabelIndex: number = 0;
    isAnnotations: boolean = false;
    isLabel: boolean = false;
    form: FormGroup;
    defaultChecked: boolean = true;
    graphType: string[] = ['Line Chart', 'Bar Chart', 'Pie Chart'];
    unsubscribe$: Subject<any> = new Subject();
    removedSelectedFeatures: RemovedFeature[] = [];
    selectFeatureIndex!: number;
    statistics: ChartProps[] = [];
    colorScheme = {
        domain: ['#659DBD', '#379683', '#8EE4AF', '#E7717D', '#F13C20', '#FF652F', '#376E6F'],
    };

    rowClass: GuiRowClass = {
        class: 'tabular-row',
    };

    readonly modalPlotGraph = 'modal-plot-graph';
    readonly modalTabularDataView = 'modal-tabular-data-view';
    plotGraphBodyStyle: ModalBodyStyle = {
        height: '73vh',
        width: '60vw',
        margin: '5vw 5vh',
        overflowY: 'none',
    };
    tabularDataViewBodyStyle: ModalBodyStyle = {
        maxHeight: '85vh',
        minWidth: '80vw',
        margin: '2vw 2vh',
        overflowY: 'none',
    };

    @ViewChild('inputLabel') inputLabel!: ElementRef<HTMLInputElement>;
    @ViewChild('selectedColor') selectedColor!: ElementRef<HTMLInputElement>;
    @ViewChild('labelColor') labelColor!: ElementRef<HTMLInputElement>;
    @ViewChild('checkBox') checkBox!: ElementRef<HTMLInputElement>;

    constructor(
        private labellingModeService: LabellingModeService,
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: ModalService,
        private tabularLabellingLayoutService: TabularLabellingLayoutService,
        private fb: FormBuilder,
        private _dataSetService: DataSetLayoutService,
        public _router: Router,
    ) {
        this.form = this.fb.group({
            checkArray: this.fb.array([]),
        });
    }

    ngOnInit(): void {
        this.projectName = this.tabularLabellingLayoutService.getRouteState(history).projectName;
        this.getTabularData();
    }

    ngOnChanges(changes: SimpleChanges) {}

    getTabularData() {
        const tabularData$ = this.tabularLabellingLayoutService.getTabularData(this.projectName);
        this.subscription = this.subject
            .pipe(() => tabularData$)
            .subscribe(
                (response) => {
                    this.tabularData = response;
                },
                (err) => console.error(err),
                () => {
                    this.generateColumnsArray();
                    this.getAttributesAndValue(this.currentDataIndex);
                    this.tabularDataObservable = from(this.tabularData);
                },
            );
    }

    generateColumnsArray() {
        const data = this.tabularData[0];

        const isNumber = (inputData: any): boolean => {
            return !isNaN(inputData);
        };

        for (const [key, value] of Object.entries(data)) {
            if (isNumber(value)) {
                this.headersTypeMap.set(key, GuiDataType.NUMBER);
            } else {
                this.headersTypeMap.set(key, GuiDataType.STRING);
            }
        }

        for (const [key, value] of this.headersTypeMap) {
            this.features.push({ featureName: key, checked: true });
            this.columns.push({
                header: key,
                type: value,
                field: key,
            });
        }
    }

    sizeSelected(selectedSize: string): void {
        this.generateSource(selectedSize);
    }

    createSourceObservable() {
        this.generateSource(this.selectedSize);
    }

    generateSource(selectedSize: string): void {
        const size = Number(selectedSize.split(' ').join(''));

        this.tabularDataObservable.pipe(take(size)).subscribe(
            (response) => {
                this.source.push(response);
            },
            (error) => {
                console.error(error);
            },
            () => {
                this.modalService.open(this.modalTabularDataView);
            },
        );
    }

    getAttributesAndValue(index: number) {
        this.retrievedData = [];
        this.removedSelectedFeatures = [];

        const data = this.tabularData[index];

        for (const [key, value] of Object.entries(data)) {
            this.retrievedData.push({
                name: key,
                value: String(value),
            });
        }

        for (let i = 0; i < this.features.length; i++) {
            this.appendFeaturesBasedOnCheckedStatus(this.features[i].featureName, this.features[i].checked);
        }
    }

    getPreviousAttributesAndValue() {
        if (this.currentDataIndex === 0) {
            return;
        }
        this.currentDataIndex--;
        this.getAttributesAndValue(this.currentDataIndex);
        this.annotations = this.annotationIndexMap.get(this.currentDataIndex) as Labels[];
    }

    getNextAttributesAndValue() {
        this.annotations = [];
        if (this.currentDataIndex === this.tabularData.length) {
            return;
        }
        this.currentDataIndex++;
        this.getAttributesAndValue(this.currentDataIndex);
        if (this.annotationIndexMap.has(this.currentDataIndex)) {
            this.annotations = this.annotationIndexMap.get(this.currentDataIndex) as Labels[];
        }
    }

    selectLabel() {
        const inputLabel = this.inputLabel.nativeElement.value;
        if (inputLabel === '') {
            return;
        }
        this.inputLabel.nativeElement.value = '';
        this.labels.push({ labelName: inputLabel, tagColor: '#254E58' });
    }

    getIndex = (index: number): void => {
        this.clickedLabelIndex = index;
    };

    selectColor() {
        const color = this.selectedColor.nativeElement.value;
        this.labels[this.clickedLabelIndex].tagColor = color;
    }

    chooseLabel(index: number) {
        if (!this.annotations.includes(this.labels[index])) {
            this.annotations.push(this.labels[index]);
        }

        if (!this.annotationIndexMap.has(this.currentDataIndex)) {
            this.annotationIndexMap.set(this.currentDataIndex, [this.labels[index]]);
        } else {
            const value = this.annotationIndexMap.get(this.currentDataIndex) as Labels[];
            if (!value.includes(this.labels[index])) {
                value.push(this.labels[index]);
            }
        }
    }

    toggleAnnotations() {
        this.isAnnotations = !this.isAnnotations;
    }

    toggleMenu() {
        this.isToggleSideMenu = !this.isToggleSideMenu;
        this.isToggleLabelSection = true;
        this.isToggleTabularTableSection = true;
        this.isToggleExportSection = false;
        this.isToggleGraphSection = false;
    }

    toggleLabelSection() {
        this.isToggleLabelSection = !this.isToggleLabelSection;
        this.isToggleExportSection = false;
        this.isToggleGraphSection = false;
        this.isToggleTabularTableSection = false;
    }

    toggleGraphSection() {
        this.isToggleGraphSection = !this.isToggleGraphSection;
        this.isToggleExportSection = false;
        this.isToggleTabularTableSection = false;
    }

    toggleTabularTableSection() {
        this.isToggleTabularTableSection = !this.isToggleTabularTableSection;
        this.isToggleExportSection = false;
        this.isToggleGraphSection = false;
    }

    toggleExportSection() {
        this.isToggleExportSection = !this.isToggleExportSection;
        this.isToggleGraphSection = false;
        this.isToggleTabularTableSection = false;
    }

    toggleLabels() {
        this.isLabelsContainerToggle = !this.isLabelsContainerToggle;
    }

    checkFeatureCheckedStatus(event: any) {
        const featureName = event.target.value;
        const checked = event.target.checked;
        this.features[this.selectFeatureIndex].checked = checked;
        this.appendFeaturesBasedOnCheckedStatus(featureName, checked);
    }

    appendFeaturesBasedOnCheckedStatus(featureName: string, checked: boolean) {
        if (checked == false) {
            const dataIndex = this.retrievedData.findIndex((ele) => ele.name === featureName);
            const removeRow = this.retrievedData.splice(dataIndex, 1);
            const removedData: RemovedFeature = {
                name: removeRow[0].name,
                value: removeRow[0].value,
                index: dataIndex,
            };
            this.removedSelectedFeatures.push(removedData);
        }

        if (checked == true) {
            if (this.removedSelectedFeatures.length == 0) {
                return;
            }

            const dataIndex = this.removedSelectedFeatures.findIndex((ele) => ele.name === featureName);

            if (dataIndex === -1) {
                return;
            }

            const data = this.removedSelectedFeatures.splice(dataIndex, 1);
            const addedData: Data = { name: data[0].name, value: data[0].value };
            this.retrievedData.splice(data[0].index, 0, addedData);
        }
    }

    getFeatureIndex(index: number) {
        this.selectFeatureIndex = index;
    }

    plotGraph() {
        const map = this.calculateAnnotationNumber();

        if (map.size == 0) {
            alert('No annotations found');
            return;
        }

        map.forEach((key, value, map) => {
            const data = {
                name: value,
                value: key,
            };
            this.statistics.push(data);
        });
        this.modalService.open(this.modalPlotGraph);
    }

    calculateAnnotationNumber() {
        let list: any[] = [];
        let annotationNumberMap: Map<string, number> = new Map();

        for (let i = 0; i < this.annotationIndexMap.size; i++) {
            const array = [];
            const value = this.annotationIndexMap.get(i) as Labels[];
            for (const v of value) {
                array.push(v.labelName);
            }
            list.push(...array);
        }

        annotationNumberMap = list.reduce((arr, item) => arr.set(item, (arr.get(item) || 0) + 1), new Map());
        return annotationNumberMap;
    }

    @HostListener('window:keydown', ['$event'])
    keyStrokeEvent({ altKey, key }: KeyboardEvent) {
        try {
            switch (key) {
                case altKey && 'a':
                    this.toggleLabels();
                    this.isLabel = !this.isLabel;
                    break;
                case altKey && 'c':
                    this.toggleAnnotations();
                    break;
                case 'ArrowLeft':
                    if (this.currentDataIndex == 0) {
                        return;
                    }
                    this.getPreviousAttributesAndValue();
                    break;
                case 'ArrowRight':
                    if (this.currentDataIndex == this.tabularData.length) {
                        return;
                    }
                    this.getNextAttributesAndValue();
                    break;
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('window:beforeunload', ['$event'])
    onWindowClose(event: BeforeUnloadEvent): void {
        this.resetProjectStatus();
        event.preventDefault();
    }

    resetProjectStatus = (projectName = this.projectName) => {
        projectName.trim() &&
            this._dataSetService
                .manualCloseProject(projectName)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(({ message }) => {
                    this._router.navigate(['/']);
                });
    };

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.labellingModeService.setLabellingMode(null);
        this.resetProjectStatus();
    }
}
