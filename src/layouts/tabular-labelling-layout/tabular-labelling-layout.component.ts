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
import { forkJoin, from, interval, Observable, Subject, Subscription } from 'rxjs';
import { GuiColumn, GuiDataType, GuiRowClass } from '@generic-ui/ngx-grid';
import { first, mergeMap, take, takeUntil } from 'rxjs/operators';
import { ModalBodyStyle } from '../../shared/types/modal/modal.model';
import { ModalService } from '../../shared/components/modal/modal.service';
import {
    annotationsStats,
    Data,
    Features,
    label,
    RemovedFeature,
} from '../../shared/types/tabular-labelling/tabular-labelling.model';
import { TabularLabellingLayoutService } from './tabular-labelling-layout.service';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout-api.service';
import { Router } from '@angular/router';
import { ChartProps } from '../../shared/types/dataset-layout/data-set-layout.model';
import { labels_stats } from '../../shared/types/message/message.model';
import { LanguageService } from '../../shared/services/language.service';
import { assertNotNull } from '@angular/compiler/src/output/output_ast';
import { ExportSaveFormatService, ProcessResponse, SaveFormat } from '../../shared/services/export-save-format.service';
import { revokeObjectURL } from 'blob-util';
import { cond } from 'lodash-es';
import { createAotCompiler } from '@angular/compiler';

type conditionSet = {
    type: string;
    isSet: boolean;
    buttonLabel: string;
    isToggleAttributes: boolean;
    isToggleOperator: boolean;
    isToggleLowerOperator: boolean;
    isToggleUpperOperator: boolean;
    isToggleAnnotation: boolean;
};

type threshold = {
    attribute?: string;
    operator?: string;
    value?: number | string;
    label?: label;
};

type range = {
    attribute?: string;
    lowerOperator?: string;
    upperOperator?: string;
    lowerLimit?: number | string;
    upperLimit?: number | string;
    label?: label;
};

type tempAnnotations = {
    labelName: string;
    isSelected: boolean;
};

enum DataType {
    STRING = 'string',
    NUMBER = 'number',
    DATE = 'date',
}

@Component({
    selector: 'app-tabular-labelling-layout',
    templateUrl: './tabular-labelling-layout.component.html',
    styleUrls: ['./tabular-labelling-layout.component.scss'],
})
export class TabularLabellingLayoutComponent implements OnInit, OnDestroy, OnChanges {
    private subject: Subject<any> = new Subject<any>();
    private subscription!: Subscription;
    projectName: string = '';
    tabularData!: any;
    tabularDataObservable!: Observable<any>;
    headersTypeMap: Map<string, GuiDataType> = new Map<string, GuiDataType>();
    attributeTypeMap: Map<string, DataType> = new Map<string, DataType>();
    private sizeOptions: Array<string> = ['5 000', '25 000', '50 000', '100 000', '200 000', '1 000000'];
    private selectedSize: string = this.sizeOptions[0];
    columns: Array<GuiColumn> = [];
    source: Array<any> = [];
    labels: label[] = [];
    annotations: label[] = [];
    annotationIndexMap: Map<number, label[] | null> = new Map();
    retrievedData: Data[] = [];
    features: Features[] = [];
    currentDataIndex: number = 0;
    labeledData: label[] = [];
    isToggleLabelSection: boolean = true;
    isToggleConditionSection: boolean = true;
    isOptionContainerToggle: boolean = false;
    isToggleConditionType: boolean = false;
    isSelectAttribute: boolean = false;
    isSelectOperator: boolean = false;
    isSelectTargetAnnotation: boolean = false;
    clickedLabelIndex: number = 0;
    form: FormGroup;
    defaultChecked: boolean = true;
    graphType: string[] = ['Line Chart', 'Bar Chart', 'Pie Chart'];
    excludeKeys: string[] = ['UUID', 'PROJECT_NAME', 'FILENAME', 'LABEL'];
    operatorTypes: string[] = [
        'more than',
        'more than or equal to',
        'equal to',
        'less than or equal to',
        'less than',
        'not equal to',
    ];
    lowerOperatorTypes: string[] = ['more than', 'more than or equal to'];
    upperOperatorTypes: string[] = ['less than or equal to', 'less than'];
    unsubscribe$: Subject<any> = new Subject();
    removedSelectedFeatures: RemovedFeature[] = [];
    statistics: ChartProps[] = [];
    tempLabels: label[] = [];
    tempSelectedAnnotations: tempAnnotations[][] = [];
    invalidInput: boolean = false;
    labelShortCutKeyMap: Map<string, string> = new Map();
    uuidList: string[] = [];
    totalUuid: number = 0;
    fileType!: string;
    filePath!: string;
    hasAnnotation: boolean = false;
    conditionTypes: string[] = ['Range', 'Threshold'];
    selectedConditions: string[] = [];
    attributeNames: string[] = [];
    filteredStringTypeAttributeNames: string[] = [];
    conditionList: string[] = [];
    selectedConditionTypes: conditionSet[] = [];
    conditionMapsList: Map<number, any> = new Map();
    displayConditions: Map<number, string> = new Map();
    labellingThresholdConditionsMap: Map<number, any> = new Map();
    labellingRangeConditionsMap: Map<number, any> = new Map();
    identifiers: string[] = ['attribute', 'operator', 'lowerOperator', 'upperOperator', 'annotation'];
    readonly modalPlotGraph = 'modal-plot-graph';
    readonly modalTabularDataView = 'modal-tabular-data-view';
    readonly modalIdProjectStats = 'modal-project-stats';
    readonly modalIdSave = 'modal-save';
    readonly modalAddLabellingConditions = 'modal-add-labelling-conditions';
    colorScheme = {
        domain: ['#659DBD', '#379683', '#8EE4AF', '#E7717D', '#F13C20', '#FF652F', '#376E6F'],
    };
    rowClass: GuiRowClass = {
        class: 'tabular-row',
    };
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
    projectStatsBodyStyle: ModalBodyStyle = {
        minHeight: '50vh',
        minWidth: '50vw',
        maxWidth: '50vw',
        margin: '7vw 36vh',
        overflow: 'none',
    };
    saveModalBodyStyle: ModalBodyStyle = {
        maxHeight: '80vh',
        minWidth: '28vw',
        maxWidth: '28vw',
        margin: '10vh 28vw',
        overflow: 'none',
    };
    addLabellingConditionBodyStyle: ModalBodyStyle = {
        height: '74vh',
        width: '72vw',
        margin: '10vh 0 5vh 3vw',
        overflow: 'none',
    };

