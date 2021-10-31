// import { Component, OnInit } from '@angular/core';
// import { FrameExtractionService } from '../video-frame-extraction.service';
// import { Router } from '@angular/router';
//
// @Component({
//     selector: 'app-video-upload',
//     templateUrl: './video-upload.component.html',
//     styleUrls: ['./video-upload.component.scss'],
// })
// export class VideoUploadComponent implements OnInit {
//     videoSrc: File | null = null;
//     statusText: string = '';
//
//     constructor(private frameExtractionService: FrameExtractionService, private router: Router) {}
//
//     ngOnInit() {}
//
//     doDecode = async () => {
//         if (this.videoSrc) {
//             const status = this.frameExtractionService.videoToFrame(this.videoSrc, 10);
//             if (await status) {
//                 this.statusText = 'done';
//             }
//         }
//     };
//
//     onRedirect = () => {
//         this.router.navigateByUrl('/videolbl/bndbox');
//     };
//
//     handleFileInput(event: any) {
//         // if (!event.target.files) return;
//         this.videoSrc = event.target.files.item(0);
//     }
// }
