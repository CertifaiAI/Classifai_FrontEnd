/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

import { Injectable } from '@angular/core';

enum VideoToFramesMethod {
    fps,
    totalFrames,
}

@Injectable({
    providedIn: 'root',
})
export class VideoFrameExtractionService {
    constructor() {}

    /**
     * Extracts frames from the video and returns them as an array of imageData
     * @param videoUrl url to the video file (html5 compatible format) eg: mp4
     * @param amount number of frames per second or total number of frames that you want to extract
     * @param type [fps, totalFrames] The method of extracting frames: Number of frames per second of video or
     * the total number of frames acros the whole video duration. defaults to fps
     */
    public static getFrames(videoUrl: string, amount: number, type: VideoToFramesMethod): Promise<ImageData[]> {
        return new Promise((resolve: (frames: ImageData[]) => void, reject: (error: string) => void) => {
            const frames: ImageData[] = [];
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const context: CanvasRenderingContext2D = (canvas.getContext('2d') as unknown) as CanvasRenderingContext2D;
            let duration: number;

            const video = document.createElement('video');
            video.preload = 'auto';
            const that = this;
            video.addEventListener('loadeddata', async () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                duration = video.duration;

                let totalFrames: number = amount;
                if (type === VideoToFramesMethod.fps) {
                    totalFrames = duration * amount;
                }
                for (let time = 0; time < duration; time += duration / totalFrames) {
                    frames.push(await that.getVideoFrame(video, context, time));
                }
                resolve(frames);
            });
            video.src = videoUrl;
            video.load();
        });
    }

    private static getVideoFrame(
        video: HTMLVideoElement,
        context: CanvasRenderingContext2D,
        time: number,
    ): Promise<ImageData> {
        return new Promise((resolve: (frame: ImageData) => void, reject: (error: string) => void) => {
            const eventCallback = () => {
                video.removeEventListener('seeked', eventCallback);
                this.storeFrame(video, context, resolve);
            };
            video.addEventListener('seeked', eventCallback);
            video.currentTime = time;
        });
    }

    private static storeFrame(
        video: HTMLVideoElement,
        context: CanvasRenderingContext2D,
        resolve: (frame: ImageData) => void,
    ) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        resolve(context.getImageData(0, 0, video.videoWidth, video.videoHeight));
    }
}
