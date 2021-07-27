import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
    providedIn: 'root',
})
export class FrameExtractionService {
    constructor() {}

    videoToFrame = async (fps: number) => {
        const bolbList = [];
        const videoSrc = '';

        const ffmpeg = createFFmpeg({
            // corePath: '',
            log: true,
            logger: (options) => console.log('logger: ', options),
            progress: (options) => console.log('progress: ', options),
        });

        if (videoSrc) {
            await ffmpeg.load();
            const video = videoSrc;
            if (video) {
                ffmpeg.FS('writeFile', `in_%02d.mp4`, await fetchFile(video));

                /**
                 * !! for -qscale:v flag
                 * https://stackoverflow.com/questions/10225403/how-can-i-extract-a-good-quality-jpeg-image-from-a-video-file-with-ffmpeg
                 **/
                // await ffmpeg.run('-i', `in_%02d.mp4`, '-qscale:v', '2', '-vf', 'fps=1', `out_%03d.jpg`);
                await ffmpeg.run(
                    '-i',
                    `in_%02d.mp4`,
                    '-qscale:v',
                    '2',
                    // '-vf',
                    // 'fps=1',
                    // '-frame_pts',
                    // 'true',
                    '-vf',
                    `fps=${fps}`,
                    `out_%03d.jpg`,
                    // '>',
                    // 'log.txt',
                );
                // setMessage('Complete decoding');

                for (let m = 1; ; m++) {
                    try {
                        const indexCount = String(m).padStart(3, '0');
                        const data = ffmpeg.FS('readFile', `out_${indexCount}.jpg`);
                        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/jpg' }));
                        ffmpeg.FS('unlink', `out_${indexCount}.jpg`);
                        bolbList.push({
                            frameURL: url,
                        });
                    } catch (e) {
                        // exit the loop
                        break;
                    }
                }
                return bolbList;
            }
        }
    };
}
