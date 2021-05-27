/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { first } from 'rxjs/operators';
import { ImageLabellingApiService } from 'src/components/image-labelling/image-labelling-api.service';
import { Injectable } from '@angular/core';
import {
    PolyMetadata,
    BboxMetadata,
    ChangeAnnotationLabel,
    CompleteMetadata,
    EventEmitter_Action,
    TabsProps,
} from '../../components/image-labelling/image-labelling.model';

type CustomHistory = Omit<History, 'state'> & {
    state: { thumbnailList: (BboxMetadata & PolyMetadata)[]; labelList: string[]; projectName: string };
};

type LabelRegion = {
    mainLabelRegion: string;
    subLabelRegion: string;
};

type AnnotationIndex = {
    selectedAnnoIndex: number;
    selectedSubLabelIndex: number;
};

@Injectable({
    providedIn: 'any',
})
export class ImageLabellingLayoutService {
    constructor(private _imgLblApiService: ImageLabellingApiService) {}

    getRouteState = (history: CustomHistory) => {
        const { state } = history;
        return { ...state };
    };

    displayLabelList = <T>(tabs: TabsProps<T>[], newLabelList: string[]) => {
        return tabs.map((tab) =>
            tab.label_list
                ? {
                      ...tab,
                      label_list: newLabelList,
                  }
                : tab,
        );
    };

    calculateIndex = (
        thumbnailAction: Required<Omit<EventEmitter_Action, 'thumbnailAction'>>,
        currImageIndex: number,
        thumbnailListLength: number,
    ) => {
        let calIndex = currImageIndex;
        const finalIndex =
            thumbnailAction === 1
                ? calIndex >= thumbnailListLength - 1
                    ? thumbnailListLength - 1
                    : (calIndex += 1)
                : calIndex <= 0
                ? 0
                : (currImageIndex -= 1);

        return finalIndex;
    };

    checkAnnotationMetadataProp = ({ bnd_box, polygons }: CompleteMetadata) => {
        // null assertion used due to guarantee either one of the prop exists
        // tslint:disable-next-line: no-non-null-assertion
        return (bnd_box ?? polygons)!;
    };

    changeAnnotationLabel = (tabs: TabsProps<CompleteMetadata>[], { label, index }: ChangeAnnotationLabel) => {
        return tabs.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map(({ bnd_box, polygons, ...metadata }) => {
                          return {
                              ...metadata,
                              bnd_box: bnd_box?.map((box, i) =>
                                  i === index
                                      ? {
                                            ...box,
                                            label,
                                        }
                                      : box,
                              ),
                              polygons: polygons?.map((poly, i) =>
                                  i === index
                                      ? {
                                            ...poly,
                                            label,
                                        }
                                      : poly,
                              ),
                          };
                      }),
                  }
                : tab,
        );
    };

    deleteAnnotation = (tabs: TabsProps<CompleteMetadata>[], index: number) => {
        return tabs.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map(({ bnd_box, polygons, ...metadata }) => {
                          return {
                              ...metadata,
                              bnd_box: bnd_box?.filter((_, i) => i !== index),
                              polygons: polygons?.filter((_, i) => i !== index),
                          };
                      }),
                  }
                : tab,
        );
    };

    submitLabel = (
        tabs: TabsProps<CompleteMetadata>[],
        value: string,
        currentAnnoIndex: number,
        { mainLabelRegion, subLabelRegion }: LabelRegion,
    ) => {
        return tabs.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map(({ bnd_box, polygons, ...metadata }) => {
                          return {
                              ...metadata,
                              bnd_box: bnd_box?.map((bb, i) => {
                                  return i === currentAnnoIndex
                                      ? {
                                            ...bb,
                                            region: mainLabelRegion,
                                            subLabel:
                                                bb.subLabel && bb.subLabel.length > 0
                                                    ? [...bb.subLabel, { label: value, region: subLabelRegion }]
                                                    : [{ label: value, region: subLabelRegion }],
                                        }
                                      : bb;
                              }),
                              polygons: polygons?.map((poly, i) => {
                                  return i === currentAnnoIndex
                                      ? {
                                            ...poly,
                                            region: mainLabelRegion,
                                            subLabel:
                                                poly.subLabel && poly.subLabel.length > 0
                                                    ? [...poly.subLabel, { label: value, region: subLabelRegion }]
                                                    : [{ label: value, region: subLabelRegion }],
                                        }
                                      : poly;
                              }),
                          };
                      }),
                  }
                : tab,
        );
    };

    removeSubLabel = (
        tabs: TabsProps<CompleteMetadata>[],
        { selectedAnnoIndex, selectedSubLabelIndex }: AnnotationIndex,
    ) => {
        return tabs.map((tab) =>
            tab.annotation
                ? {
                      ...tab,
                      annotation: tab.annotation.map(({ bnd_box, polygons, ...metadata }) => {
                          return {
                              ...metadata,
                              bnd_box: bnd_box?.map((bb, bbIndex) => {
                                  return bbIndex === selectedAnnoIndex
                                      ? {
                                            ...bb,
                                            subLabel: bb.subLabel?.filter((_, i) => i !== selectedSubLabelIndex),
                                        }
                                      : bb;
                              }),
                              polygons: polygons?.map((poly, polyIndex) => {
                                  return polyIndex === selectedAnnoIndex
                                      ? {
                                            ...poly,
                                            subLabel: poly.subLabel?.filter((_, i) => i !== selectedSubLabelIndex),
                                        }
                                      : poly;
                              }),
                          };
                      }),
                  }
                : tab,
        );
    };

    setLocalStorageProjectProgress = (projectName: string, annotation: CompleteMetadata[]) => {
        // this.checkIfBboxMetaType(annotation)
        //     ? localStorage.setItem(`${projectName}_bndbox`, JSON.stringify({ cache: annotation }))
        //     : localStorage.setItem(`${projectName}_seg`, JSON.stringify({ cache: annotation }));

        localStorage.setItem(
            `${projectName}_${this._imgLblApiService.imageLabellingMode}`,
            JSON.stringify({ cache: annotation }),
        );
    };

    getLocalStorageProjectProgress = <T extends CompleteMetadata>(projectName: string) => {
        const result = localStorage.getItem(`${projectName}_${this._imgLblApiService.imageLabellingMode}`);
        const jsonResult: T | null = result ? JSON.parse(result) : null;
        return jsonResult;
    };

    updateProjectProgress = (tabs: TabsProps<CompleteMetadata>[], projectName: string) => {
        tabs.forEach(({ annotation }) => {
            annotation
                ? (this.setLocalStorageProjectProgress(projectName, annotation),
                  annotation?.forEach((metadata) => {
                      this._imgLblApiService
                          .updateProjectProgress(projectName, metadata.uuid, metadata)
                          .pipe(first())
                          .subscribe(({ error_code, message }) => {});
                  }))
                : null;
        });
    };
}