    @ViewChild('inputLabel') inputLabel!: ElementRef<HTMLInputElement>;
    @ViewChild('selectedColor') selectedColor!: ElementRef<HTMLInputElement>;
    @ViewChild('labelColor') labelColor!: ElementRef<HTMLInputElement>;
    @ViewChild('floatContainer') container!: ElementRef<HTMLDivElement>;
    @ViewChild('inputSearchData') inputSearchData!: ElementRef<HTMLInputElement>;
    @ViewChild('thresholdValue') thresholdValue!: ElementRef<HTMLInputElement>;
    @ViewChild('lowerLimitValue') lowerLimitValue!: ElementRef<HTMLInputElement>;
    @ViewChild('upperLimitValue') upperLimitValue!: ElementRef<HTMLInputElement>;

    constructor(
        private labellingModeService: LabellingModeService,
        private changeDetectorRef: ChangeDetectorRef,
        private modalService: ModalService,
        private tabularLabellingLayoutService: TabularLabellingLayoutService,
        private fb: FormBuilder,
        private _dataSetService: DataSetLayoutService,
        private _router: Router,
        private languageService: LanguageService,
        private _exportSaveFormatService: ExportSaveFormatService,
    ) {
        const langsArr: string[] = ['image-labelling-en', 'image-labelling-cn', 'image-labelling-ms'];
        this.languageService.initializeLanguage(`image-labelling`, langsArr);
        this.form = this.fb.group({
            checkArray: this.fb.array([]),
        });
    }

    ngOnInit(): void {
        this.projectName = this.tabularLabellingLayoutService.getRouteState(history).projectName;
        this.initProject(this.projectName);
    }

    ngOnChanges(changes: SimpleChanges) {}

    initProject(projectName: string) {
        const projectMetaStatus$ = this._dataSetService.checkProjectStatus(projectName);
        const checkProjectStatus$ = this._dataSetService.checkExistProjectStatus(projectName);
        const updateProjectLoadStatus$ = this._dataSetService.updateProjectLoadStatus(projectName);
        const getTabularDataProperties$ = this.tabularLabellingLayoutService.getSpecificData;

        this.subscription = this.subject
            .pipe(
                mergeMap(() => forkJoin([projectMetaStatus$])),
                first(([{ message, content }]) => {
                    const { is_loaded } = content[0];
                    return message === 1 && !is_loaded ? true : false;
                }),
                mergeMap(([{ message }]) =>
                    !message ? [] : forkJoin([updateProjectLoadStatus$, checkProjectStatus$]),
                ),
                mergeMap(([{ message: updateProjStatus }, { message: loadProjStatus, uuid_list, label_list }]) => {
                    this.getLabels(label_list);
                    this.uuidList = uuid_list;
                    this.totalUuid = this.uuidList.length;
                    return getTabularDataProperties$(projectName, uuid_list[0]);
                }),
            )
            .subscribe(
                (response) => {
                    const labelProperties: label[] = [];
                    this.tabularData = response.tabular_data;

                    if (this.tabularData.LABEL === null) {
                        this.annotationIndexMap.set(this.currentDataIndex, null);
                    } else {
                        const labelList = JSON.parse(this.tabularData.LABEL);
                        labelProperties.push(...labelList);
                        this.annotationIndexMap.set(this.currentDataIndex, labelProperties);
                    }
                },
                (error) => console.error(error),
                () => {
                    this.generateColumnsArray(this.tabularData);
                    this.getAttributesAndValue(this.tabularData);
                    const annotation = this.annotationIndexMap.get(this.currentDataIndex);
                    if (annotation && annotation !== null && annotation.length != 0) {
                        this.annotations.push(...annotation);
                        this.updateTempLabels();
                        this.isAnnotation(this.annotations);
                    } else {
                        this.annotations = [];
                        this.tempLabels = this.labels;
                        this.isAnnotation(this.annotations);
                    }
                    this.getFileInfo(this.tabularData.FILENAME);
                },
            );

        this.subject.next();
    }

    getLabels(labelList: string[]) {
        for (const labelName of labelList) {
            this.labels.push({ labelName, tagColor: '#254E58' });
        }
    }

