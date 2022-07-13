import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RegionProps, label } from '../../shared/types/labelling-type/audio-labelling.model';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { first, mergeMap, takeUntil } from 'rxjs/operators';

import { AudioLabellingLayoutService } from './audio-labelling-layout.service';
import { ChartProps } from '../../shared/types/dataset-layout/data-set-layout.model';
import { DataSetLayoutService } from '../data-set-layout/data-set-layout-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LanguageService } from '../../shared/services/language.service';
import { ModalBodyStyle } from '../../shared/types/modal/modal.model';
import { ModalService } from '../../shared/components/modal/modal.service';
import { Router } from '@angular/router';
import { labels_stats } from '../../shared/types/message/message.model';
import { v4 as uuid } from 'uuid';
import MinimapPlugin from 'wavesurfer.js/src/plugin/minimap';
import TimelinePlugin from 'wavesurfer.js/src/plugin/timeline';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/src/plugin/cursor';
import { Region } from 'wavesurfer.js/src/plugin/regions';
import RegionsPlugin from 'wavesurfer.js/src/plugin/regions';

@Component({
    selector: 'audio-labelling-layout',
    templateUrl: './audio-labelling-layout.component.html',
    styleUrls: ['./audio-labelling-layout.component.scss'],
})
export class AudioLabellingLayoutComponent implements OnInit, OnDestroy {
    private subject: Subject<any> = new Subject<any>();
    private subscription!: Subscription;
    url: string = 'assets/sample.wav';
    wave!: WaveSurfer;
    moreVerticalIcon = 'assets/icons/more.svg';
    projectName: string = '';
    fileSize: string | undefined = '';
    fileType: string | undefined = '';
    filePath: string | undefined = '';
    unsubscribe$: Subject<any> = new Subject<any>();
    hasSetStartTime: boolean = false;
    isAllowLabel: boolean = false;
    isCursorShow: boolean = false;
    isPlaying: boolean = false;
    startTime: number = 0;
    endTime: number = 0;
    currentZoomValue: number = 0;
    currentSearchTime: number = 0;
    selectedRegion: string = '';
    allowSelectRegion: boolean = false;
    selectedRegionsList: any[] = [];
    regionPropsList: RegionProps[] = [];
    selectedDeleteIds: Set<string> = new Set<string>();
    tempCollectionOfDeletedRegions: Region[][] = [];
    tempCollectionOfDeletedRegionsIndex: number = 0;
    labels: label[] = [];
    floatLabels: label[] = [];
    labelIndex: number = 0;
    selectedLabel!: label;
    audioFileName: string = '';
    audioVolume: string = '50%';
    progress: number = 0;
    peaks: number[] = [];
    currentRegionIndex: number = 0;
    langsArr: string[] = ['audio-labelling-en'];
    regionIdList: string[] = [];
    regionOffsetRatio: number = 0;
    displayRegionIndicator: boolean = false;
    displayMiniMapTime: boolean = false;
    enableDragRegionIndicator: boolean = false;
    movingDistance: string = '';
    currentPosition: number = 0;
    isAdjustTempRegion: boolean = false;
    selectedRegionId: string = '';
    labelTagIdMap: Map<string, string> = new Map<string, string>();
    labelNameIdMap: Map<string, string> = new Map<string, string>();
    updateRegionLengthParam: any = {};
    defaultRegionLength: number = 0;
    statistics: ChartProps[] = [];
    labeledData: number = 0;
    unLabeledData: number = 0;
    emptyLabel: boolean = true;
    emptyAnnotation: boolean = true;
    readonly setRegionLengthModal = 'modal-set-region-length-modal';
    readonly setDefaultRegionLengthModal = 'modal-set-default-region-length-modal';
    readonly modalIdProjectStats = 'modal-project-stats';

    adjustRegionLengthBodyStyle: ModalBodyStyle = {
        minHeight: '25vh',
        maxHeight: '25vh',
        minWidth: '27vw',
        maxWidth: '27vw',
        margin: '15vw 71vh',
        overflow: 'none',
    };
    projectStatsBodyStyle: ModalBodyStyle = {
        minHeight: '50vh',
        minWidth: '50vw',
        maxWidth: '50vw',
        margin: '7vw 36vh',
        overflow: 'none',
    };

    @ViewChild('currentTime') currentTime!: ElementRef<HTMLSpanElement>;
    @ViewChild('totalDuration') totalDuration!: ElementRef<HTMLSpanElement>;
    @ViewChild('floatingContainer') floatingContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('inputLabel') inputLabel!: ElementRef<HTMLInputElement>;
    @ViewChild('inputRegionLength') inputRegionLength!: ElementRef<HTMLInputElement>;
    @ViewChild('inputDefaultRegionLength') inputDefaultRegionLength!: ElementRef<HTMLInputElement>;

    constructor(
        private router: Router,
        private cdr: ChangeDetectorRef,
        private dataSetLayoutService: DataSetLayoutService,
        private sanitizer: DomSanitizer,
        private audioLabellingLayoutService: AudioLabellingLayoutService,
        private languageService: LanguageService,
        private _modalService: ModalService,
    ) {}

    ngOnInit() {
        this.projectName = this.audioLabellingLayoutService.getRouteState(history).projectName;
        this.initProject(this.projectName);
        const langsArr: string[] = ['image-labelling-en', 'image-labelling-cn', 'image-labelling-ms'];
        this.languageService.initializeLanguage(`image-labelling`, langsArr);
    }

    initProject(projectName: string) {
        const projectMetaStatus$ = this.dataSetLayoutService.checkProjectStatus(projectName);
        const checkProjectStatus$ = this.dataSetLayoutService.checkExistProjectStatus(projectName);
        const updateProjectLoadStatus$ = this.dataSetLayoutService.updateProjectLoadStatus(projectName);

        this.subscription = this.subject
            .pipe(
                mergeMap(() => forkJoin([projectMetaStatus$])),
                first(([{ message, content }]) => {
                    const is_loaded = content.is_loaded;
                    this.filePath = content.project_file_path;
                    this.getFileNameAndExtension(this.filePath);
                    return message === 1 && !is_loaded;
                }),
                mergeMap(([{ message }]) =>
                    !message ? [] : forkJoin([updateProjectLoadStatus$, checkProjectStatus$]),
                ),
                mergeMap(([{ message: updateProjStatus }, { message, uuid_list, label_list }]) => {
                    if (label_list != null && label_list.length > 0) {
                        this.getLabels(label_list);
                    }
                    return [];
                }),
            )
            .subscribe(
                () => {},
                (error) => console.log(error),
                () => {
                    this.fetchPeaksFromBackend();
                },
            );

        this.subject.next();
    }

