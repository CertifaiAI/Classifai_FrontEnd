import { Component, OnInit } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { FrameExtractionService } from '../video-frame-extraction.service';

// enum VideoToFramesMethod {
//     fps,
//     totalFrames,
// }

@Component({
    selector: 'app-video-test',
    templateUrl: './video-test.component.html',
    styleUrls: ['./video-test.component.scss'],
})
export class VideoTestComponent implements OnInit {
    constructor(private frameExtractionService: FrameExtractionService) {}
    videoSrc: File | null = null;
    bolbList: string[] = [];
    stdout: string = '';
    stderr: string = '';

    ffmpeg = createFFmpeg({
        log: true,
        logger: (options) => console.log('logger: ', options),
        progress: (options) => console.log('progress: ', options),
    });

    ngOnInit() {}

    // frameExtraction = () => {
    //     this.frameExtractionService
    //         .getFrames('./../../assets/demoVideo.mp4', 30, VideoToFramesMethod.totalFrames)
    //         .then((frames) => {
    //             frames.forEach((frame: ImageData) => {
    //                 console.log(frame);
    //                 // let canvas = document.createElement('canvas');
    //                 // canvas.width = frame.width;
    //                 // canvas.height = frame.height;
    //                 // canvas.getContext('2d').putImageData(frame, 0, 0);
    //                 // document.getElementsByTagName('body')[0].appendChild(canvas);
    //             });
    //         });
    // };

    doDecode = async () => {
        if (this.videoSrc) {
            await this.ffmpeg.load();
            const video = this.videoSrc;
            if (video) {
                this.ffmpeg.FS('writeFile', `in_%02d.mp4`, await fetchFile(video));

                /**
                 * !! for -qscale:v flag
                 * https://stackoverflow.com/questions/10225403/how-can-i-extract-a-good-quality-jpeg-image-from-a-video-file-with-ffmpeg
                 **/
                // await ffmpeg.run('-i', `in_%02d.mp4`, '-qscale:v', '2', '-vf', 'fps=1', `out_%03d.jpg`);
                await this.ffmpeg.run(
                    '-i',
                    `in_%02d.mp4`,
                    '-qscale:v',
                    '2',
                    // '-vf',
                    // 'fps=1',
                    // '-frame_pts',
                    // 'true',
                    '-vf',
                    'fps=10',
                    `out_%03d.jpg`,
                    // '>',
                    // 'log.txt',
                );
                // setMessage('Complete decoding');

                for (let m = 1; ; m++) {
                    try {
                        const indexCount = String(m).padStart(3, '0');
                        const data = this.ffmpeg.FS('readFile', `out_${indexCount}.jpg`);
                        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/jpg' }));
                        this.ffmpeg.FS('unlink', `out_${indexCount}.jpg`);
                        this.bolbList.push(url);
                    } catch (e) {
                        // exit the loop
                        break;
                    }
                }
            }
        }
    };

    handleFileInput(event: any) {
        // if (!event.target.files) return;
        this.videoSrc = event.target.files.item(0);
    }
}