    getAllTabularData() {
        const tabularData$ = this.tabularLabellingLayoutService.getAllTabularData(this.projectName);
        let data: any[] = [];
        this.subscription = this.subject
            .pipe(() => tabularData$)
            .subscribe(
                (response) => {
                    data = response;
                },
                (err) => console.error(err),
                () => {
                    this.tabularDataObservable = from(data);
                    this.createSourceObservable();
                },
            );
    }

    isNumber = (inputData: any): boolean => {
        return !isNaN(inputData);
    };

    generateColumnsArray(tabularData: any) {
        for (const [key, value] of Object.entries(tabularData)) {
            if (!this.excludeKeys.includes(key)) {
                if (typeof value == 'number') {
                    this.headersTypeMap.set(key, GuiDataType.NUMBER);
                    this.attributeTypeMap.set(key, DataType.NUMBER);
                } else if (typeof value == 'string') {
                    this.headersTypeMap.set(key, GuiDataType.STRING);
                    this.attributeTypeMap.set(key, DataType.STRING);
                }
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
        if (this.tabularData.length == 0) {
            alert('Empty Data');
            return;
        }
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

    getAttributesAndValue(data: any) {
        this.retrievedData = [];
        this.removedSelectedFeatures = [];

        for (const [key, value] of Object.entries(data)) {
            if (!this.excludeKeys.includes(key)) {
                this.retrievedData.push({
                    name: key,
                    value: String(value),
                });
                this.attributeNames.push(key);
            }
        }

        for (const name of this.attributeNames) {
            const type = this.attributeTypeMap.get(name);
            if (type != DataType.STRING) {
                this.filteredStringTypeAttributeNames.push(name);
            }
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
        const uuid = this.uuidList[this.currentDataIndex];
        this.retrieveCurrentData(this.projectName, uuid);
    }

    getNextAttributesAndValue() {
        if (this.currentDataIndex === this.uuidList.length) {
            return;
        }
        this.currentDataIndex++;
        const uuid = this.uuidList[this.currentDataIndex];
        this.retrieveCurrentData(this.projectName, uuid);
    }

    updateLabel(newLabel: label) {
        this.labels.push(newLabel);
        this.tempSelectedAnnotations.push([{ labelName: newLabel.labelName, isSelected: false }]);
        this.tempLabels = this.labels;
        const labelList = this.labels.map((ele) => ele.labelName);
        this._dataSetService.updateLabelList(this.projectName, labelList).subscribe((ele) => {
            /*this is intentional*/
        });
    }

    removeLabel(label: label) {
        this.labels = this.labels.filter((ele) => ele !== label);
        this.tempLabels = this.labels;
        if (this.annotations?.includes(label)) {
            this.annotations = this.annotations.filter((ele) => ele != label);
        }
    }

    getIndex = (index: number): void => {
        this.clickedLabelIndex = index;
    };

    selectColor(color: string) {
        this.labels[this.clickedLabelIndex].tagColor = color;
    }

    chooseLabel(label: label) {
        const isContainAnnotation = this.annotations.includes(label);
        if (isContainAnnotation) return;

        this.annotations.push(label);
        const value = this.annotationIndexMap.get(this.currentDataIndex);

        if (value == null) {
            this.annotationIndexMap.set(this.currentDataIndex, [label]);
        } else if (!value.includes(label)) {
            value.push(label);
        }

        this.tempLabels = this.labels.filter((ele) => !this.annotations.includes(ele));
        this.updateAnnotation();
    }

    removeAnnotation(annotation: label) {
        this.annotations = this.annotations.filter((ele) => ele !== annotation);
        this.annotationIndexMap.set(this.currentDataIndex, this.annotations);
        this.updateTempLabels();
        this.updateAnnotation();
    }

    updateTempLabels() {
        this.tempLabels = [];
        const labelName = this.labels.map((ele) => ele.labelName);
        const annotationName = this.annotations.map((ele) => ele.labelName);

        for (const name of labelName) {
            if (!annotationName.includes(name)) {
                if (!this.tempLabels.some((ele) => ele.labelName == name)) {
                    this.tempLabels.push(...this.labels.filter((ele) => ele.labelName == name));
                }
            }
        }
        this.tempLabels.sort(this.sortBasedOnLabelsOrder);
    }

    retrieveCurrentData(projectName: string, uuid: string) {
        this.tabularLabellingLayoutService.getSpecificData(projectName, uuid).subscribe(
            (response) => {
                this.tabularData = response.tabular_data;
                if (this.tabularData.LABEL !== null) {
                    const annotation = JSON.parse(this.tabularData.LABEL);
                    this.annotations = annotation;
                    this.updateTempLabels();
                    this.isAnnotation(this.annotations);
                } else {
                    this.annotations = [];
                    this.tempLabels = this.labels;
                    this.isAnnotation(this.annotations);
                }
            },
            (error) => {
                console.error(error);
            },
            () => {
                this.getAttributesAndValue(this.tabularData);
            },
        );
    }

    isAnnotation(annotations: label[]) {
        if (annotations.length != 0 && annotations != null) {
            this.hasAnnotation = true;
        } else {
            this.hasAnnotation = false;
        }
    }

    sortBasedOnLabelsOrder = (a: label, b: label) => {
        return this.labels.indexOf(a) - this.labels.indexOf(b);
    };

    updateAnnotation() {
        const annotation = this.annotationIndexMap.get(this.currentDataIndex);
        const labelList = annotation || null;
        const uuid = this.tabularData.UUID;
        this.tabularLabellingLayoutService
            .updateTabularDataLabel(this.projectName, uuid, labelList)
            .subscribe((response) => {
                if (response.error_code == 0) {
                    console.error(response.error_message);
                }
            });
    }

    toggleLabelSection() {
        this.isToggleLabelSection = !this.isToggleLabelSection;
    }

    toggleConditionSection() {
        this.isToggleConditionSection = !this.isToggleConditionSection;
    }

    checkFeatureCheckedStatus(featureCheckStatusMap: Map<string, boolean>) {
        for (const [featureName, checked] of featureCheckStatusMap.entries()) {
            const index = this.features.findIndex((ele) => ele.featureName == featureName);
            this.features[index].checked = checked;
            this.appendFeaturesBasedOnCheckedStatus(featureName, checked);
        }
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

    plotGraph() {
        const map = this.calculateAnnotationNumber();

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
            const value = this.annotationIndexMap.get(i) as label[];
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
                case altKey && 'p':
                    this.createSourceObservable();
            }

            if (key && this.labelShortCutKeyMap.size > 0) {
                const selectedLabel = this.findKeyByValue(this.labelShortCutKeyMap, key.toString());
                if (selectedLabel == null) return;
                const label = this.labels.filter((ele) => ele.labelName == selectedLabel)[0];
                this.chooseLabel(label);
            }
        } catch (err) {
            console.log(err);
        }
    }

    findKeyByValue = (map: Map<string, string>, value: string): string | null => {
        for (const key of map.keys()) {
            if (map.get(key) === value) {
                return key;
            }
        }
        return null;
    };

    toggleContainer(event: MouseEvent) {
        event.preventDefault();
        const x = event.pageX + 'px';
        const y = event.pageY + 'px';
        if (this.labels.length == 0) {
            return;
        }
        this.container.nativeElement.style.display = 'block'; // display: 'none' <div id="drop down' class="a"> </div>
        this.container.nativeElement.style.left = x;
        this.container.nativeElement.style.top = y;
        this.isOptionContainerToggle = true;
    }

    closeContainer(event: MouseEvent) {
        const within = event.composedPath().includes(this.container.nativeElement);
        if (within) {
            this.container.nativeElement.style.display = 'none';
        }
        event.preventDefault();
    }

    checkUsedAnnotations() {
        if (this.annotations?.length == this.labels.length) {
            this.container.nativeElement.style.display = 'none';
        }
    }

    searchData() {
        this.inputSearchData.nativeElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.inputSearchData.nativeElement.value = '';
            }
        });
        const targetIndex = Number(this.inputSearchData.nativeElement.value);
        if (this.inputSearchData.nativeElement.value === '' || targetIndex > this.tabularData.length) {
            return;
        }
        this.currentDataIndex = targetIndex - 1;
    }