    getFileNameAndExtension(path: string) {
        let separater: string;
        let filePathArr: any[];
        let fileName: string;
        const platform = window.navigator.userAgent;
        if (platform.startsWith('Mac') || platform.startsWith('Linux')) {
            separater = '/';
        } else {
            separater = '\\';
        }
        filePathArr = path.split(separater);
        fileName = filePathArr.pop();
        this.audioFileName = fileName ? fileName.split('.')[0] : '';
        this.fileType = fileName ? fileName.split('.').pop() : '';
    }

    getLabels(labelList: string[]) {
        for (const labelName of labelList) {
            this.labels.push({ name: labelName, color: 'rgba(140, 191, 217, 0.4)' });
        }
        this.floatLabels = this.labels;
    }

    adjustLabelsColor(labelName: string, color: string) {
        const labelNames = this.labels.map((ele) => ele.name);
        if (labelNames.includes(labelName)) {
            const isColorTally = this.labels
                .filter((ele) => ele.name === labelName)
                .map((ele) => ele.color === color)[0];

            if (!isColorTally) {
                const index = this.labels.findIndex((ele) => ele.name === labelName);
                this.labels[index].color = color;
            }
        }
    }

    generateRandomUUID = (): string => {
        return uuid();
    };

    fetchPeaksFromBackend() {
        this.audioLabellingLayoutService.getWaveFormPeaks(this.projectName).subscribe(
            (res) => {
                this.peaks = res.wave_form_peaks;
            },
            (error) => {
                console.error('Fail to retrieve peaks from database' + error);
            },
            () => {
                this.generateWaveform();
            },
        );
    }

    generateWaveform(): void {
        this.wave = WaveSurfer.create({
            container: '#waveForm',
            waveColor: '#5F9EA0',
            progressColor: '#5F9EA0',
            barWidth: 2,
            barHeight: 1,
            barRadius: 3,
            barGap: 2,
            height: 231,
            backgroundColor: '#525353',
            normalize: true,
            fillParent: true,
            plugins: [
                TimelinePlugin.create({
                    container: '#waveTimeline',
                    notchPercentHeight: 70,
                    primaryFontColor: 'white',
                    secondaryFontColor: 'white',
                    formatTimecallback: this.formatTimeCallback,
                    timeInterval: this.timeInterval,
                    fontSize: 9,
                    duration: this.wave ? this.wave.getDuration() : 0,
                }),
                CursorPlugin.create({
                    color: 'white',
                    width: '3px',
                    showTime: true,
                    followCursorY: 'true',
                    opacity: '0.8',
                    customShowTimeStyle: {
                        width: '6vw',
                        height: '4vh',
                        'margin-left': '1vw',
                        'font-size': '2vh',
                        'background-color': 'grey',
                        color: '#fff',
                        'text-indent': '1vw',
                        'font-weight': 'bold',
                        'line-height': '4.5vh',
                        'vertical-align': 'center',
                    },
                    hideOnBlur: true,
                    formatTimeCallback: this.formatTime,
                }),
                MinimapPlugin.create({
                    container: '#waveMiniMap',
                }),
                RegionsPlugin.create({
                    regions: [],
                }),
            ],
        });
        const path = this.filePath as string;
        if (path === undefined || path === '') {
            throw new Error('Audio file path is empty or undefined');
        }
        this.wave.load(this.url, this.peaks);
        this.wave.play();

        this.wave.on('ready', () => {
            const waveDivs = document.querySelectorAll('wave');
            const progressWaveDiv = waveDivs.item(1) as HTMLElement;
            const miniMapProgressDiv = waveDivs.item(3) as HTMLElement;
            const playHead = document.createElement('div') as HTMLElement;
            const miniMapPlayHead = document.createElement('div') as HTMLElement;
            const timeIndicator = document.createElement('div') as HTMLElement;
            playHead.id = 'playHead';
            miniMapPlayHead.id = 'miniMapPlayHead';
            timeIndicator.id = 'timeIndicator';

            this.wave.zoom(100);
            this.wave.setWaveColor('#FFB266');
            this.wave.setProgressColor('#FFB266');
            this.totalDuration.nativeElement.innerText = this.formatTime(this.wave.getDuration());

            if (progressWaveDiv && miniMapProgressDiv) {
                progressWaveDiv.style.borderRight = '4px solid rgb(255, 0, 0)';
                miniMapProgressDiv.style.borderRight = '3px solid rgb(255, 255, 255)';
                playHead.className = 'play-head-arrow';
                miniMapPlayHead.className = 'minimap-play-head-arrow';
                timeIndicator.className = 'time-indicator';
                document.getElementById('waveTimeline')?.appendChild(playHead);
                document.getElementById('waveTimeline')?.appendChild(timeIndicator);
                document.getElementById('waveMiniMap')?.appendChild(miniMapPlayHead);
            }
            this.loadRegion();
            this.wave.stop();
            playHead.style.left = -7 + 'px';
            miniMapPlayHead.style.left = -4 + 'px';
        });
        this.detectChangesInRegions();
        this.onRegionParamsUpdating();
    }

    onScroll() {
        this.wave.on('scroll', () => {
            if (!this.isPlaying) {
                this.hidePlayHeadAndTimeIndicatorOnScroll();
            }
        });
    }

    hidePlayHeadAndTimeIndicatorOnScroll() {
        const playHead = document.getElementById('playHead') as HTMLElement;
        const timeIndicator = document.getElementById('timeIndicator') as HTMLElement;
        playHead.style.display = 'none';
        timeIndicator.style.display = 'none';
    }

    loadRegion() {
        this.audioLabellingLayoutService.getRegions(this.projectName).subscribe((response) => {
            if (response.audio_regions !== undefined && response.audio_regions.length > 0) {
                this.regionPropsList = response.audio_regions;
                for (const regionProps of this.regionPropsList) {
                    this.wave.regions.add({
                        id: regionProps.regionId,
                        start: regionProps.startTime,
                        end: regionProps.endTime,
                        loop: regionProps.loop,
                        color: regionProps.labelColor,
                        drag: regionProps.draggable,
                        resize: regionProps.resizable,
                    });
                    this.addCanvasRegionLabel(regionProps.labelName, regionProps.regionId);
                    this.regionIdList.push(regionProps.regionId);
                    this.adjustLabelsColor(regionProps.labelName, regionProps.labelColor);
                }
            }
        });
    }

