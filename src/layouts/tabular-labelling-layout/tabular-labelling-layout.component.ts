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
import { Data, Features, label, RemovedFeature } from '../../shared/types/labelling-type/tabular-labelling.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Observable, Subject, Subscription } from 'rxjs';
import { first, mergeMap, takeUntil } from 'rxjs/operators';
import { ChartProps } from '../../shared/types/dataset-layout/data-set-layout.model';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout-api.service';
import { ExportSaveFormatService } from '../../shared/services/export-save-format.service';
import { LanguageService } from '../../shared/services/language.service';
import { ModalBodyStyle } from '../../shared/types/modal/modal.model';
import { ModalService } from '../../shared/components/modal/modal.service';
import { Router } from '@angular/router';
import { TabularLabellingLayoutService } from './tabular-labelling-layout.service';
import { labels_stats } from '../../shared/types/message/message.model';
import { LabelModeService } from '../../shared/services/label-mode-service';
import { ColDef } from 'ag-grid-community';
import * as fileSaver from 'file-saver';

type conditionSet = {
    type: string;
    isClickSet: boolean;
    buttonLabel: string;
    isToggleAttributes: boolean;
    isToggleOperator: boolean;
    isToggleLowerOperator: boolean;
    isToggleUpperOperator: boolean;
    isToggleAnnotation: boolean;
    isToggleDate: boolean;
};

type threshold = {
    attribute?: string;
    operator?: string;
    value?: number | string;
    label?: label;
    dateFormat?: string;
};