    navigateToTargetData(index: number) {
        const adjustIndex = index - 1;
        if (adjustIndex < 0) return;
        this.currentDataIndex = adjustIndex;
        this.retrieveCurrentData(this.projectName, this.uuidList[adjustIndex]);
        this.getAttributesAndValue(this.tabularData);
    }

    searchLabel(event: any) {
        const label = event.target.value;
        this.tempLabels = this.labels.filter((ele) =>
            ele.labelName.toLocaleLowerCase().startsWith(label.toLowerCase()),
        );
    }

    setShortCutKeyForLabel(labelKeyMap: Map<string, string>) {
        this.labelShortCutKeyMap = labelKeyMap;
    }

    setCheckedStatusForFeatures(featureCheckedStatusMap: Map<string, boolean>) {
        this.checkFeatureCheckedStatus(featureCheckedStatusMap);
    }

    toggleStatistics() {
        this.modalService.open(this.modalIdProjectStats);
    }

    toggleSave() {
        this.modalService.open(this.modalIdSave);
    }

    getFileInfo(fileName: string) {
        this.filePath = fileName;
        const type = fileName.split('.').pop();
        if (type) {
            this.fileType = type;
        } else {
            this.fileType = '';
        }
    }

    onClickDownload = async (saveFormat: any) => {
        // const labelList = this.labelChoosen.filter((e) => e.isChoosen === true).map((e) => e.label);
        // const fullLabelList = this.labelChoosen.map((e) => e.label);
        // this.saveType.saveBulk && this.processingNum++;
        // const response: ProcessResponse = await this._exportSaveFormatService.exportSaveFormat({
        //     ...this.saveType,
        //     saveFormat,
        //     metadata: this.selectedMetaData,
        //     index: this.currentAnnotationIndex,
        //     projectName: this.selectedProjectName,
        //     fullLabelList,
        //     ...((this.saveType.saveBulk || saveFormat === 'ocr' || saveFormat === 'json' || saveFormat === 'coco') && {
        //         projectFullMetadata: this.thumbnailList,
        //     }),
        //     ...(saveFormat !== 'json' && {
        //         labelList,
        //     }),
        // });
        /**
         * Response Message:
         * 0 - isEmpty/Warning
         * 1 - Success/Done
         */
        // if (response.message === 0) {
        //     this.warningMessage = response.msg;
        //     this._modalService.open(this.modalExportWarning);
        // }
        // this.saveType.saveBulk && this.processingNum--;
    };

    createCondition(event: any) {
        console.log(event.target.value);
    }

    openAddConditionModal() {
        this.modalService.open(this.modalAddLabellingConditions);
    }

    toggleTypeSelection() {
        this.isToggleConditionType = !this.isToggleConditionType;
    }