    formatTime = (duration: number) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(10 * (duration - minutes * 60));
        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(3, '0')}`;
    };

    formatTimeCallback = (seconds: number, pxPerSec: number): string => {
        seconds = Number(seconds);
        const hoursStr = Math.floor(seconds / 3600);
        const minutesStr = Math.floor(seconds / 60);
        seconds = seconds % 60;

        let secondsStr = Math.round(seconds).toString();
        if (pxPerSec >= 25 * 10) {
            secondsStr = seconds.toFixed(2);
        }

        if (pxPerSec >= 25) {
            secondsStr = seconds.toFixed(1);
        }

        if (seconds < 10) {
            secondsStr = '0' + secondsStr;
        }
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
    };

    timeInterval = (pxPerSec: number) => {
        let retval = 1;
        if (pxPerSec >= 25 * 100) {
            retval = 0.01;
        } else if (pxPerSec >= 25 * 40) {
            retval = 0.025;
        } else if (pxPerSec >= 25 * 10) {
            retval = 0.1;
        } else if (pxPerSec >= 25 * 4) {
            retval = 0.25;
        } else if (pxPerSec >= 25) {
            retval = 1;
        } else if (pxPerSec * 5 >= 25) {
            retval = 5;
        } else if (pxPerSec * 15 >= 25) {
            retval = 15;
        } else {
            retval = Math.ceil(0.5 / pxPerSec) * 60;
        }
        return retval;
    };

    primaryLabelInterval = (pxPerSec: number) => {
        let retval: number;
        if (pxPerSec >= 25 * 100) {
            retval = 10;
        } else if (pxPerSec >= 25 * 40) {
            retval = 4;
        } else if (pxPerSec >= 25 * 10) {
            retval = 10;
        } else if (pxPerSec >= 25 * 4) {
            retval = 4;
        } else if (pxPerSec >= 25) {
            retval = 1;
        } else if (pxPerSec * 5 >= 25) {
            retval = 5;
        } else if (pxPerSec * 15 >= 25) {
            retval = 15;
        } else {
            retval = Math.ceil(0.5 / pxPerSec) * 60;
        }
        return retval;
    };

    secondaryLabelInterval = (pxPerSec: number) => {
        return Math.floor(10 / this.timeInterval(pxPerSec));
    };

    playAudio(): void {
        if (!this.isPlaying) {
            this.wave.play();
            this.isPlaying = true;
            this.updateMiniMapRegionColor();
            this.displayRegionIndicator = true;

            this.wave.on('finish', () => {
                const playHead = document.getElementById('playHead');
                const timeIndicator = document.getElementById('timeIndicator');
                this.wave.stop();
                this.isPlaying = false;
                this.wave.seekAndCenter(0);
                this.updateMiniMapRegionIndicator();
                if (playHead && timeIndicator) {
                    playHead.style.left = -7 + 'px';
                    timeIndicator.style.left = 0 + 'px';
                    timeIndicator.innerText = this.formatTime(this.wave.getCurrentTime());
                }
            });

            this.wave.on('audioprocess', () => {
                this.currentTime.nativeElement.innerText = this.formatTime(this.wave.getCurrentTime());
                this.wave.minimap.bindWavesurferEvents();
                this.updateMiniMapRegionIndicator();
                this.updatePlayHeadAndTimeIndicator();
            });
        } else {
            this.isPlaying = false;
            this.wave.playPause();
            this.updatePlayHeadAndTimeIndicator();
            this.updateMiniMapRegionIndicator();
        }
    }

    updatePlayHeadAndTimeIndicatorWhenSeekRegion(event: MouseEvent) {
        const playHead = document.getElementById('playHead') as HTMLElement;
        const timeIndicator = document.getElementById('timeIndicator') as HTMLElement;

        if (playHead.style.display === 'none' && timeIndicator.style.display === 'none') {
            playHead.style.display = 'block';
            timeIndicator.style.display = 'block';
        }

        playHead.style.left = event.pageX - 42 + 'px';
        timeIndicator.style.left = event.pageX - 53 + 'px';
        timeIndicator.innerText = this.formatTime(this.wave.getCurrentTime());
    }

    updatePlayHeadAndTimeIndicator() {
        const waveDivs = document.querySelectorAll('wave').item(0) as HTMLElement;
        const waveProgressDivs = document.querySelectorAll('wave').item(1) as HTMLElement;
        const totalLength = document.querySelectorAll('canvas').item(1).clientWidth;
        const playHead = document.getElementById('playHead') as HTMLElement;
        const timeIndicator = document.getElementById('timeIndicator') as HTMLElement;

        if (playHead.style.display === 'none' && timeIndicator.style.display === 'none') {
            playHead.style.display = 'block';
            timeIndicator.style.display = 'block';
        }

        if (waveProgressDivs.clientWidth <= 0.5 * waveDivs.clientWidth) {
            playHead.style.left = String(waveProgressDivs.clientWidth - 6) + 'px';
            timeIndicator.style.left = String(waveProgressDivs.clientWidth - 16) + 'px';
            timeIndicator.innerText = this.formatTime(this.wave.getCurrentTime());
        } else {
            if (waveDivs.offsetWidth + waveDivs.scrollLeft !== waveDivs.scrollWidth) {
                playHead.style.left = String(0.492 * waveDivs.clientWidth) + 'px';
                timeIndicator.style.left = String(0.484 * waveDivs.clientWidth) + 'px';
                timeIndicator.innerText = this.formatTime(this.wave.getCurrentTime());
            } else {
                const remain = totalLength - waveProgressDivs.clientWidth + 6;
                const ratio = 1 - remain / waveDivs.clientWidth;
                playHead.style.left = String(ratio * waveDivs.clientWidth) + 'px';
                timeIndicator.style.left = String(ratio * (waveDivs.clientWidth - 16)) + 'px';
                timeIndicator.innerText = this.formatTime(this.wave.getCurrentTime());
            }
        }
    }

    updateMiniMapRegionIndicator() {
        const waveCanvas = document.querySelectorAll('wave').item(0);
        const waveProgressWidth = document.querySelectorAll('wave').item(1).clientWidth;
        const miniMapProgressWidth = document.querySelectorAll('wave').item(3).clientWidth;
        const regionIndicator = document.getElementById('regionIndicator');
        const miniMapWidth = this.wave.minimap.getWidth();
        const totalLength = document.querySelectorAll('canvas').item(1).clientWidth;
        const miniMapPlayHead = document.getElementById('miniMapPlayHead');

        if (miniMapPlayHead) {
            miniMapPlayHead.style.left = miniMapProgressWidth - 5 + 'px';
        }

        if (this.regionOffsetRatio === 0) {
            this.regionOffsetRatio = (0.5 * waveCanvas.clientWidth) / totalLength;
        }

        if (regionIndicator) {
            if (waveProgressWidth < 0.5 * waveCanvas.clientWidth) {
                const startPoint = 0;
                const endPoint = this.regionOffsetRatio * miniMapWidth * 2;
                regionIndicator.style.left = startPoint + 'px';
                regionIndicator.style.width = endPoint - startPoint + 'px';
            } else {
                const startPoint = miniMapProgressWidth - this.regionOffsetRatio * miniMapWidth;
                const endPoint = miniMapProgressWidth + this.regionOffsetRatio * miniMapWidth;
                const currentWidth = 0.5 * regionIndicator.clientWidth + miniMapProgressWidth + 5;

                if (Number(currentWidth) <= miniMapWidth) {
                    regionIndicator.style.left = startPoint + 'px';
                    regionIndicator.style.width = endPoint - startPoint + 'px';
                }
            }
        }
    }

    updateMiniMapRegionColor() {
        const minimap = document.getElementById('cloneWave') as HTMLElement;
        if (minimap) {
            this.wave.minimap.drawer.params.progressColor = 'red';
        }
    }

    onClickMiniMap(event: MouseEvent) {
        const miniMapWidth = this.wave.minimap.getWidth();
        const waveCanvasWidth = document.querySelectorAll('wave').item(0).clientWidth;
        const miniMapProgress = document.querySelectorAll('wave').item(3) as HTMLElement;
        const regionIndicator = document.getElementById('regionIndicator');
        const totalLength = document.querySelectorAll('canvas').item(1).clientWidth;
        const miniMapPlayHead = document.getElementById('miniMapPlayHead');

        miniMapProgress.style.width = String(event.pageX - 30) + 'px';
        if (miniMapPlayHead) {
            miniMapPlayHead.style.left = miniMapProgress.clientWidth - 5 + 'px';
        }

        if (regionIndicator) {
            if (this.regionOffsetRatio === 0) {
                this.regionOffsetRatio = (0.5 * waveCanvasWidth) / totalLength;
            }
            const startPoint = miniMapProgress.clientWidth - this.regionOffsetRatio * miniMapWidth;
            const endPoint = miniMapProgress.clientWidth + this.regionOffsetRatio * miniMapWidth;
            const currentWidth = 0.5 * regionIndicator.clientWidth + miniMapProgress.clientWidth + 5;

            if (miniMapProgress.clientWidth < this.regionOffsetRatio * miniMapWidth) {
                regionIndicator.style.left = 0 + 'px';
                regionIndicator.style.width = endPoint - startPoint + 'px';
                this.wave.seekAndCenter(miniMapProgress.clientWidth / miniMapWidth);
                this.updatePlayHeadAndTimeIndicator();
                return;
            } else {
                if (Number(currentWidth) < miniMapWidth) {
                    regionIndicator.style.left = startPoint + 'px';
                    regionIndicator.style.width = endPoint - startPoint + 'px';
                    this.wave.seekAndCenter(miniMapProgress.clientWidth / miniMapWidth);
                    this.updatePlayHeadAndTimeIndicator();
                    return;
                } else {
                    regionIndicator.style.left = miniMapWidth - regionIndicator.clientWidth - 5 + 'px';
                    regionIndicator.style.width = endPoint - startPoint + 'px';
                    this.wave.seekAndCenter(miniMapProgress.clientWidth / miniMapWidth);
                    this.updatePlayHeadAndTimeIndicator();
                    return;
                }
            }
        }
    }

    onHoverMiniMap(event: MouseEvent) {
        const miniMapWidth = this.wave?.minimap.getWidth();
        const adjustedPosition = event.pageX - 32;
        const progress = adjustedPosition / miniMapWidth;
        const miniMapTime = document.getElementById('miniMapTime');
        const regionIndicator = document.getElementById('regionIndicator');

        if (miniMapTime) {
            miniMapTime.style.left = event.pageX + 'px';
            miniMapTime.style.top = event.pageY + 'px';
            miniMapTime.innerText = this.formatTime(progress * this.wave?.getDuration());

            if (adjustedPosition > 100) {
                miniMapTime.style.transform = 'translate(-9vw, -50vh)';
            } else {
                miniMapTime.style.transform = 'translate(0, -50vh)';
            }
        }

        if (regionIndicator) {
            if (this.enableDragRegionIndicator) {
                regionIndicator.style.cursor = 'move';
            } else {
                regionIndicator.style.cursor = 'default';
            }
        }
    }

    closeMiniMapTime() {
        this.displayMiniMapTime = false;
    }

    toggleMiniMapTime() {
        this.displayMiniMapTime = true;
    }

    moveMiniMapRegion() {
        const regionIndicator = document.getElementById('regionIndicator');
        if (regionIndicator) {
            regionIndicator.style.cursor = 'move';
        }
    }

    recordDragPosition(event: DragEvent) {
        this.currentPosition = event.pageX;
        event.dataTransfer?.setDragImage(event.target as Element, window.outerWidth, window.outerHeight);
    }

    onDragRegionIndicator(event: DragEvent) {
        event.preventDefault();
        const regionIndicator = document.getElementById('regionIndicator');
        const miniMapWidth = this.wave.minimap.getWidth();

        if (regionIndicator) {
            const regionRectProp = regionIndicator.getBoundingClientRect();
            const currentPosition = regionRectProp.left + regionIndicator.clientWidth * 0.5;
            const currentProgress = currentPosition / miniMapWidth;
            const diff = event.clientX - event.offsetX;

            if (regionRectProp.left + regionIndicator.clientWidth - 35 >= miniMapWidth) {
                return;
            }

            if (event.pageX > this.currentPosition) {
                this.movingDistance = diff - currentPosition + 'px';
            } else if (event.pageX < this.currentPosition) {
                this.movingDistance = -diff - currentPosition + 'px';
            }

            regionIndicator.style.transform = `translate(${this.movingDistance}, 0)`;
            this.wave.seekAndCenter(currentProgress);
            this.wave.minimap.bindWavesurferEvents();
        }
    }

    changeAudioVolume(event: any) {
        this.wave.setVolume(event.target.value);
        this.audioVolume = (event.target.value * 100).toString() + '%';
    }

    changeAudioPlayRate(event: any) {
        this.wave.setPlaybackRate(event.target.value);
    }

    skipToPreviousFifthSecondRegion() {
        this.wave.skipBackward(3);
        this.currentTime.nativeElement.innerText = this.formatTime(this.wave.getCurrentTime());
        this.updateMiniMapRegionIndicator();
    }

    skipToNextFifthSecondRegion() {
        this.wave.skipForward(3);
        this.currentTime.nativeElement.innerText = this.formatTime(this.wave.getCurrentTime());
        this.updateMiniMapRegionIndicator();
    }

    zoomWave(event: WheelEvent) {
        event.preventDefault();
        this.wave.cursor.hideCursor();
        this.wave.pause();

        const seconds = this.timeToSecond(this.wave.cursor.displayTime.innerText);
        this.progress = seconds / this.wave.getDuration();

        if (event.deltaY < 0) {
            if (this.currentZoomValue === 300) {
                this.currentSearchTime = 0;
                return;
            } else {
                this.currentZoomValue += 5;
                this.wave.zoom(this.currentZoomValue);
                this.wave.seekAndCenter(this.progress);
                this.updateRegionRenderer();
            }
        } else if (event.deltaY > 0) {
            if (this.currentZoomValue === 5) {
                this.currentSearchTime = 0;
                return;
            } else {
                this.currentZoomValue -= 5;
                this.wave.zoom(this.currentZoomValue);
                this.wave.seekAndCenter(this.progress);
                this.updateRegionRenderer();
            }
        }
        this.wave.timeline.render();
        this.updatePlayHeadAndTimeIndicator();
        this.updateMiniMapRegionIndicator();
        this.adjustRegionLabelWidth();
    }

    timeToSecond = (currentTime: string) => {
        const splitCurrentTime = currentTime.split(':');
        const hoursToSeconds = parseInt(splitCurrentTime[0], 10) * 3600;
        const minuteToSeconds = parseInt(splitCurrentTime[1], 10) * 60;
        const seconds = parseInt(splitCurrentTime[2], 10) / 10;
        return hoursToSeconds + minuteToSeconds + seconds;
    };

    updateRegionRenderer() {
        if (this.regionPropsList.length > 0) {
            for (const regionId of this.regionIdList) {
                this.wave.regions.list[regionId].updateRender();
            }
        }
    }

    drawRegion(selectedLabel: label, regionId: string) {
        this.wave.regions.add({
            id: regionId,
            start: this.startTime,
            end: this.endTime,
            loop: false,
            color: selectedLabel.color,
            drag: true,
            resize: true,
        });

        const regionProps: RegionProps = {
            regionId,
            labelName: selectedLabel.name,
            startTime: this.startTime,
            endTime: this.endTime,
            loop: false,
            labelColor: selectedLabel.color,
            draggable: true,
            isPlaying: false,
            resizable: true,
        };

        this.regionPropsList.push(regionProps);
        this.regionIdList.push(regionId);
        this.audioLabellingLayoutService.createRegion(this.projectName, regionProps).subscribe(() => {});
    }

    addCanvasRegionLabel(labelName: string, regionId: string) {
        const regionsDiv = document.querySelectorAll('region');
        const regionWidth = regionsDiv.item(this.currentRegionIndex).clientWidth;
        const labelTag = document.createElement('div') as HTMLElement;
        const labelNameDiv = document.createElement('div') as HTMLElement;
        const labelToggleIcon = document.createElement('img') as HTMLImageElement;

        labelToggleIcon.className = 'label-toggle-icon';
        labelTag.className = 'canvas-label-tag';
        labelNameDiv.className = 'label-tag-name';
        labelToggleIcon.src = this.moreVerticalIcon;

        labelTag.id = this.generateRandomUUID();
        this.labelTagIdMap.set(regionId, labelTag.id);
        labelNameDiv.innerHTML = labelName;
        labelNameDiv.id = this.generateRandomUUID();
        this.labelNameIdMap.set(regionId, labelNameDiv.id);

        labelTag.style.width = String(regionWidth * 0.6) + 'px';
        labelTag.style.whiteSpace = 'nowrap';
        labelTag.appendChild(labelToggleIcon);
        labelTag.appendChild(labelNameDiv);
        regionsDiv.item(this.currentRegionIndex).appendChild(labelTag);
        regionsDiv.item(this.currentRegionIndex).id = regionId;

        labelToggleIcon.addEventListener('click', () => {
            this.disableAnnotation();
            this.wave.cursor.hideCursor();
            this.isCursorShow = false;

            labelNameDiv.style.display = labelNameDiv.style.display === 'block' ? 'none' : 'block';
            if (labelNameDiv.style.display === 'block') {
                labelTag.style.width = labelTag.style.width < 20 + 'px' ? 0 + 'px' : 7 + 'vw';
            } else if (labelNameDiv.style.display === 'none') {
                labelTag.style.width = 20 + 'px';
            }
        });

        labelToggleIcon.addEventListener('mouseenter', () => {
            this.wave.unAll();
            this.wave.regions.disableDragSelection();
        });

        labelToggleIcon.addEventListener('mouseleave', () => {
            this.detectChangesInRegions();
            this.onRegionParamsUpdating();
        });
        this.detectChangesInRegions();
        this.adjustRegionLabelWidth();
        this.currentRegionIndex++;
    }

    adjustRegionLabelWidth() {
        const regionIdList = this.regionPropsList.map((ele) => ele.regionId);
        for (const regionId of regionIdList) {
            const region = document.getElementById(regionId);
            const labelTagId = this.labelTagIdMap.get(regionId);
            const labelNameId = this.labelNameIdMap.get(regionId);

            if (labelTagId && labelNameId && region) {
                const labelTagDiv = document.getElementById(labelTagId);
                const labelNameDiv = document.getElementById(labelNameId);

                if (labelTagDiv && labelNameDiv) {
                    if (region.clientWidth > 100) {
                        labelNameDiv.style.display = 'block';
                        labelTagDiv.style.display = 'block';
                        labelTagDiv.style.width = 0.6 * parseFloat(region.style.width) + 'px';
                    } else if (region.clientWidth < labelTagDiv.clientWidth) {
                        labelNameDiv.style.display = 'none';
                        labelTagDiv.style.display = 'none';
                    } else if (region.clientWidth >= 30) {
                        labelNameDiv.style.display = 'none';
                        labelTagDiv.style.display = 'block';
                        labelTagDiv.style.width = 20 + 'px';
                    }
                }
            }
        }
    }

    onClickRegion(event: MouseEvent) {
        this.wave.on('seek', () => {
            this.displayRegionIndicator = true;
            this.updatePlayHeadAndTimeIndicatorWhenSeekRegion(event);
            this.updateMiniMapRegionIndicator();
        });

        this.wave.on('region-click', (ele) => {
            if (this.allowSelectRegion) {
                this.collectDeleteId(ele.id);
                this.collectSelectedRegions(ele.id);
                if (ele.id !== this.selectedRegion) {
                    this.selectedRegion = ele.id;
                    this.wave.regions.list[ele.id].element.style.backgroundColor = this.changeBackgroundColor(ele.id);
                } else {
                    this.wave.regions.list[ele.id].element.style.backgroundColor = this.changeBackgroundColor(ele.id);
                }
            }
        });

        if (this.isAllowLabel && this.labels.length > 0) {
            this.wave.on('seek', () => {
                this.annotateAtSelectedTime(event);
            });
        }
    }

    annotateAtSelectedTime(event: MouseEvent) {
        this.updateMiniMapRegionIndicator();
        const currentTime = this.wave.getCurrentTime();

        if (this.startTime !== 0 && this.endTime === 0) {
            this.endTime = parseFloat(currentTime.toFixed(6));
            if (this.endTime <= this.startTime) {
                alert('End time must higher than start time');
                return;
            }
            this.isAdjustTempRegion = false;
            this.hasSetStartTime = false;
            this.toggleFloatingContainer(event);
            this.wave.unAll();
            this.detectChangesInRegions();
            this.onRegionParamsUpdating();
        } else if (this.startTime === 0 && this.endTime === 0) {
            this.startTime = parseFloat(currentTime.toFixed(6));
            this.hasSetStartTime = true;
            this.createTempRegion(event.pageX);
        }
    }

    toggleFloatingContainer(event: MouseEvent) {
        const waveCanvas = document.querySelectorAll('wave').item(0);

        if (this.labels.length === 0) {
            return;
        }

        if (this.isAllowLabel && waveCanvas) {
            this.floatingContainer.nativeElement.style.display = 'block';
            this.floatingContainer.nativeElement.style.top = event.pageY + 'px';

            if (event.pageX <= waveCanvas.clientWidth * 0.8) {
                this.floatingContainer.nativeElement.style.left = event.pageX + 50 + 'px';
            } else {
                this.floatingContainer.nativeElement.style.left = event.pageX - 350 + 'px';
            }
        }
    }

    closeFloatingContainer() {
        this.removeTempRegion();
        this.floatingContainer.nativeElement.style.display = 'none';
    }

    selectLabel(index: number) {
        const regionId = this.generateRandomUUID();
        this.removeTempRegion();
        this.selectedLabel = this.labels[index];
        this.drawRegion(this.labels[index], regionId);
        this.addCanvasRegionLabel(this.labels[index].name, regionId);
        this.floatLabels = this.labels;
        this.updateRegionRenderer();
        this.startTime = 0;
        this.endTime = 0;
        this.closeFloatingContainer();
    }

    searchLabel(event: any) {
        this.floatLabels = this.labels.filter((ele) => (ele.name = event.target.value));
    }

    createTempRegion(currentPosition: number) {
        const tempRegion = document.createElement('div');
        const waveDivs = document.getElementById('waveForm');

        tempRegion.id = 'tempRegion';
        tempRegion.style.backgroundColor = 'rgba(140, 191, 217, 0.4)';
        tempRegion.style.color = 'white';
        tempRegion.style.fontSize = '1.5vh';
        tempRegion.style.left = currentPosition - 30 + 'px';
        tempRegion.style.top = 0 + 'px';
        tempRegion.style.zIndex = '3';
        tempRegion.style.position = 'absolute';
        tempRegion.style.width = 0 + 'px';
        tempRegion.style.borderLeft = '2px solid black';

        if (waveDivs && this.isAllowLabel) {
            tempRegion.style.height = waveDivs.clientHeight + 'px';
            waveDivs.appendChild(tempRegion);
            this.isAdjustTempRegion = true;
        }
    }

    adjustingTempRegion(event: MouseEvent) {
        const tempRegion = document.getElementById('tempRegion');
        if (tempRegion && this.isAdjustTempRegion) {
            tempRegion.style.width = event.pageX - parseInt(tempRegion.style.left, 10) - 35 + 'px';
            tempRegion.style.borderRight = '2px solid black';
        }
    }

    removeTempRegion() {
        document.getElementById('tempRegion')?.remove();
    }

    changeBackgroundColor = (id: string) => {
        return this.wave.regions.list[id].element.style.backgroundColor === 'rgba(140, 191, 217, 0.4)'
            ? 'rgba(151, 123, 234, 0.4)'
            : 'rgba(140, 191, 217, 0.4)';
    };

    onPlayClickRegion() {
        this.wave.on('region-dblclick', (ele) => {
            if (this.wave.regions.list[ele.id].loop === false) {
                this.wave.regions.list[ele.id].setLoop(true);
            } else {
                this.wave.regions.list[ele.id].setLoop(false);
            }
            this.wave.regions.list[ele.id].play();
            this.wave.on('audioprocess', () => {
                this.formatTime(this.wave.getCurrentTime());
            });
        });

        this.detectChangesInRegions();
    }

    detectChangesInRegions() {
        this.wave.on('region-update-end', (event) => {
            const filteredRegion = this.regionPropsList.filter((ele) => ele.regionId === event.id)[0];
            const regionIndex = this.regionPropsList.findIndex((ele) => ele.regionId === event.id);
            const selectedRegion = this.wave.regions.list[event.id];
            const region: RegionProps = {
                regionId: selectedRegion.id,
                labelName: filteredRegion.labelName,
                startTime: selectedRegion.start,
                endTime: selectedRegion.end,
                loop: selectedRegion.loop,
                labelColor: selectedRegion.color,
                draggable: selectedRegion.drag,
                isPlaying: filteredRegion.isPlaying,
                resizable: selectedRegion.resize,
            };
            this.regionPropsList.splice(regionIndex, 1, region);
            this.audioLabellingLayoutService.updateRegion(this.projectName, region).subscribe(() => {});
        });
    }

    onRegionParamsUpdating() {
        this.wave.on('region-updated', (ele) => {
            // const region = this.regionPropsList.filter(region => region.regionId = ele.id)[0];
            this.adjustRegionLabelWidth();
            // this.adjustRegionDisplayTime(ele.start, ele.end, region);
        });
    }

    playRegionAudio(region: any, index: number): void {
        if (!region.isPlaying) {
            this.regionPropsList[index].isPlaying = true;
            this.wave.regions.list[region.regionId].play();
            this.updatePlayHeadAndTimeIndicator();
            this.updateMiniMapRegionIndicator();
            return;
        } else if (region.isPlaying) {
            this.regionPropsList[index].isPlaying = false;
            this.wave.pause();
            return;
        }
    }

    loopRegionAudio(regionId: string) {
        if (!this.wave.regions.list[regionId].loop) {
            this.wave.regions.list[regionId].setLoop(true);
        } else {
            this.wave.regions.list[regionId].setLoop(false);
        }
    }

    removeRegion(regionId: string) {
        this.regionIdList = this.regionIdList.filter((id) => id !== regionId);
        this.regionPropsList = this.regionPropsList.filter((ele) => ele.regionId !== regionId);
        this.wave.regions.list[regionId].remove();
        this.audioLabellingLayoutService.deleteRegion(this.projectName, regionId).subscribe(() => {});
        this.currentRegionIndex = this.currentRegionIndex === 0 ? 0 : this.currentRegionIndex - 1;
    }

    seekToRegion(regionId: string) {
        this.wave.seekAndCenter(this.wave.regions.list[regionId].start / this.wave.getDuration());
        this.updateMiniMapRegionIndicator();
        this.updatePlayHeadAndTimeIndicator();
    }

    getRegionId(regionId: string) {
        this.selectedRegionId = regionId;
    }

    toggleAdjustRegionLength() {
        this._modalService.open(this.setRegionLengthModal);
    }

    onInputRegionLength(event: any) {
        this.setRegionLength(Number(event.target.value));
        this.inputRegionLength.nativeElement.value = '';
    }

    setRegionLength(value: number) {
        const startTime = this.wave.regions.list[this.selectedRegionId].start;
        this.updateRegionLengthParam = { end: startTime + value, resize: false };
    }

    updateRegionLength() {
        this.wave.regions.list[this.selectedRegionId].update(this.updateRegionLengthParam);
        const index = this.regionPropsList.findIndex((ele) => ele.regionId === this.selectedRegionId);
        this.regionPropsList[index].endTime = this.updateRegionLengthParam.end;
        this.regionPropsList[index].resizable = this.updateRegionLengthParam.resize;
        this.audioLabellingLayoutService
            .updateRegion(this.projectName, this.regionPropsList[index])
            .subscribe(() => {});
    }

    removeFixedRegionLength() {
        this.wave.regions.list[this.selectedRegionId].update({ resize: true });
        const index = this.regionPropsList.findIndex((ele) => ele.regionId === this.selectedRegionId);
        this.regionPropsList[index].resizable = true;
        this.audioLabellingLayoutService
            .updateRegion(this.projectName, this.regionPropsList[index])
            .subscribe(() => {});
    }

    onSetRegionLength() {
        this.updateRegionLength();
        this.updateRegionLengthParam = {};
        this._modalService.close(this.setRegionLengthModal);
    }

    onRemoveFixedRegionLengthSettings() {
        this.removeFixedRegionLength();
        this._modalService.close(this.setRegionLengthModal);
    }

    regionLength() {
        if (this.selectedRegionId !== '') {
            const startTime = this.wave.regions.list[this.selectedRegionId].start;
            const endTime = this.wave.regions.list[this.selectedRegionId].end;
            const currentTimeGap = endTime - startTime;
            return currentTimeGap.toFixed(3) + ' s';
        }
    }

    lockRegion(region: RegionProps) {
        const draggable = !region.draggable;
        const id = region.regionId;
        const index = this.regionPropsList.findIndex((region) => region.regionId === id);
        this.wave.regions.list[id].update({ drag: draggable });
        this.regionPropsList[index].draggable = draggable;
    }

    getSanitizedUrl(url: string) {
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    collectSelectedRegions(regionId: string) {
        const currentWaveRegion = this.wave.regions.list[regionId];

        const region = {
            id: regionId,
            start: currentWaveRegion.start,
            end: currentWaveRegion.end,
            loop: currentWaveRegion.loop,
            color: currentWaveRegion.element.style.backgroundColor,
        };

        if (!this.selectedRegionsList.map((ele) => ele.id === regionId)) {
            this.selectedRegionsList.push(region);
        } else {
            this.selectedRegionsList = this.selectedRegionsList.filter((ele) => ele.id !== regionId);
        }
    }

    removeAllRegions() {
        this.wave.regions.clear();
        this.wave.markers.clear();
        this.regionIdList.splice(0, this.regionIdList.length);
        this.regionPropsList.splice(0, this.regionPropsList.length);
    }

    createLabel(event: any) {
        const newLabelName = event.target.value;
        const isExist = this.labels.some((label) => label.name === newLabelName);

        if (isExist) {
            alert('Label is already exists');
            this.inputLabel.nativeElement.value = '';
            return;
        }
        this.labels.push({ name: newLabelName, color: 'rgba(140, 191, 217, 0.4)' });
        this.floatLabels = this.labels;
        this.inputLabel.nativeElement.value = '';
        this.updateLabel();
    }

    removeLabel(deleteLabel: label) {
        this.labels = this.labels.filter((ele) => ele !== deleteLabel);
        this.updateLabel();
    }

    updateLabel() {
        const labelList = this.labels.map((label) => label.name);
        this.dataSetLayoutService.updateLabelList(this.projectName, labelList).subscribe(() => {});
    }

    selectColor(event: any) {
        const selectColor = this.convertHexToRGBA(event.target.value, 30);
        this.labels[this.labelIndex].color = selectColor;
        const regions = this.regionPropsList.filter((ele) => ele.labelName === this.labels[this.labelIndex].name);
        if (regions) {
            for (const region of regions) {
                this.regionPropsList
                    .filter((ele) => ele.labelName === region.labelName)
                    .forEach((ele) => (ele.labelColor = selectColor));
                this.wave.regions.list[region.regionId].update({ color: this.labels[this.labelIndex].color });
                this.audioLabellingLayoutService.updateRegion(this.projectName, region).subscribe(() => {});
            }
        }
    }

    convertHexToRGBA = (hexCode: string, opacity = 1) => {
        let hex = hexCode.replace('#', '');

        if (hex.length === 3) {
            hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        if (opacity > 1 && opacity <= 100) {
            opacity = opacity / 100;
        }

        return `rgba(${r},${g},${b},${opacity})`;
    };

    getIndex(index: number) {
        this.labelIndex = index;
    }

    saveAnnotationFile() {
        this.audioLabellingLayoutService.exportAudioAnnotationFile(this.projectName).subscribe((response) => {
            if (response.message === 1) {
                let separator: string;
                const platform = window.navigator.userAgent;
                if (platform.startsWith('Mac') || platform.startsWith('Linux')) {
                    separator = '/';
                } else {
                    separator = '\\';
                }
                const splitPath = this.filePath?.split(separator);
                splitPath?.pop();
                const projectPath = splitPath?.join(separator);
                alert(
                    'Annotation output file ' +
                        this.projectName +
                        '_annotation.txt is generated in project folder: \n' +
                        projectPath,
                );
            } else if (response.message === 0) {
                alert(response.error_message);
            }
        });
    }

    undo() {
        this.tempCollectionOfDeletedRegionsIndex--;
        for (const region of this.tempCollectionOfDeletedRegions.splice(this.tempCollectionOfDeletedRegionsIndex)[0]) {
            this.wave.regions.add({
                id: region.id,
                start: region.start,
                end: region.end,
                loop: region.loop,
                color: region.color,
            });
        }
    }

    redo() {
        this.tempCollectionOfDeletedRegionsIndex++;
        for (const region of this.tempCollectionOfDeletedRegions.splice(this.tempCollectionOfDeletedRegionsIndex)[0]) {
            this.wave.regions.list[region.id].remove();
        }
    }

    collectDeleteId(regionId: string) {
        if (!this.selectedDeleteIds.has(regionId)) {
            this.selectedDeleteIds.add(regionId);
        } else {
            this.selectedDeleteIds.delete(regionId);
        }
    }

    disableAnnotation() {
        this.removeTempRegion();
        this.isAllowLabel = false;
        this.closeFloatingContainer();
        this.startTime = 0;
        this.endTime = 0;
        this.wave.unAll();
        this.detectChangesInRegions();
        this.onRegionParamsUpdating();
    }

    onInputDefaultRegionLength(event: any) {
        this.defaultRegionLength = Number(event.target.value);
        this.inputDefaultRegionLength.nativeElement.value = '';
    }

    onSetDefaultRegionLength() {
        this._modalService.open(this.setDefaultRegionLengthModal);
    }

    setDefaultRegionLength() {
        for (const region of this.regionPropsList) {
            this.selectedRegionId = region.regionId;
            this.setRegionLength(this.defaultRegionLength);
            this.updateRegionLength();
        }
        this.selectedRegionId = '';
        this._modalService.close(this.setDefaultRegionLengthModal);
    }

    removeDefaultRegionLength() {
        for (const region of this.regionPropsList) {
            this.selectedRegionId = region.regionId;
            this.removeFixedRegionLength();
        }
        this.selectedRegionId = '';
        this.defaultRegionLength = 0;
        this._modalService.close(this.setDefaultRegionLengthModal);
    }

    lockAllRegions(isLock: boolean) {
        for (const region of this.regionPropsList) {
            if (isLock) {
                if (!region.draggable) {
                    this.wave.regions.list[region.regionId].update({ drag: true });
                    region.draggable = true;
                }
            } else {
                if (region.draggable) {
                    this.wave.regions.list[region.regionId].update({ drag: false });
                    region.draggable = false;
                }
            }
        }
    }

    currentDefaultRegionLength() {
        return this.defaultRegionLength + ' s';
    }

    projectStatistics() {
        this.dataSetLayoutService.getProjectStats(this.projectName).subscribe((response) => {
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
                this._modalService.open(this.modalIdProjectStats);
            }
        });
    }

    @HostListener('window:keydown', ['$event'])
    keyDownEvent(event: KeyboardEvent) {
        switch (event.code) {
            case 'Delete':
                const listOfRegion: Region[] = [];
                for (const regionId of this.selectedDeleteIds) {
                    listOfRegion.push(this.wave.regions.list[regionId]);
                    this.removeRegion(regionId);
                }
                this.tempCollectionOfDeletedRegions.push(listOfRegion);
                this.selectedDeleteIds.clear();
                break;
            case 'Space':
                (document.activeElement as HTMLElement).blur();
                this.playAudio();
                break;
            case 'Escape':
                this.disableAnnotation();
                break;
        }

        switch (event.key) {
            case 'Control':
                this.allowSelectRegion = true;
                break;
        }

        if (event.ctrlKey && event.key === 'a') {
            event.preventDefault();
            this.isAllowLabel = !this.isAllowLabel;
        }

        if (event.ctrlKey && event.key === 'z') {
            event.preventDefault();
            if (this.tempCollectionOfDeletedRegions.length !== 0) {
                this.undo();
            }
        }

        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            if (this.tempCollectionOfDeletedRegions.length !== 0) {
                this.redo();
            }
        }

        if (event.ctrlKey && event.key === 'q') {
            event.preventDefault();
            this.isCursorShow = !this.isCursorShow;
            if (!this.isCursorShow) {
                this.wave.cursor.showCursor();
            } else {
                this.wave.cursor.hideCursor();
            }
        }

        if (event.ctrlKey && event.key === 'x') {
            this.displayMiniMapTime = !this.displayMiniMapTime;
        }

        if (event.altKey && event.key === 'x') {
            this.enableDragRegionIndicator = !this.enableDragRegionIndicator;
        }
    }

    @HostListener('window:keyup', ['$event'])
    keyUpEvent(event: KeyboardEvent) {
        switch (event.key) {
            case 'Control':
                this.allowSelectRegion = false;
                break;
        }
    }

    resetProjectStatus = (projectName = this.projectName) => {
        projectName.trim() &&
            this.dataSetLayoutService
                .manualCloseProject(projectName)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(({ message }) => {
                    this.router.navigate(['/']);
                });
    };

    ngOnDestroy() {
        this.wave?.destroy();
        this.resetProjectStatus();
    }
}