type range = {
    attribute?: string;
    lowerOperator?: string;
    upperOperator?: string;
    lowerLimit?: number | string;
    upperLimit?: number | string;
    label?: label;
    dateFormat?: string;
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

type dateFormat = {
    format: string;
    example: string;
};

@Component({
    selector: 'app-tabular-labelling-layout',
    templateUrl: './tabular-labelling-layout.component.html',
    styleUrls: ['./tabular-labelling-layout.component.scss'],
})
export class TabularLabellingLayoutComponent implements OnInit, OnDestroy, OnChanges {
    private subject: Subject<any> = new Subject<any>();
    private subscription!: Subscription;
    projectName: string = '';
    projectFolderPath: string = '';
    tabularData!: any;
    tabularDataObservable: Observable<any[]> = new Observable<any[]>();
    headersTypeMap: Map<string, DataType> = new Map<string, DataType>();
    attributeTypeMap: Map<string, DataType> = new Map<string, DataType>();
    private sizeOptions: Array<string> = ['5 000', '25 000', '50 000', '100 000', '200 000', '1 000000'];
    private selectedSize: string = this.sizeOptions[0];
    tableWidth: number = 0;
    filteredColumns: string[] = ['uuid', 'project_id', 'project_name', 'file_path', 'label'];
    source: Array<any[]> = [];
    loading: boolean = true;
    labels: label[] = [];
    annotations: label[] = [];
    annotationIndexMap: Map<number, label[] | null> = new Map();
    retrievedData: Data[] = [];
    features: Features[] = [];
    currentDataIndex: number = 0;
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
    tempLabellingConditionsMap: Map<number, any> = new Map();
    tempThresholdArray: threshold[] = [];
    emptyLabel: boolean = true;
    emptyAnnotation: boolean = true;
    labeledData: number = 0;
    unLabeledData: number = 0;
    identifiers: string[] = ['attribute', 'operator', 'lowerOperator', 'upperOperator', 'annotation', 'dateFormat'];
    dateFormat: dateFormat[] = [
        { format: 'yyyy/MM/dd', example: '2022/01/05' },
        { format: 'MM/dd/yyyy', example: '05/01/2022' },
        { format: 'dd/MM/yyyy', example: '01/05/2022' },
    ];
    previousConditionIndex: number = 0;
    previousConditionType: string = '';
    isDuplication: boolean = false;
    isInvalid = false;
    filterInvalidData = false;
    listOfOverlappingConditions: Map<string, Map<number, any>>[] = [];
    listOfInvalidDataUUID: string[] = [];
    currentInvalidDataIndex: number = 0;
    isSkipInvalidData: boolean = false;
    isShowInvalidDataOnly: boolean = false;
    checkIsInvalid = false;
    tempInvalidArray: label[] = [];
    labellingSequenceChoice: string = 'append';
    columnsDefs: ColDef[] = [];
    rowData!: Observable<any>;
    dayMonthYearRegex = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$/g;
    yearMonthDayRegex = /^\d{4}[./-](0?[1-9]|1[012])[./-](0?[1-9]|[12][0-9]|3[01])$/g;
    readonly modalPlotGraph = 'modal-plot-graph';
    readonly modalTabularDataView = 'modal-tabular-data-view';
    readonly modalIdProjectStats = 'modal-project-stats';
    readonly modalIdSave = 'modal-save';
    readonly modalAddLabellingConditions = 'modal-add-labelling-conditions';
    readonly modalAlertWindow = 'modal-alert-window';
    readonly modalShortcutKeyInfo = 'modal-shortcut-key-info';
    colorScheme = {
        domain: ['#659DBD', '#379683', '#8EE4AF', '#E7717D', '#F13C20', '#FF652F', '#376E6F'],
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
        width: '75vw',
        margin: '10vh 0 5vh 3vw',
        overflow: 'none',
    };
    alertWindowBodyStyle: ModalBodyStyle = {
        minHeight: '34vh',
        maxHeight: '34vh',
        minWidth: '40vw',
        maxWidth: '40vw',
        margin: '15vw 68vh',
        overflow: 'none',
    };
    infoModalBodyStyle: ModalBodyStyle = {
        maxHeight: '50vh',
        minWidth: '40vw',
        maxWidth: '40vw',
        margin: '20vh 23vw',
        padding: '0vh 0vw 3vh 0vw',
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
    @ViewChild('scrollTable') scrollTable!: ElementRef<HTMLDivElement>;
    @ViewChild('invalid') invalidCheckBox!: ElementRef<HTMLInputElement>;
    @ViewChild('skipInvalid') skipInvalidCheckBox!: ElementRef<HTMLInputElement>;
    @ViewChild('showInvalidOnly') showInvalidOnlyCheckBox!: ElementRef<HTMLInputElement>;
    @ViewChild('overwrite') overWriteCheckBox!: ElementRef<HTMLInputElement>;
    @ViewChild('append') appendCheckBox!: ElementRef<HTMLInputElement>;

    constructor(
        private labellingModeService: LabelModeService,
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
        this.getAllTabularData();
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
                    const is_loaded = content.is_loaded;
                    this.projectFolderPath = content.project_path;
                    return message === 1 && !is_loaded;
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

                    if (this.tabularData.label === null) {
                        this.annotationIndexMap.set(this.currentDataIndex, null);
                    } else {
                        const labelList = JSON.parse(this.tabularData.label);
                        labelProperties.push(...labelList);
                        this.annotationIndexMap.set(this.currentDataIndex, labelProperties);
                    }
                },
                (error) => console.error(error),
                () => {
                    this.generateColumnsArray(this.tabularData);
                    this.getAttributesAndValue(this.tabularData);
                    const annotation = this.annotationIndexMap.get(this.currentDataIndex);
                    if (annotation && annotation.length !== 0) {
                        this.annotations.push(...annotation);
                        this.updateTempLabels();
                        this.isAnnotation(this.annotations);
                    } else {
                        this.annotations = [];
                        this.tempLabels = this.labels;
                        this.isAnnotation(this.annotations);
                    }
                    this.getFileInfo(this.tabularData.file_path);
                    this.updateInvalidCheckBox();
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
        let allData: any[] = [];
        this.tabularLabellingLayoutService.getAllTabularData(this.projectName).subscribe(
            (response) => {
                allData = response;
            },
            (err) => console.error(err),
            () => {
                const filteredKeys = Object.keys(allData[0]).filter((ele) => !this.filteredColumns.includes(ele));
                const data = allData.filter((ele) => {
                    const keys = Object.keys(ele);
                    for (const key of keys) {
                        if (!filteredKeys.includes(key)) {
                            delete ele[key];
                        }
                    }
                    return ele;
                });
                this.tabularDataObservable = new Observable<any[]>((observer) => {
                    setTimeout(() => {
                        observer.next(data);
                    }, 500);
                });
            },
        );
    }

    isNumber = (inputData: any): boolean => {
        return !isNaN(inputData);
    };

    isValidDate = (value: any): boolean => {
        const dayMonthYearRegex = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$/g;
        const yearMonthDayRegex = /^\d{4}[./-](0?[1-9]|1[012])[./-](0?[1-9]|[12][0-9]|3[01])$/g;
        if (dayMonthYearRegex.test(value)) {
            return true;
        }
        return yearMonthDayRegex.test(value);
    };

    isTallyWithSelectedDateFormat = (value: any, selectedDateFormat: string): boolean => {
        const dayMonthYearRegex = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$/g;
        const monthDayYearRegex =
            /^([0]?[1-9]|[1|2][0-9])[./-]([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0-9]{4}|[0-9]{2})$/g;
        const yearMonthDayRegex = /^\d{4}[./-](0?[1-9]|1[012])[./-](0?[1-9]|[12][0-9]|3[01])$/g;
        let isTally: boolean = false;

        switch (selectedDateFormat) {
            case 'yyyy/MM/dd': {
                isTally = yearMonthDayRegex.test(value);
                break;
            }
            case 'MM/dd/yyyy': {
                isTally = monthDayYearRegex.test(value);
                break;
            }
            case 'dd/MM/yyyy': {
                isTally = dayMonthYearRegex.test(value);
                break;
            }
        }
        return isTally;
    };

    checkTypeOfValue = (value: any) => {
        if (this.isValidDate(value)) {
            return 'date';
        }

        if (typeof value === 'number') {
            return 'number';
        }

        if (typeof value === 'string') {
            return 'string';
        } else {
            console.error('Unidentifiable type of value');
        }
    };

    generateColumnsArray(tabularData: any) {
        for (const [key, value] of Object.entries(tabularData)) {
            if (!this.filteredColumns.includes(key)) {
                const type = this.checkTypeOfValue(value);
                switch (type) {
                    case 'number':
                        this.headersTypeMap.set(key, DataType.NUMBER);
                        this.attributeTypeMap.set(key, DataType.NUMBER);
                        break;
                    case 'string':
                        this.headersTypeMap.set(key, DataType.STRING);
                        this.attributeTypeMap.set(key, DataType.STRING);
                        break;
                    case 'date':
                        this.headersTypeMap.set(key, DataType.STRING);
                        this.attributeTypeMap.set(key, DataType.DATE);
                        break;
                }
            }
        }

        for (const [key, value] of this.headersTypeMap) {
            this.features.push({ featureName: key, checked: true });
            if (!this.filteredColumns.includes(key)) {
                this.columnsDefs.push({
                    headerName: key,
                    field: key,
                });
            }
        }
    }

    // sizeSelected(selectedSize: string): void {
    //     this.generateSource(selectedSize);
    // }

    // createSourceObservable() {
    // if (this.tabularData.length == 0) {
    //     alert('Empty Data');
    //     return;
    // }
    //     this.generateSource(this.selectedSize);
    // }

    generateSource(): void {
        // const size = Number(selectedSize.split(' ').join(''));

        // this.tabularDataObservable.pipe(takeUntil(this.unsubscribe$)).subscribe(
        //     (response) => {
        //         this.source.push(response);
        //     },
        //     (error) => {
        //         console.error(error);
        //     },
        //     () => {
        this.modalService.open(this.modalTabularDataView);
        //     },
        // );
    }

    getAttributesAndValue(data: any) {
        this.retrievedData = [];
        this.removedSelectedFeatures = [];

        for (const [key, value] of Object.entries(data)) {
            if (!this.filteredColumns.includes(key)) {
                this.retrievedData.push({
                    name: key,
                    value: String(value),
                });

                if (!this.attributeNames.includes(key)) {
                    this.attributeNames.push(key);
                }
            }
        }

        for (const name of this.attributeNames) {
            const type = this.attributeTypeMap.get(name);
            if (type !== DataType.STRING) {
                if (!this.filteredStringTypeAttributeNames.includes(name)) {
                    this.filteredStringTypeAttributeNames.push(name);
                }
            }
        }

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < this.features.length; i++) {
            this.appendFeaturesBasedOnCheckedStatus(this.features[i].featureName, this.features[i].checked);
        }
    }

    getPreviousAttributesAndValue() {
        if (this.isShowInvalidDataOnly) {
            this.getAllInvalidDataUUID();
            if (this.listOfInvalidDataUUID.length > 0) {
                if (this.currentInvalidDataIndex > 0) {
                    this.currentInvalidDataIndex--;
                } else {
                    this.currentInvalidDataIndex = 0;
                }
                this.retrieveCurrentData(this.projectName, this.listOfInvalidDataUUID[this.currentInvalidDataIndex]);
                this.currentDataIndex = this.uuidList.findIndex(
                    (ele) => ele === this.listOfInvalidDataUUID[this.currentInvalidDataIndex],
                );
            }
            return;
        }

        if (this.isSkipInvalidData) {
            this.getAllInvalidDataUUID();
            if (this.listOfInvalidDataUUID.length > 0) {
                this.currentDataIndex--;
                let include = false;
                let uuid = this.uuidList[this.currentDataIndex];
                if (this.listOfInvalidDataUUID.includes(uuid)) {
                    include = true;
                }
                while (include) {
                    this.currentDataIndex--;
                    uuid = this.uuidList[this.currentDataIndex];
                    if (!this.listOfInvalidDataUUID.includes(uuid)) {
                        include = false;
                        break;
                    }
                }
                if (this.currentDataIndex > 0) {
                    this.retrieveCurrentData(this.projectName, this.uuidList[this.currentDataIndex]);
                } else {
                    const firstInvalidUUID = this.listOfInvalidDataUUID[0];
                    const index = this.uuidList.findIndex((ele) => ele === firstInvalidUUID);
                    if (index === 0) {
                        this.currentDataIndex = index + 1;
                        this.retrieveCurrentData(this.projectName, this.uuidList[this.currentDataIndex]);
                    } else {
                        this.currentDataIndex = index - 1;
                        this.retrieveCurrentData(this.projectName, this.uuidList[this.currentDataIndex]);
                    }
                }
                return;
            }
        }

        if (this.currentDataIndex === 0) {
            return;
        }
        this.currentDataIndex--;
        const uuid = this.uuidList[this.currentDataIndex];
        this.retrieveCurrentData(this.projectName, uuid);
    }

    getNextAttributesAndValue() {
        if (this.isShowInvalidDataOnly) {
            this.getAllInvalidDataUUID();
            if (this.listOfInvalidDataUUID.length > 0) {
                if (this.currentInvalidDataIndex !== this.listOfInvalidDataUUID.length - 1) {
                    this.currentInvalidDataIndex++;
                } else {
                    this.currentInvalidDataIndex = this.listOfInvalidDataUUID.length - 1;
                }
                const uuid = this.listOfInvalidDataUUID[this.currentInvalidDataIndex];
                this.retrieveCurrentData(this.projectName, uuid);
                this.currentDataIndex = this.uuidList.findIndex((ele) => ele === uuid);
            }
            return;
        }

        if (this.isSkipInvalidData) {
            this.getAllInvalidDataUUID();
            if (this.listOfInvalidDataUUID.length > 0) {
                this.currentDataIndex++;
                let include = false;
                let uuid = this.uuidList[this.currentDataIndex];
                if (this.listOfInvalidDataUUID.includes(uuid)) {
                    include = true;
                }
                while (include) {
                    this.currentDataIndex++;
                    uuid = this.uuidList[this.currentDataIndex];
                    if (!this.listOfInvalidDataUUID.includes(uuid)) {
                        include = false;
                        break;
                    }
                }
                if (this.currentDataIndex < this.uuidList.length - 1) {
                    this.retrieveCurrentData(this.projectName, uuid);
                } else {
                    this.currentDataIndex = this.uuidList.length - 1;
                    this.retrieveCurrentData(this.projectName, uuid);
                }
            }
            return;
        }

        if (this.currentDataIndex === this.uuidList.length) {
            return;
        }
        this.currentDataIndex++;
        const uuid = this.uuidList[this.currentDataIndex];
        this.retrieveCurrentData(this.projectName, uuid);
    }

    updateLabel(newLabel: label) {
        this.labels.push(newLabel);
        this.updateTempAnnotations('update', newLabel);
        this.tempLabels = this.labels;
        const labelList = this.labels.map((ele) => ele.labelName);
        this._dataSetService.updateLabelList(this.projectName, labelList).subscribe(() => {
            /*this is intentional*/
        });
    }

    removeLabel(label: label) {
        this.labels = this.labels.filter((ele) => ele !== label);
        this.tempLabels = this.labels;
        this.updateTempAnnotations('delete', label);
        if (this.annotations?.includes(label)) {
            this.annotations = this.annotations.filter((ele) => ele !== label);
        }
    }

    getIndex = (index: number): void => {
        this.clickedLabelIndex = index;
    };

    selectColor(color: string) {
        this.labels[this.clickedLabelIndex].tagColor = color;
    }

    chooseLabel(label: label) {
        if (this.isInvalid) {
            return;
        }

        this.annotations.push(label);

        const value = this.annotationIndexMap.get(this.currentDataIndex);
        if (value == null) {
            this.annotationIndexMap.set(this.currentDataIndex, [label]);
        } else if (!value.includes(label)) {
            value.push(label);
        }
        this.updateTempLabels();
        this.updateAnnotation();
    }

    removeAnnotation(annotation: label) {
        if (this.isInvalid) {
            return;
        }
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
                if (!this.tempLabels.some((ele) => ele.labelName === name)) {
                    this.tempLabels.push(...this.labels.filter((ele) => ele.labelName === name));
                }
            }
        }
        this.tempLabels.sort(this.sortBasedOnLabelsOrder);
    }

    retrieveCurrentData(projectName: string, uuid: string) {
        this.tabularLabellingLayoutService.getSpecificData(projectName, uuid).subscribe(
            (response) => {
                this.tabularData = response.tabular_data;
                if (this.tabularData.label !== null) {
                    this.annotations = JSON.parse(this.tabularData.label);
                    this.updateTempLabels();
                    this.isAnnotation(this.annotations);
                } else {
                    this.annotations.splice(0, this.annotations.length);
                    this.tempLabels = this.labels;
                    this.isAnnotation(this.annotations);
                }
                this.updateInvalidCheckBox();
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
        if (annotations.length !== 0 && annotations != null) {
            this.hasAnnotation = true;
        } else {
            this.hasAnnotation = false;
        }
    }

    sortBasedOnLabelsOrder = (a: label, b: label) => {
        return this.labels.indexOf(a) - this.labels.indexOf(b);
    };

    updateAnnotation() {
        this.tabularLabellingLayoutService
            .updateTabularDataLabel(this.projectName, this.tabularData.uuid, this.annotations)
            .subscribe((response) => {
                if (response.error_code === 0) {
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
            const index = this.features.findIndex((ele) => ele.featureName === featureName);
            this.features[index].checked = checked;
            this.appendFeaturesBasedOnCheckedStatus(featureName, checked);
        }
    }

    appendFeaturesBasedOnCheckedStatus(featureName: string, checked: boolean) {
        if (!checked) {
            const dataIndex = this.retrievedData.findIndex((ele) => ele.name === featureName);
            const removeRow = this.retrievedData.splice(dataIndex, 1);
            const removedData: RemovedFeature = {
                name: removeRow[0].name,
                value: removeRow[0].value,
                index: dataIndex,
            };
            this.removedSelectedFeatures.push(removedData);
        }

        if (checked) {
            if (this.removedSelectedFeatures.length === 0) {
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
        const list: any[] = [];
        let annotationNumberMap: Map<string, number>;

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
                    this.scrollTable.nativeElement.scrollTop = 0;
                    if (this.currentDataIndex === 0) {
                        return;
                    }
                    this.getPreviousAttributesAndValue();
                    break;
                case 'ArrowRight':
                    this.scrollTable.nativeElement.scrollTop = 0;
                    if (this.currentDataIndex === this.tabularData.length) {
                        return;
                    }
                    this.getNextAttributesAndValue();
                    break;
                case 'ArrowUp':
                    this.scrollTable.nativeElement.scrollBy(0, -20);
                    break;
                case 'ArrowDown':
                    this.scrollTable.nativeElement.scrollBy(0, 20);
                    break;
                case altKey && 'q':
                    this.invalidCheckBox.nativeElement.checked = !this.invalidCheckBox.nativeElement.checked;
                    this.invalidateData(this.invalidCheckBox.nativeElement.checked);
                    break;
                case altKey && 'w':
                    this.skipInvalidCheckBox.nativeElement.checked = !this.skipInvalidCheckBox.nativeElement.checked;
                    this.skipInvalidData();
                    break;
                case altKey && 'e':
                    document.addEventListener('keydown', (event) => {
                        if (event.altKey && event.key === 'e') {
                            event.preventDefault();
                        }
                    });
                    this.showInvalidOnlyCheckBox.nativeElement.checked =
                        !this.showInvalidOnlyCheckBox.nativeElement.checked;
                    this.showInvalidDataOnly();
                    break;
                case altKey && 't':
                    this.removeAnnotation(this.annotations[this.annotations.length - 1]);
                    break;
            }

            if (key && this.labelShortCutKeyMap.size > 0) {
                const selectedLabel = this.findKeyByValue(this.labelShortCutKeyMap, key.toString());
                if (selectedLabel == null) {
                    return;
                }
                const label = this.labels.filter((ele) => ele.labelName === selectedLabel)[0];
                this.chooseLabel(label);
            }
        } catch (err) {
            console.log(err);
        }
    }

    @HostListener('keydown.control', ['$event'])
    controlKeyEvent(event: KeyboardEvent) {
        if (event.ctrlKey) {
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
        if (this.labels.length === 0) {
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
        if (this.annotations?.length === this.labels.length) {
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
        if (adjustIndex < 0) {
            return;
        }
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

    onClickDownload = (format: string, filterInvalidData: boolean) => {
        this.tabularLabellingLayoutService.downloadFile(this.projectName, format, filterInvalidData).subscribe(
            (res) => {
                if (res.message === 1) {
                    alert(
                        this.projectName + '.' + format + ' is generated in project folder ' + this.projectFolderPath,
                    );
                } else if (res.message === 0) {
                    alert(res.error_message);
                }
            },
            (error) => {
                console.error(error);
            },
            () => {
                this.modalService.close(this.modalIdSave);
            },
        );
    };

    onDownloadLabel = () => {
        const content = this.labels
            .map((ele) => ele.labelName)
            .reduce((prev, curr, i) => {
                prev += curr;
                if (i !== prev.length) {
                    return prev + '\n';
                }
                return prev;
            }, '');

        const fileName = `${this.projectName}_label.txt`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        fileSaver.saveAs(blob, fileName);
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
            isClickSet: false,
            buttonLabel: 'edit',
            isToggleAttributes: false,
            isToggleOperator: false,
            isToggleLowerOperator: false,
            isToggleUpperOperator: false,
            isToggleAnnotation: false,
            isToggleDate: false,
        });
        this.toggleTypeSelection();
        this.createTempAnnotations();
    }

    createTempAnnotations() {
        const tempAnnotations: tempAnnotations[] = [];
        for (const label of this.labels) {
            tempAnnotations.push({ labelName: label.labelName, isSelected: false });
        }
        this.tempSelectedAnnotations.push(tempAnnotations);
    }

    updateTempAnnotations(action: string, label: label) {
        switch (action) {
            case 'update':
                for (const temp of this.tempSelectedAnnotations) {
                    temp.push({ labelName: label.labelName, isSelected: false });
                }
                break;
            case 'delete':
                for (let i = 0; i < this.tempSelectedAnnotations.length; i++) {
                    const filterList = this.tempSelectedAnnotations[i].filter(
                        (ele) => ele.labelName !== label.labelName,
                    );
                    this.tempSelectedAnnotations.splice(i, 1, filterList);
                }
                break;
        }
    }

    isCompleteCurrentCondition = (type: string, index: number) => {
        let condition;
        if (type === 'Threshold') {
            condition = this.labellingThresholdConditionsMap.get(index);
        } else if (type === 'Range') {
            condition = this.labellingRangeConditionsMap.get(index);
        }

        return this.alertUnCompleteConditions(condition, this.previousConditionType);
    };

    editSelectedLabellingCondition(index: number, isClickSet: boolean, type: string) {
        if (this.previousConditionType === '') {
            this.previousConditionType = type;
        }
        if (index !== this.previousConditionIndex) {
            if (this.isCompleteCurrentCondition(this.previousConditionType, this.previousConditionIndex)) {
                return;
            }
            this.previousConditionIndex = index;
            this.previousConditionType = type;
        }

        if (isClickSet) {
            if (type === 'Threshold') {
                if (this.labellingThresholdConditionsMap.has(index)) {
                    if (this.alertUnCompleteConditions(this.labellingThresholdConditionsMap.get(index), type)) {
                        return;
                    }
                } else {
                    if (this.alertUnCompleteConditions(this.tempLabellingConditionsMap.get(index), type)) {
                        return;
                    }
                    if (this.alertDuplicateConditions(type, this.tempLabellingConditionsMap)) {
                        return;
                    }
                }
            } else if (type === 'Range') {
                if (this.labellingRangeConditionsMap.has(index)) {
                    if (this.alertUnCompleteConditions(this.labellingRangeConditionsMap.get(index), type)) {
                        return;
                    }
                } else {
                    if (this.alertUnCompleteConditions(this.tempLabellingConditionsMap.get(index), type)) {
                        return;
                    }
                    if (this.alertDuplicateConditions(type, this.tempLabellingConditionsMap)) {
                        return;
                    }
                }
            }

            if (this.alertLimitOutBound(index, type)) {
                return;
            }
            if (!this.checkAndCorrectValueType(index, type)) {
                return;
            }
            if (this.alertIncorrectSetting(index, type)) {
                return;
            }

            this.selectedConditionTypes[index].isClickSet = false;
            this.selectedConditionTypes[index].buttonLabel = 'edit';
        } else {
            this.selectedConditionTypes.forEach((ele, i) => {
                if (i === index) {
                    ele.isClickSet = true;
                    ele.buttonLabel = 'set';
                } else {
                    ele.isClickSet = false;
                    ele.buttonLabel = 'edit';
                }
            });
        }

        for (const identifier of this.identifiers) {
            this.setToggleState(index, true, identifier);
        }
        this.resetConditionListDisplay(index, type);
    }

    checkAndCorrectValueType = (index: number, type: string) => {
        if (type === 'Threshold') {
            let thresholdCondition;
            if (this.tempLabellingConditionsMap.get(index)) {
                thresholdCondition = this.tempLabellingConditionsMap.get(index);
            } else {
                thresholdCondition = this.labellingThresholdConditionsMap.get(index);
            }
            const attributeName = thresholdCondition.attribute;
            const attributeType = this.attributeTypeMap.get(attributeName);
            if (attributeType === 'number') {
                const value = thresholdCondition.value;
                this.labellingThresholdConditionsMap.get(index).value = Number(value);
            }

            if (attributeType === 'string') {
                const operator = this.labellingThresholdConditionsMap.get(index).operator;
                const allowedOperator = ['equal to', 'not equal to'];
                if (!allowedOperator.includes(operator)) {
                    alert('Only equal to and not equal operator are allowed for current selected attribute');
                    return false;
                }
            }
        } else if (type === 'Range') {
            let rangeCondition;
            if (this.tempLabellingConditionsMap.get(index)) {
                rangeCondition = this.tempLabellingConditionsMap.get(index);
            } else {
                rangeCondition = this.labellingRangeConditionsMap.get(index);
            }
            const attributeName = rangeCondition.attribute;
            const attributeType = this.attributeTypeMap.get(attributeName);
            if (attributeType === 'number') {
                const lowerLimit = rangeCondition.lowerLimit;
                const upperLimit = rangeCondition.upperLimit;
                if (this.tempLabellingConditionsMap.get(index)) {
                    this.tempLabellingConditionsMap.get(index).lowerLimit = Number(lowerLimit);
                    this.tempLabellingConditionsMap.get(index).upperLimit = Number(upperLimit);
                } else {
                    this.labellingRangeConditionsMap.get(index).lowerLimit = Number(lowerLimit);
                    this.labellingRangeConditionsMap.get(index).upperLimit = Number(upperLimit);
                }
            }
        }
        return true;
    };

    alertUnCompleteConditions = (conditions: any, type: string): boolean => {
        if (conditions === undefined) {
            alert(type + ' condition is undefined. Please set the parameters of the condition');
            return true;
        } else {
            if (type === 'Threshold') {
                const keys = Object.keys(conditions);
                const thresholdKeys = ['attribute', 'operator', 'value', 'label', 'dateFormat'];
                if (keys.includes('dateFormat') && keys.length < 5) {
                    const missingKeys = thresholdKeys
                        .filter((ele) => !keys.includes(ele))
                        .map((ele) => ele.charAt(0).toUpperCase() + ele.substring(1));
                    const index = missingKeys.findIndex((ele) => ele === 'Label');
                    missingKeys[index] = 'Annotation';
                    alert(
                        'Please finish setting the threshold conditions.\n' +
                            'Empty settings: ' +
                            missingKeys.join(', '),
                    );
                    return true;
                }

                if (!keys.includes('dateFormat') && keys.length < 4) {
                    const missingKeys = thresholdKeys
                        .filter((ele) => ele !== 'dateFormat')
                        .filter((ele) => !keys.includes(ele))
                        .map((ele) => ele.charAt(0).toUpperCase() + ele.substring(1));
                    const index = missingKeys.findIndex((ele) => ele === 'Label');
                    missingKeys[index] = 'Annotation';
                    alert(
                        'Please finish setting the threshold conditions.\n' +
                            'Empty settings: ' +
                            missingKeys.join(', '),
                    );
                    return true;
                }

                if (conditions.label.length === 0) {
                    alert('Empty label');
                    return true;
                }
            }

            if (type === 'Range') {
                const keys = Object.keys(conditions);
                const rangeKeys = [
                    'attribute',
                    'lowerOperator',
                    'upperOperator',
                    'lowerLimit',
                    'upperLimit',
                    'label',
                    'dateFormat',
                ];
                if (keys.includes('dateFormat') && keys.length < 7) {
                    const missingKeys = rangeKeys
                        .filter((ele) => !keys.includes(ele))
                        .map((ele) => ele.charAt(0).toUpperCase() + ele.substring(1));
                    const index = missingKeys.findIndex((ele) => ele === 'Label');
                    missingKeys[index] = 'Annotation';
                    alert(
                        'Please finish setting the Range conditions.\n' + 'Empty settings: ' + missingKeys.join(', '),
                    );
                    return true;
                }

                if (!keys.includes('dateFormat') && keys.length < 6) {
                    const missingKeys = rangeKeys
                        .filter((ele) => ele !== 'dateFormat')
                        .filter((ele) => !keys.includes(ele))
                        .map((ele) => ele.charAt(0).toUpperCase() + ele.substring(1));
                    const index = missingKeys.findIndex((ele) => ele === 'Label');
                    missingKeys[index] = 'Annotation';
                    alert(
                        'Please finish setting the Range conditions.\n' + 'Empty settings: ' + missingKeys.join(', '),
                    );
                    return true;
                }

                if (conditions.label.length === 0) {
                    alert('Empty label');
                    return true;
                }
            }
        }
        return false;
    };

    alertLimitOutBound = (index: number, type: string): boolean => {
        if (type === 'Range') {
            let result;
            if (this.tempLabellingConditionsMap.get(index)) {
                result = this.tempLabellingConditionsMap.get(index);
            } else {
                result = this.labellingRangeConditionsMap.get(index);
            }
            if (result.attribute) {
                const attributeName = result.attribute;
                const attributeType = this.attributeTypeMap.get(attributeName);

                if (attributeType === DataType.NUMBER) {
                    const upperLimit = result.upperLimit;
                    const lowerLimit = result.lowerLimit;
                    if (lowerLimit && upperLimit && lowerLimit >= upperLimit) {
                        alert('Value set at lower limit is higher than or equal to upper limit. Please correct it');
                        return true;
                    }
                }

                if (attributeType === DataType.DATE) {
                    const format = result.dateFormat;
                    if (!format) {
                        alert('Please specify date format');
                        return true;
                    }
                    const upperLimit = result.upperLimit as string;
                    const lowerLimit = result.lowerLimit as string;

                    if (lowerLimit && upperLimit) {
                        const lowerLimitDate = this.parseDate(lowerLimit, format);
                        const upperLimitDate = this.parseDate(upperLimit, format);

                        if (lowerLimitDate && upperLimitDate && lowerLimitDate.getTime() >= upperLimitDate.getTime()) {
                            alert('Date set at lower limit is higher than or equal to upper limit. Please correct it');
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    parseDate = (dateString: string, format: string) => {
        const dayMonthYearRegex = /^([0]?[1-9]|[1|2][0-9]|[3][0|1])[./-]([0]?[1-9]|[1][0-2])[./-]([0-9]{4}|[0-9]{2})$/g;
        const yearMonthDayRegex = /^\d{4}[./-](0?[1-9]|1[012])[./-](0?[1-9]|[12][0-9]|3[01])$/g;
        let splitDate: string[] = [];

        if (dayMonthYearRegex.test(dateString)) {
            splitDate = dateString.split(/[/.-]+/);
        }

        if (yearMonthDayRegex.test(dateString)) {
            splitDate = dateString.split(/[/.-]+/);
        }

        switch (format) {
            case 'dd/MM/yyyy':
                return new Date(Number(splitDate[2]), Number(splitDate[1]) - 1, Number(splitDate[0]));
            case 'MM/dd/yyyy':
                return new Date(Number(splitDate[2]), Number(splitDate[0]) - 1, Number(splitDate[1]));
            case 'yyyy/MM/dd':
                return new Date(Number(splitDate[0]), Number(splitDate[1]) - 1, Number(splitDate[2]));
        }
    };

    alertWrongDataType = (index: number, type: string, value: any) => {
        if (type === 'Threshold') {
            let thresholdCondition;
            if (this.tempLabellingConditionsMap.get(index)) {
                thresholdCondition = this.tempLabellingConditionsMap.get(index);
            } else {
                thresholdCondition = this.labellingThresholdConditionsMap.get(index);
            }

            if (thresholdCondition.attribute) {
                const attributeType = this.attributeTypeMap.get(thresholdCondition.attribute);
                if (attributeType === DataType.NUMBER && !this.isNumber(value)) {
                    alert('Input value is not a number. Please correct it');
                    return true;
                }

                if (attributeType === DataType.STRING && this.isNumber(value)) {
                    alert('Input value is not a string. Please correct it');
                    return true;
                }

                if (attributeType === DataType.DATE && !this.isValidDate(value)) {
                    alert('Wrong input date format. Please correct it with chosen date format');
                    return true;
                }

                if (
                    attributeType === DataType.DATE &&
                    !this.isTallyWithSelectedDateFormat(value, thresholdCondition.dateFormat)
                ) {
                    alert(
                        'Input date format not tally with selected date format. Please correct it with chosen date format',
                    );
                    return true;
                }
            }
        } else if (type === 'Range') {
            let rangeCondition;
            if (this.tempLabellingConditionsMap.get(index)) {
                rangeCondition = this.tempLabellingConditionsMap.get(index);
            } else {
                rangeCondition = this.labellingRangeConditionsMap.get(index);
            }

            if (rangeCondition.attribute) {
                const attributeType = this.attributeTypeMap.get(rangeCondition.attribute);
                if (attributeType === DataType.NUMBER && !this.isNumber(value)) {
                    alert('Input value is not a number. Please correct it');
                    return true;
                }

                if (attributeType === DataType.DATE && !this.isValidDate(value)) {
                    alert('Wrong input date format. Please correct it with chosen date format');
                    return true;
                }

                if (
                    attributeType === DataType.DATE &&
                    !this.isTallyWithSelectedDateFormat(value, rangeCondition.dateFormat)
                ) {
                    alert(
                        'Input date format not tally with selected date format. Please correct it with chosen date format',
                    );
                    return true;
                }
            }
        }
        return false;
    };

    alertIncorrectSetting = (index: number, type: string) => {
        let condition;
        if (type === 'Threshold') {
            if (this.tempLabellingConditionsMap.get(index)) {
                condition = this.tempLabellingConditionsMap.get(index);
            } else {
                condition = this.labellingThresholdConditionsMap.get(index);
            }
            if (condition) {
                if (this.alertWrongDataType(index, type, condition.value)) {
                    return true;
                }
            }
        }

        if (type === 'Range') {
            if (this.tempLabellingConditionsMap.get(index)) {
                condition = this.tempLabellingConditionsMap.get(index);
            } else {
                condition = this.labellingRangeConditionsMap.get(index);
            }

            if (condition) {
                if (this.alertWrongDataType(index, type, condition.lowerLimit)) {
                    return true;
                }

                if (this.alertWrongDataType(index, type, condition.upperLimit)) {
                    return true;
                }
            }
        }
        return false;
    };

    alertDuplicateConditions = (type: string, newConditions: Map<number, any>) => {
        if (type === 'Threshold') {
            return this.checkThresholdDuplicate(type, newConditions);
        } else if (type === 'Range') {
            return this.checkRangeDuplicate(type, newConditions);
        }
    };

    checkIfBothLabelArraySimilar = (currentLabelList: label[], setLabelList: label[]) => {
        const setLabel: string[] = setLabelList.map((ele: { labelName: string; tagColor: string }) => ele.labelName);
        const currentLabel: string[] = currentLabelList.map(
            (ele: { labelName: string; tagColor: string }) => ele.labelName,
        );
        if (setLabel.length === currentLabel.length) {
            return setLabel.every((element) => {
                if (currentLabel.includes(element)) {
                    return true;
                }
                return false;
            });
        }
        return false;
    };

    checkRangeDuplicate = (type: string, newConditions: Map<number, any>) => {
        let currentSetCondition;
        for (const [key, value] of newConditions) {
            currentSetCondition = value;
        }

        if (currentSetCondition.label.length === 0) {
            alert('Empty label');
            return;
        }

        if (this.labellingRangeConditionsMap.size === 0) {
            this.updateLabellingMap(type, newConditions);
            return false;
        }

        const listOfChecking: boolean[] = [];
        if (currentSetCondition) {
            for (const [key, value] of this.labellingRangeConditionsMap) {
                if (currentSetCondition.attribute === value.attribute) {
                    const isSameOperators =
                        currentSetCondition.lowerOperator === value.lowerOperator &&
                        currentSetCondition.upperOperator === value.upperOperator;
                    const isSameLimits =
                        currentSetCondition.lowerLimit === value.lowerLimit &&
                        currentSetCondition.upperLimit === value.upperLimit;
                    const isSameLabels = this.checkIfBothLabelArraySimilar(value.label, currentSetCondition.label);
                    if (isSameLimits && isSameLabels && isSameOperators) {
                        listOfChecking.push(true);
                    } else {
                        listOfChecking.push(false);
                    }
                }
            }
        }
        if (listOfChecking.includes(true)) {
            alert('This condition is repeated, please correct it');
            return true;
        } else {
            this.updateLabellingMap(type, newConditions);
            return false;
        }
    };

    checkThresholdDuplicate = (type: string, newConditions: Map<number, any>) => {
        let currentSetCondition;
        for (const [key, value] of newConditions) {
            currentSetCondition = value;
        }

        if (this.labellingThresholdConditionsMap.size === 0) {
            this.updateLabellingMap(type, newConditions);
            return false;
        } else if (currentSetCondition.label === undefined || currentSetCondition.label.length === 0) {
            alert('Empty label');
            return;
        }

        const listOfChecking: boolean[] = [];
        if (currentSetCondition) {
            for (const [key, value] of this.labellingThresholdConditionsMap) {
                if (currentSetCondition.attribute === value.attribute) {
                    const isSameOperator = currentSetCondition.operator === value.operator;
                    const isSameValue = currentSetCondition.value === value.value;
                    const isSameLabels = this.checkIfBothLabelArraySimilar(value.label, currentSetCondition.label);
                    if (isSameValue && isSameLabels && isSameOperator) {
                        listOfChecking.push(true);
                    } else {
                        listOfChecking.push(false);
                    }
                }
            }
        }

        if (listOfChecking.includes(true)) {
            alert('This condition is repeated, please correct it');
            return true;
        } else {
            this.updateLabellingMap(type, newConditions);
            return false;
        }
    };

    updateLabellingMap(type: string, newConditions: Map<number, any>) {
        if (type === 'Threshold') {
            for (const [key, value] of newConditions) {
                this.labellingThresholdConditionsMap.set(key, value);
            }
        } else if (type === 'Range') {
            for (const [key, value] of newConditions) {
                this.labellingRangeConditionsMap.set(key, value);
            }
        }
        this.tempLabellingConditionsMap.clear();
    }

    onClickInputField(index: number) {
        for (const identifier of this.identifiers) {
            this.setToggleState(index, true, identifier);
        }
    }

    deleteCondition(index: number) {
        this.selectedConditionTypes.splice(index, 1);
        this.tempSelectedAnnotations.splice(index, 1);
        this.tempLabellingConditionsMap.clear();

        if (this.labellingRangeConditionsMap.has(index)) {
            this.labellingRangeConditionsMap.delete(index);
            this.labellingRangeConditionsMap = this.adjustIndexOfMap(index, this.labellingRangeConditionsMap);
            this.labellingThresholdConditionsMap = this.adjustIndexOfMap(index, this.labellingThresholdConditionsMap);
        }

        if (this.labellingThresholdConditionsMap.has(index)) {
            this.labellingThresholdConditionsMap.delete(index);
            this.labellingThresholdConditionsMap = this.adjustIndexOfMap(index, this.labellingThresholdConditionsMap);
            this.labellingRangeConditionsMap = this.adjustIndexOfMap(index, this.labellingRangeConditionsMap);
        }

        if (this.conditionMapsList.has(index)) {
            this.conditionMapsList.delete(index);
            this.conditionMapsList = this.adjustIndexOfMap(index, this.conditionMapsList);
        }

        if (this.displayConditions.has(index)) {
            this.displayConditions.delete(index);
            this.displayConditions = this.adjustIndexOfMap(index, this.displayConditions);
            this.conditionList.splice(0, this.conditionList.length);
            this.listOutConditions();
        }
        this.previousConditionIndex = this.conditionMapsList.size;
        this.previousConditionType = '';
    }

    adjustIndexOfMap = (index: number, map: Map<number, any>) => {
        const newMap: Map<number, any> = new Map();
        for (const [key, value] of map.entries()) {
            if (key === 0 || key < index) {
                newMap.set(key, value);
            }
            if (key > index) {
                newMap.set(key - 1, value);
            }
        }
        return newMap;
    };

    resetConditionListDisplay(index: number, type: string) {
        if (type === 'Threshold') {
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

        if (type === 'Range') {
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
        if (!status) {
            switch (identifier) {
                case 'attribute':
                    this.selectedConditionTypes[index].isToggleAttributes = true;
                    this.selectedConditionTypes[index].isToggleOperator = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    this.selectedConditionTypes[index].isToggleUpperOperator = false;
                    this.selectedConditionTypes[index].isToggleLowerOperator = false;
                    this.selectedConditionTypes[index].isToggleDate = false;
                    break;
                case 'operator':
                    this.selectedConditionTypes[index].isToggleOperator = true;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    this.selectedConditionTypes[index].isToggleDate = false;
                    break;
                case 'lowerOperator':
                    this.selectedConditionTypes[index].isToggleLowerOperator = true;
                    this.selectedConditionTypes[index].isToggleUpperOperator = false;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    this.selectedConditionTypes[index].isToggleDate = false;
                    break;
                case 'upperOperator':
                    this.selectedConditionTypes[index].isToggleUpperOperator = true;
                    this.selectedConditionTypes[index].isToggleLowerOperator = false;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
                    this.selectedConditionTypes[index].isToggleDate = false;
                    break;
                case 'annotation':
                    this.selectedConditionTypes[index].isToggleAnnotation = true;
                    this.selectedConditionTypes[index].isToggleAttributes = false;
                    this.selectedConditionTypes[index].isToggleOperator = false;
                    this.selectedConditionTypes[index].isToggleUpperOperator = false;
                    this.selectedConditionTypes[index].isToggleLowerOperator = false;
                    this.selectedConditionTypes[index].isToggleDate = false;
                    break;
                case 'dateFormat':
                    this.selectedConditionTypes[index].isToggleDate = true;
                    this.selectedConditionTypes[index].isToggleAnnotation = false;
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
                case 'dateFormat':
                    this.selectedConditionTypes[index].isToggleDate = false;
                    break;
            }
        }
    }

    isDateAttribute = (index: number, type: string) => {
        let isDate = false;
        let condition;

        if (type === 'Threshold') {
            if (this.labellingThresholdConditionsMap.get(index)) {
                condition = this.labellingThresholdConditionsMap.get(index);
            } else {
                condition = this.tempLabellingConditionsMap.get(index);
            }
        } else if (type === 'Range') {
            if (this.labellingRangeConditionsMap.get(index)) {
                condition = this.labellingRangeConditionsMap.get(index);
            } else {
                condition = this.tempLabellingConditionsMap.get(index);
            }
        }

        if (condition && condition.attribute) {
            const attributeName = condition.attribute;
            const type = this.attributeTypeMap.get(attributeName);
            if (type === DataType.DATE) {
                isDate = true;
            }
        }

        return isDate;
    };

    displayDateExample = (index: number, type: string) => {
        let condition;
        if (type === 'Threshold') {
            if (this.labellingThresholdConditionsMap.size > 0) {
                condition = this.labellingThresholdConditionsMap.get(index);
            } else {
                condition = this.tempLabellingConditionsMap.get(index);
            }
        } else if (type === 'Range') {
            if (this.labellingRangeConditionsMap.size > 0) {
                condition = this.labellingRangeConditionsMap.get(index);
            } else {
                condition = this.tempLabellingConditionsMap.get(index);
            }
        }

        if (condition !== undefined) {
            const dateFormat = condition.dateFormat;
            for (const date of this.dateFormat) {
                if (date.format === dateFormat) {
                    return 'exp: ' + date.example;
                }
            }
        }
    };

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
                    if (ele.labelName === parameter) {
                        ele.isSelected = !ele.isSelected;
                    }
                });
                break;
            case 'dateFormat':
                data = {
                    dateFormat: parameter,
                };
                break;
        }
        this.preCheckThresholdConditionSettings(data, index);
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
                    if (ele.labelName === parameter) {
                        ele.isSelected = !ele.isSelected;
                    }
                });
                break;
            case 'dateFormat':
                data = {
                    dateFormat: parameter,
                };
                break;
        }
        this.preCheckRangeConditionSettings(data, index);
    }

    preCheckThresholdConditionSettings(array: threshold, index: number) {
        if (this.labellingThresholdConditionsMap.has(index)) {
            this.setThresholdConditionSettingsMap(array, index, this.labellingThresholdConditionsMap);
        } else {
            this.setThresholdConditionSettingsMap(array, index, this.tempLabellingConditionsMap);
        }
    }

    preCheckRangeConditionSettings(array: threshold, index: number) {
        if (this.labellingRangeConditionsMap.has(index)) {
            this.setRangeConditionSettingsMap(array, index, this.labellingRangeConditionsMap);
        } else {
            this.setRangeConditionSettingsMap(array, index, this.tempLabellingConditionsMap);
        }
    }

    setThresholdConditionSettingsMap(array: threshold, index: number, conditionMap: Map<number, any>) {
        const containKey = conditionMap.has(index);
        const newKey = Object.keys(array)[0];
        if (containKey === false) {
            const newKey = Object.keys(array)[0];
            if (newKey === 'label') {
                const annotation = {
                    label: [array.label],
                };
                conditionMap.set(index, annotation);
            } else {
                conditionMap.set(index, array);
            }
        } else {
            let result = conditionMap.get(index);
            const availableKey = Object.keys(result);
            const newKey = Object.keys(array)[0];

            if (result) {
                if (availableKey.includes(newKey) === false) {
                    if (newKey === 'label') {
                        const annotation = {
                            label: [array.label],
                        };
                        result = { ...result, ...annotation };
                        conditionMap.set(index, result);
                    } else {
                        result = { ...result, ...array };
                        conditionMap.set(index, result);
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
                                (ele: { labelName: string | undefined }) => ele.labelName === array.label?.labelName,
                            );

                            if (isContain === false) {
                                annotations.push(array.label);
                                result.label = annotations;
                            } else {
                                const index = annotations.findIndex(
                                    (ele: { labelName: string | undefined }) =>
                                        ele.labelName === array.label?.labelName,
                                );
                                annotations.splice(index, 1);
                            }
                            break;
                        case 'dateFormat':
                            result.dateFormat = array.dateFormat;
                            break;
                    }
                }
            }
        }
    }

    setRangeConditionSettingsMap(array: range, index: number, conditionMap: Map<number, any>) {
        const containKey = conditionMap.has(index);

        if (!containKey) {
            const newKey = Object.keys(array)[0];
            if (newKey === 'label') {
                const annotation = {
                    label: [array.label],
                };
                conditionMap.set(index, annotation);
            } else {
                conditionMap.set(index, array);
            }
        } else {
            let result = conditionMap.get(index);
            const availableKey = Object.keys(result);
            const newKey = Object.keys(array)[0];

            if (result) {
                if (!availableKey.includes(newKey)) {
                    if (newKey === 'label') {
                        const annotation = {
                            label: [array.label],
                        };
                        result = { ...result, ...annotation };
                        conditionMap.set(index, result);
                    } else {
                        result = { ...result, ...array };
                        conditionMap.set(index, result);
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
                                (ele: { labelName: string | undefined }) => ele.labelName === array.label?.labelName,
                            );

                            if (isContain === false) {
                                annotations.push(array.label);
                                result.label = annotations;
                            } else if (isContain === true) {
                                const index = annotations.findIndex(
                                    (ele: { labelName: string | undefined }) =>
                                        ele.labelName === array.label?.labelName,
                                );
                                annotations.splice(index, 1);
                            }
                            break;
                        case 'dateFormat':
                            result.dateFormat = array.dateFormat;
                            break;
                    }
                }
            }
        }
    }

    displaySelection = (index: number, identifier: string, condition: string): string => {
        let selection: string;
        if (condition === 'Threshold') {
            let thresholdCondition;
            if (this.labellingThresholdConditionsMap.has(index)) {
                thresholdCondition = this.labellingThresholdConditionsMap.get(index);
            } else {
                thresholdCondition = this.tempLabellingConditionsMap.get(index);
            }

            if (thresholdCondition === undefined) {
                selection = this.displayDefaultText(identifier);
            } else {
                selection = this.displayThresholdSelection(index, identifier, thresholdCondition);
            }
        } else {
            let rangeCondition;
            if (this.labellingRangeConditionsMap.has(index)) {
                rangeCondition = this.labellingRangeConditionsMap.get(index);
            } else {
                rangeCondition = this.tempLabellingConditionsMap.get(index);
            }

            if (rangeCondition === undefined) {
                selection = this.displayDefaultText(identifier);
            } else {
                selection = this.displayRangeSelection(index, identifier, rangeCondition);
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
                display = 'Operator';
                break;
            case 'upperOperator':
                display = 'Operator';
                break;
            case 'label':
                display = 'Annotation';
                break;
            case 'dateFormat':
                display = 'Date Format';
        }
        return display;
    };

    displayThresholdSelection = (index: number, identifier: string, selection: threshold): string => {
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
            case 'dateFormat':
                const dateFormat = selection.dateFormat;
                display = dateFormat ? dateFormat : 'Date Format';
        }
        return display;
    };

    displayRangeSelection = (index: number, identifier: string, selection: range): string => {
        let display = '';

        switch (identifier) {
            case 'attribute':
                const attribute = selection.attribute;
                display = attribute ? attribute.toLowerCase() : 'Attribute';
                break;
            case 'lowerOperator':
                const lowerOperator = selection.lowerOperator;
                display = lowerOperator ? this.operatorSymbol(lowerOperator, 'Range') : 'Operator';
                break;
            case 'upperOperator':
                const upperOperator = selection.upperOperator;
                display = upperOperator ? this.operatorSymbol(upperOperator, 'Range') : 'Operator';
                break;
            case 'label':
                const annotation = selection.label;
                display = annotation ? annotation.labelName : 'Annotation';
                break;
            case 'lowerLimit':
                const lowerLimit = selection.lowerLimit;
                display = lowerLimit ? String(lowerLimit) : '';
                break;
            case 'upperLimit':
                const upperLimit = selection.upperLimit;
                display = upperLimit ? String(upperLimit) : '';
                break;
            case 'dateFormat':
                const dateFormat = selection.dateFormat;
                display = dateFormat ? dateFormat : 'Date Format';
        }
        return display;
    };

    displayThresholdCondition = (index: number): string => {
        const isKey = this.labellingThresholdConditionsMap.has(index);
        if (!isKey) {
            return 'empty';
        }
        let display = '';

        const conditions = this.labellingThresholdConditionsMap.get(index) as threshold;
        const attribute = conditions.attribute === undefined ? 'attribute' : conditions.attribute.toLowerCase();
        const value = conditions.value === undefined ? 'value' : String(conditions.value);
        const operator =
            conditions.operator === undefined ? 'operator' : this.operatorSymbol(conditions.operator, 'Threshold');
        const annotations = conditions.label === undefined ? 'annotations' : this.expandAnnotation(conditions.label);
        const displayString = attribute + ' ' + operator + ' ' + value + ' ' + '\u003a' + ' ' + annotations;

        display = displayString;
        this.createConditionsDisplay(index, displayString);
        return display;
    };

    displayRangeCondition = (index: number): string => {
        const isKey = this.labellingRangeConditionsMap.has(index);
        if (!isKey) {
            return 'empty';
        }
        let display: string;

        const conditions = this.labellingRangeConditionsMap.get(index) as range;
        const attribute = conditions.attribute === undefined ? 'attribute' : conditions.attribute.toLowerCase();
        const lowerLimit = conditions.lowerLimit === undefined ? 'lowerLimit' : String(conditions.lowerLimit);
        const upperLimit = conditions.upperLimit === undefined ? 'upperLimit' : String(conditions.upperLimit);
        const lowerOperator =
            conditions.lowerOperator === undefined
                ? 'lowerOperator'
                : this.operatorSymbol(conditions.lowerOperator, 'Range');
        const upperOperator =
            conditions.upperOperator === undefined
                ? 'upperOperator'
                : this.operatorSymbol(conditions.upperOperator, 'Range');
        const annotations = conditions.label === undefined ? 'annotations' : this.expandAnnotation(conditions.label);
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
        if (!this.displayConditions.has(index)) {
            this.displayConditions.set(index, selectedCondition);
        } else {
            let condition = this.displayConditions.get(index);
            if (condition !== selectedCondition) {
                condition = selectedCondition;
            }
        }
        this.listOutConditions();
    }

    expandAnnotation = (annotations: any): string => {
        let annotationString = '';
        for (let i = 0; i < annotations.length; i++) {
            if (i !== annotations.length - 1) {
                annotationString += annotations[i].labelName + ', ';
            } else {
                annotationString += annotations[i].labelName;
            }
        }
        return annotationString;
    };

    operatorSymbol = (operator: string, type: string): string => {
        const symbol = '';
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
                operator = type === 'Range' ? '\u003c' : '\u003e';
                break;
            case 'more than or equal to':
                operator = type === 'Range' ? '\u2264' : '\u2265';
                break;
            case 'not equal to':
                operator = '\u2260';
                break;
        }
        return operator;
    };

    listOutConditions() {
        for (const [key, value] of this.displayConditions.entries()) {
            if (this.conditionList.includes(value) === false) {
                this.conditionList.push(value);
            }
        }
    }

    preparePreLabellingConditions(status: boolean) {
        if (status === false) {
            for (const [key, condition] of this.labellingThresholdConditionsMap.entries()) {
                if (this.conditionMapsList.has(key) === false) {
                    this.conditionMapsList.set(key, { threshold: condition });
                } else {
                    let selectedCondition = this.conditionMapsList.get(key).threshold;
                    selectedCondition = condition;
                }
            }

            for (const [key, condition] of this.labellingRangeConditionsMap) {
                if (this.conditionMapsList.has(key) === false) {
                    this.conditionMapsList.set(key, { range: condition });
                } else {
                    let selectedCondition = this.conditionMapsList.get(key).range;
                    selectedCondition = condition;
                }
            }
        }
    }

    automateLabelling() {
        if (this.conditionMapsList.size === 0) {
            alert('No pre-labelling conditions settings');
            return;
        }
        this.modalService.close(this.modalAlertWindow);
        this.modalService.close(this.modalAddLabellingConditions);
        this.tabularLabellingLayoutService
            .setPreLabellingConditions(
                this.projectName,
                this.conditionMapsList,
                this.uuidList[this.currentDataIndex],
                this.labellingSequenceChoice,
            )
            .subscribe((res) => {
                // if (res.message == 1) {
                //     console.log(res.tabular_data);
                // }
            });
    }

    onClickAutomate() {
        this.modalService.open(this.modalAlertWindow);
    }

    onCancelAutomate() {
        this.modalService.close(this.modalAlertWindow);
    }

    invalidateData(checked: boolean) {
        if (checked) {
            this.isInvalid = true;
            this.annotations.splice(0, this.annotations.length);
            this.annotations.push({ labelName: 'Invalid', tagColor: 'red' });
            this.updateTempLabels();
            this.updateAnnotation();
        } else {
            this.isInvalid = false;
            this.annotations.splice(0, 1);
            this.updateAnnotation();
        }
    }

    updateInvalidCheckBox() {
        const labelName = this.annotations.filter((ele) => ele.labelName === 'Invalid');
        if (labelName.length !== 0) {
            this.isInvalid = true;
            this.invalidCheckBox.nativeElement.checked = true;
        } else {
            this.isInvalid = false;
            this.invalidCheckBox.nativeElement.checked = false;
        }
        this.invalidCheckBox.nativeElement.blur();
        this.skipInvalidCheckBox.nativeElement.blur();
        this.showInvalidOnlyCheckBox.nativeElement.blur();
    }

    filterInvalidDataInOutputFile(checked: boolean) {
        this.filterInvalidData = checked;
    }

    getAllInvalidDataUUID() {
        this.tabularLabellingLayoutService.getAllInvalidData(this.projectName).subscribe((res) => {
            this.listOfInvalidDataUUID = res;
        });
    }

    skipInvalidData() {
        this.isSkipInvalidData = !this.isSkipInvalidData;
    }

    showInvalidDataOnly() {
        this.isShowInvalidDataOnly = !this.isShowInvalidDataOnly;
    }

    labellingSequenceMode() {
        if (this.appendCheckBox.nativeElement.checked) {
            this.overWriteCheckBox.nativeElement.disabled = true;
            this.labellingSequenceChoice = 'append';
        } else if (!this.appendCheckBox.nativeElement.checked) {
            this.overWriteCheckBox.nativeElement.disabled = false;
        }

        if (this.overWriteCheckBox.nativeElement.checked) {
            this.appendCheckBox.nativeElement.disabled = true;
            this.labellingSequenceChoice = 'overwrite';
        } else if (!this.overWriteCheckBox.nativeElement.checked) {
            this.appendCheckBox.nativeElement.disabled = false;
        }
    }

    projectStatistics() {
        this._dataSetService.getProjectStats(this.projectName).subscribe((response) => {
            if (response) {
                this.labeledData = response.labeled_data;
                this.unLabeledData = response.unlabeled_data;
                this.statistics.splice(0, this.statistics.length);
                response.label_per_class_in_project.forEach((labelMeta: labels_stats) => {
                    if (labelMeta.count > 0) {
                        this.emptyLabel = false;
                        this.emptyAnnotation = false;
                    }
                    const meta = {
                        name: labelMeta.label,
                        value: labelMeta.count,
                    };
                    this.statistics.push(meta);
                });
                if (response.label_per_class_in_project.length === 0) {
                    this.emptyLabel = true;
                    this.emptyAnnotation = true;
                }
                this.modalService.open(this.modalIdProjectStats);
            }
        });
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

    toggleInfo() {
        this.modalService.open(this.modalShortcutKeyInfo);
    }

    shortcutKeyInfo() {
        return [
            {
                no: 1,
                shortcutKey: `Arrow right`,
                functionality: `Navigate next data`,
            },
            {
                no: 2,
                shortcutKey: `Arrow left`,
                functionality: `Navigate previous data`,
            },
            {
                no: 3,
                shortcutKey: `Arrow up`,
                functionality: `Scroll table up`,
            },
            {
                no: 4,
                shortcutKey: `Arrow down`,
                functionality: `Scroll table down`,
            },
            {
                no: 5,
                shortcutKey: `Alt + q`,
                functionality: `Invalidate current data`,
            },
            {
                no: 6,
                shortcutKey: `Alt + w`,
                functionality: `Skip all invalid data`,
            },
            {
                no: 7,
                shortcutKey: `Alt + e`,
                functionality: `Show invalid data only`,
            },
            {
                no: 8,
                shortcutKey: `Alt + t`,
                functionality: `Remove last annotation`,
            },
        ];
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
        this.labellingModeService.setLabellingMode(null);
        this.resetProjectStatus();
    }
}