    getConditionType(type: string) {
        this.selectedConditionTypes.push({
            type,
            isSet: false,
            buttonLabel: 'edit',
            isToggleAttributes: false,
            isToggleOperator: false,
            isToggleLowerOperator: false,
            isToggleUpperOperator: false,
            isToggleAnnotation: false,
        });
        this.toggleTypeSelection();

        const tempAnnotation: tempAnnotations[] = [];
        for (const label of this.labels) {
            tempAnnotation.push({
                labelName: label.labelName,
                isSelected: false,
            });
        }
        this.tempSelectedAnnotations.push(tempAnnotation);
    }

    editSelectedLabellingCondition(index: number, status: boolean, type: string) {
        if (status == true) {
            if (this.alertUnCompleteConditions(index, type) == true) return;
            if (this.alertLimitOutBound(index, type) == true) return;

            this.selectedConditionTypes[index].isSet = false;
            this.selectedConditionTypes[index].buttonLabel = 'edit';
            this.checkAndCorrectValueType(index, type);
        } else {
            this.selectedConditionTypes.forEach((ele, i) => {
                if (i == index) {
                    ele.isSet = true;
                    ele.buttonLabel = 'set';
                } else {
                    ele.isSet = false;
                    ele.buttonLabel = 'edit';
                }
            });
        }
        for (const identifier of this.identifiers) {
            this.setToggleState(index, true, identifier);
        }
        this.resetConditionListDisplay(index, type);
    }

    checkAndCorrectValueType(index: number, type: string) {
        if (type == 'Threshold') {
            const thresholdCondition = this.labellingThresholdConditionsMap.get(index);
            const attributeName = thresholdCondition.attribute;
            const attributeType = this.attributeTypeMap.get(attributeName.toUpperCase());
            if (attributeType == 'number') {
                const value = thresholdCondition.value;
                this.labellingThresholdConditionsMap.get(index).value = Number(value);
            }
        } else if (type == 'Range') {
            const rangeCondition = this.labellingRangeConditionsMap.get(index);
            const attributeName = rangeCondition.attribute;
            const attributeType = this.attributeTypeMap.get(attributeName.toUpperCase());
            if (attributeType == 'number') {
                const lowerLimit = rangeCondition.lowerLimit;
                const upperLimit = rangeCondition.upperLimit;
                this.labellingRangeConditionsMap.get(index).lowerLimit = Number(lowerLimit);
                this.labellingRangeConditionsMap.get(index).upperLimit = Number(upperLimit);
            }
        }
    }

    alertUnCompleteConditions = (index: number, type: string): boolean => {
        let conditions;
        if (type == 'Threshold') {
            conditions = this.labellingThresholdConditionsMap.get(index);
        } else if (type == 'Range') {
            conditions = this.labellingRangeConditionsMap.get(index);
        }

        if (conditions == undefined) {
            alert('Current condition is undefined. Please set the parameter of condition');
            return true;
        } else {
            if (type == 'Threshold' && Object.keys(conditions).length < 4) {
                alert('Please finish setting the threshold conditions');
                return true;
            } else if (type == 'Range' && Object.keys(conditions).length < 6) {
                alert('Please finish setting the range conditions');
                return true;
            }
        }
        return false;
    };

    alertLimitOutBound = (index: number, type: string): boolean => {
        if (type == 'Range') {
            const result = this.labellingRangeConditionsMap.get(index) as range;
            const upperLimit = result.upperLimit;
            const lowerLimit = result.lowerLimit;
            if (lowerLimit && upperLimit && lowerLimit >= upperLimit) {
                alert('Value set at lower limit is higher than or equal to upper limit, please correct');
                return true;
            }
        }

        return false;
    };

    alertWrongDataType = (index: number, type: string, value: any) => {
        if (type == 'Threshold') {
            const thresholdCondition = this.labellingThresholdConditionsMap.get(index);
            const attributeName = thresholdCondition.attribute;
            const attributeType = this.attributeTypeMap.get(attributeName.toUpperCase());

            if (attributeType == DataType.NUMBER && !this.isNumber(value)) {
                alert('Input value is not a number. Please correct it');
                return;
            }

            if (attributeType == DataType.STRING && this.isNumber(value)) {
                alert('Input value is not a string. Please correct it');
                return;
            }
        } else if (type == 'Range') {
            if (!this.isNumber(value)) {
                alert('Input value is not a number. Please correct it');
                return;
            }
        }
    };

    onClickInputField(index: number) {
        const identifiers = ['attribute', 'operator', 'lowerOperator', 'upperOperator', 'label'];
        for (const identifier of identifiers) {
            this.setToggleState(index, true, identifier);
        }
    }

    deleteCondition(index: number) {
        this.selectedConditionTypes.splice(index, 1);
        this.tempSelectedAnnotations.splice(index, 1);

        if (this.labellingRangeConditionsMap.has(index)) {
            this.adjustIndexOfMap(index, this.labellingRangeConditionsMap);
        }

        if (this.labellingThresholdConditionsMap.has(index)) {
            this.adjustIndexOfMap(index, this.labellingThresholdConditionsMap);
        }

        if (this.conditionMapsList.has(index)) {
            this.adjustIndexOfMap(index, this.conditionMapsList);
        }

        if (this.displayConditions.has(index)) {
            this.adjustIndexOfMap(index, this.displayConditions);
            this.conditionList.splice(0, this.conditionList.length);
            this.listOutConditions();
        }
    }

    adjustIndexOfMap(index: number, map: Map<number, any>) {
        map.delete(index);
        for (const [key, value] of map.entries()) {
            if (key > index) {
                map.set(key - 1, value);
                map.delete(key);
            }
        }
    }

    resetConditionListDisplay(index: number, type: string) {
        if (type == 'Threshold') {
            const condition = this.labellingThresholdConditionsMap.get(index);
            if (condition) {
                const display =
                    condition.attribute.toLowerCase() +
                    ' ' +
                    this.operatorSymbol(condition.operator, 'Threshold') +
                    ' ' +
                    condition.value +
                    ' ' +
                    '\u003a' +
                    ' ' +
                    this.expandAnnotation(condition.label);
                this.displayConditions.set(index, display);
            }
        }

        if (type == 'Range') {
            const condition = this.labellingRangeConditionsMap.get(index);
            if (condition) {
                const display =
                    condition.lowerLimit +
                    ' ' +
                    this.operatorSymbol(condition.lowerOperator, 'Range') +
                    ' ' +
                    condition.attribute.toLowerCase() +
                    ' ' +
                    this.operatorSymbol(condition.upperOperator, 'Range') +
                    ' ' +
                    condition.upperLimit +
                    ' ' +
                    '\u003a' +
                    ' ' +
                    this.expandAnnotation(condition.label);
                this.displayConditions.set(index, display);
            }
        }

        this.conditionList.splice(0, this.conditionList.length);
        this.listOutConditions();
    }

    setToggleState(index: number, status: boolean, identifier: string) {
        if (status == false) {
            switch (identifier) {
                case 'attribute':
                    this.selectedConditionTypes[index].isToggleAttributes = true;
                    this.selectedConditionTypes[index].isToggleOperator = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    this.selectedConditionTypes[index].isToggleUpperOperator = false;
                    this.selectedConditionTypes[index].isToggleLowerOperator = false;
                    break;
                case 'operator':
                    this.selectedConditionTypes[index].isToggleOperator = true;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    break;
                case 'lowerOperator':
                    this.selectedConditionTypes[index].isToggleLowerOperator = true;
                    this.selectedConditionTypes[index].isToggleUpperOperator = false;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    break;
                case 'upperOperator':
                    this.selectedConditionTypes[index].isToggleUpperOperator = true;
                    this.selectedConditionTypes[index].isToggleLowerOperator = false;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    break;
                case 'annotation':
                    this.selectedConditionTypes[index].isToggleAnnotation = true;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleOperator = false;
                    this.selectedConditionTypes[index].isToggleUpperOperator = false;
                    this.selectedConditionTypes[index].isToggleLowerOperator = false;
                    break;
            }
        } else {
            switch (identifier) {
                case 'attribute':
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    break;
                case 'operator':
                    this.selectedConditionTypes[index].isToggleOperator = false;
                    break;
                case 'lowerOperator':
                    this.selectedConditionTypes[index].isToggleLowerOperator = false;
                    break;
                case 'upperOperator':
                    this.selectedConditionTypes[index].isToggleUpperOperator = false;
                    break;
                case 'annotation':
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    break;
            }
        }
    }

    getConditionSettings(index: number, parameter: string, conditionType: string, identifier: string) {
        if (conditionType === 'Threshold') {
            this.setThresholdConditions(identifier, parameter, index);
        } else if (conditionType === 'Range') {
            this.setRangeConditions(identifier, parameter, index);
        }
    }

    setThresholdConditions(identifier: string, parameter: string, index: number) {
        let data: threshold = {};
        switch (identifier) {
            case 'attribute':
                data = {
                    attribute: parameter,
                };
                break;
            case 'operator':
                data = {
                    operator: parameter,
                };
                break;
            case 'value':
                data = {
                    value: parameter,
                };
                break;
            case 'annotation':
                data = {
                    label: {
                        labelName: parameter,
                        tagColor: '#254E58',
                    },
                };

                this.tempSelectedAnnotations[index].forEach((ele) => {
                    if (ele.labelName == parameter) {
                        ele.isSelected = !ele.isSelected;
                    }
                });
                break;
        }
        this.setThresholdConditionSettingsMap(data, index);
    }

    setRangeConditions(identifier: string, parameter: string, index: number) {
        let data: range = {};
        switch (identifier) {
            case 'attribute':
                data = {
                    attribute: parameter,
                };
                break;
            case 'lowerOperator':
                data = {
                    lowerOperator: parameter,
                };
                break;
            case 'upperOperator':
                data = {
                    upperOperator: parameter,
                };
                break;
            case 'lowerLimit':
                data = {
                    lowerLimit: parameter,
                };
                break;
            case 'upperLimit':
                data = {
                    upperLimit: parameter,
                };
                break;
            case 'annotation':
                data = {
                    label: {
                        labelName: parameter,
                        tagColor: '#254E58',
                    },
                };

                this.tempSelectedAnnotations[index].forEach((ele) => {
                    if (ele.labelName == parameter) {
                        ele.isSelected = !ele.isSelected;
                    }
                });
                break;
        }
        this.setRangeConditionSettingsMap(data, index);
    }

    setThresholdConditionSettingsMap(array: threshold, index: number) {
        const containKey = this.labellingThresholdConditionsMap.has(index);
        const newKey = Object.keys(array)[0];

        if (containKey == false) {
            const newKey = Object.keys(array)[0];
            if (newKey == 'label') {
                const annotation = {
                    label: [array.label],
                };
                this.labellingThresholdConditionsMap.set(index, annotation);
            } else {
                this.labellingThresholdConditionsMap.set(index, array);
            }
        } else {
            let result = this.labellingThresholdConditionsMap.get(index);
            const availableKey = Object.keys(result);
            const newKey = Object.keys(array)[0];

            if (result) {
                if (availableKey.includes(newKey) == false) {
                    if (newKey === 'label') {
                        const annotation = {
                            label: [array.label],
                        };
                        result = { ...result, ...annotation };
                        this.labellingThresholdConditionsMap.set(index, result);
                    } else {
                        result = { ...result, ...array };
                        this.labellingThresholdConditionsMap.set(index, result);
                    }
                } else {
                    switch (newKey) {
                        case 'attribute':
                            result.attribute = array.attribute;
                            break;
                        case 'operator':
                            result.operator = array.operator;
                            break;
                        case 'value':
                            result.value = array.value;
                            break;
                        case 'label':
                            const annotations = result.label;
                            const isContain = annotations.some(
                                (ele: { labelName: string | undefined }) => ele.labelName == array.label?.labelName,
                            );

                            if (isContain == false) {
                                annotations.push(array.label);
                                result.label = annotations;
                            } else {
                                const index = annotations.findIndex(
                                    (ele: { labelName: string | undefined }) => ele.labelName == array.label?.labelName,
                                );
                                annotations.splice(index, 1);
                            }
                            break;
                    }
                }
            }
        }
    }

    setRangeConditionSettingsMap(array: range, index: number) {
        const containKey = this.labellingRangeConditionsMap.has(index);

        if (!containKey) {
            const newKey = Object.keys(array)[0];
            if (newKey == 'label') {
                const annotation = {
                    label: [array.label],
                };
                this.labellingRangeConditionsMap.set(index, annotation);
            } else {
                this.labellingRangeConditionsMap.set(index, array);
            }
        } else {
            let result = this.labellingRangeConditionsMap.get(index);
            const availableKey = Object.keys(result);
            const newKey = Object.keys(array)[0];

            if (result) {
                if (!availableKey.includes(newKey)) {
                    if (newKey === 'label') {
                        const annotation = {
                            label: [array.label],
                        };
                        result = { ...result, ...annotation };
                        this.labellingRangeConditionsMap.set(index, result);
                    } else {
                        result = { ...result, ...array };
                        this.labellingRangeConditionsMap.set(index, result);
                    }
                } else {
                    switch (newKey) {
                        case 'attribute':
                            result.attribute = array.attribute;
                            break;
                        case 'lowerOperator':
                            result.lowerOperator = array.lowerOperator;
                            break;
                        case 'upperOperator':
                            result.upperOperator = array.upperOperator;
                            break;
                        case 'lowerLimit':
                            result.lowerLimit = array.lowerLimit;
                            break;
                        case 'upperLimit':
                            result.upperLimit = array.upperLimit;
                            break;
                        case 'label':
                            const annotations = result.label;
                            const isContain = annotations.some(
                                (ele: { labelName: string | undefined }) => ele.labelName == array.label?.labelName,
                            );

                            if (isContain == false) {
                                annotations.push(array.label);
                                result.label = annotations;
                            } else if (isContain == true) {
                                const index = annotations.findIndex(
                                    (ele: { labelName: string | undefined }) => ele.labelName == array.label?.labelName,
                                );
                                annotations.splice(index, 1);
                            }
                            break;
                    }
                }
            }
        }
    }

    displaySelection = (index: number, identifier: string, condition: string): string => {
        let selection = '';
        if (condition == 'Threshold') {
            const result = this.labellingThresholdConditionsMap.get(index);
            if (result == undefined) {
                selection = this.displayDefaultText(identifier);
            } else {
                selection = this.displayThresholdSelection(index, identifier);
            }
        } else {
            const result = this.labellingRangeConditionsMap.get(index);
            if (result == undefined) {
                selection = this.displayDefaultText(identifier);
            } else {
                selection = this.displayRangeSelection(index, identifier);
            }
        }
        return selection;
    };

    displayDefaultText = (identifier: string): string => {
        let display = '';
        switch (identifier) {
            case 'attribute':
                display = 'Attribute';
                break;
            case 'operator':
                display = 'Operator';
                break;
            case 'lowerOperator':
                display = 'Lower Operator';
                break;
            case 'upperOperator':
                display = 'Upper Operator';
                break;
            case 'label':
                display = 'Annotation';
                break;
        }
        return display;
    };

    displayThresholdSelection = (index: number, identifier: string): string => {
        const selection = this.labellingThresholdConditionsMap.get(index) as threshold;
        let display = '';

        switch (identifier) {
            case 'attribute':
                const attribute = selection.attribute;
                display = attribute ? attribute.toLowerCase() : 'Attribute';
                break;
            case 'operator':
                const operator = selection.operator;
                display = operator ? this.operatorSymbol(operator, 'Threshold') : 'Operator';
                break;
            case 'label':
                const annotation = selection.label;
                display = annotation ? annotation.labelName : 'Annotation';
                break;
            case 'value':
                const value = selection.value;
                display = value ? String(value) : '';
                break;
        }
        return display;
    };

    displayRangeSelection = (index: number, identifier: string): string => {
        const selection = this.labellingRangeConditionsMap.get(index) as range;
        let display = '';

        switch (identifier) {
            case 'attribute':
                const attribute = selection.attribute;
                display = attribute ? attribute.toLowerCase() : 'attribute';
                break;
            case 'lowerOperator':
                const lowerOperator = selection.lowerOperator;
                display = lowerOperator ? this.operatorSymbol(lowerOperator, 'Range') : 'lowerOperator';
                break;
            case 'upperOperator':
                const upperOperator = selection.upperOperator;
                display = upperOperator ? this.operatorSymbol(upperOperator, 'Range') : 'upperOperator';
                break;
            case 'label':
                const annotation = selection.label;
                display = annotation ? annotation.labelName : 'annotation';
                break;
            case 'lowerLimit':
                const lowerLimit = selection.lowerLimit;
                display = lowerLimit ? String(lowerLimit) : '';
                break;
            case 'upperLimit':
                const upperLimit = selection.upperLimit;
                display = upperLimit ? String(upperLimit) : '';
                break;
        }
        return display;
    };

    displayThresholdCondition = (index: number): string => {
        const isKey = this.labellingThresholdConditionsMap.has(index);
        if (isKey == false) return 'empty';
        let display = '';

        const conditions = this.labellingThresholdConditionsMap.get(index) as threshold;
        const attribute = conditions.attribute == undefined ? 'attribute' : conditions.attribute.toLowerCase();
        const value = conditions.value == undefined ? 'value' : String(conditions.value);
        const operator =
            conditions.operator == undefined ? 'operator' : this.operatorSymbol(conditions.operator, 'Threshold');
        const annotations = conditions.label == undefined ? 'annotations' : this.expandAnnotation(conditions.label);
        const displayString = attribute + ' ' + operator + ' ' + value + ' ' + '\u003a' + ' ' + annotations;

        display = displayString;
        this.createConditionsDisplay(index, displayString);
        return display;
    };

    displayRangeCondition = (index: number): string => {
        const isKey = this.labellingRangeConditionsMap.has(index);
        if (isKey == false) return 'empty';
        let display = '';

        const conditions = this.labellingRangeConditionsMap.get(index) as range;
        const attribute = conditions.attribute == undefined ? 'attribute' : conditions.attribute.toLowerCase();
        const lowerLimit = conditions.lowerLimit == undefined ? 'lowerLimit' : String(conditions.lowerLimit);
        const upperLimit = conditions.upperLimit == undefined ? 'upperLimit' : String(conditions.upperLimit);
        const lowerOperator =
            conditions.lowerOperator == undefined
                ? 'lowerOperator'
                : this.operatorSymbol(conditions.lowerOperator, 'Range');
        const upperOperator =
            conditions.upperOperator == undefined
                ? 'upperOperator'
                : this.operatorSymbol(conditions.upperOperator, 'Range');
        const annotations = conditions.label == undefined ? 'annotations' : this.expandAnnotation(conditions.label);
        const displayString =
            lowerLimit +
            ' ' +
            lowerOperator +
            ' ' +
            attribute +
            ' ' +
            upperOperator +
            ' ' +
            upperLimit +
            ' ' +
            '\u003a' +
            ' ' +
            annotations;

        display = displayString;
        this.createConditionsDisplay(index, displayString);
        return display;
    };

    createConditionsDisplay(index: number, selectedCondition: string) {
        if (this.displayConditions.has(index) == false) {
            this.displayConditions.set(index, selectedCondition);
        } else {
            let condition = this.displayConditions.get(index);
            if (condition != selectedCondition) {
                condition = selectedCondition;
            }
        }
        this.listOutConditions();
    }

    expandAnnotation = (annotations: any): string => {
        let annotationString = '';
        for (let i = 0; i < annotations.length; i++) {
            if (i != annotations.length - 1) {
                annotationString += annotations[i].labelName + ', ';
            } else {
                annotationString += annotations[i].labelName;
            }
        }
        return annotationString;
    };

    operatorSymbol = (operator: string, type: string): string => {
        let symbol = '';
        switch (operator) {
            case 'less than or equal to':
                operator = '\u2264';
                break;
            case 'less than':
                operator = '\u003c';
                break;
            case 'equal to':
                operator = '\u003d';
                break;
            case 'more than':
                operator = type == 'Range' ? '\u003c' : '\u003e';
                break;
            case 'more than or equal to':
                operator = type == 'Range' ? '\u2264' : '\u2265';
                break;
            case 'not equal to':
                operator = '\u2260';
                break;
        }
        return operator;
    };

    listOutConditions() {
        for (const [key, value] of this.displayConditions.entries()) {
            if (this.conditionList.includes(value) == false) {
                this.conditionList.push(value);
            }
        }
    }

    preparePreLabellingConditions(status: boolean) {
        if (status == false) {
            for (const [key, condition] of this.labellingThresholdConditionsMap.entries()) {
                if (this.conditionMapsList.has(key) == false) {
                    this.conditionMapsList.set(key, { threshold: condition });
                } else {
                    let selectedCondition = this.conditionMapsList.get(key)['threshold'];
                    selectedCondition = condition;
                }
            }

            for (const [key, condition] of this.labellingRangeConditionsMap) {
                if (this.conditionMapsList.has(key) == false) {
                    this.conditionMapsList.set(key, { range: condition });
                } else {
                    let selectedCondition = this.conditionMapsList.get(key)['range'];
                    selectedCondition = condition;
                }
            }
        }
    }

    automateLabelling() {
        this.tabularLabellingLayoutService
            .setPreLabellingConditions(this.projectName, this.conditionMapsList)
            .subscribe(() => {});
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
