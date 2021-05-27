/**
 * @license
 * Copyright 2020-2021 CertifAI Sdn. Bhd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AfterViewInit, Directive, ElementRef, HostBinding, Input } from '@angular/core';

@Directive({
    selector: 'img[imgLazyLoad]',
})
export class LazyLoadImgDirective implements AfterViewInit {
    // stop the image from loading immediately with the use of @HostBinding()
    // As long as srcAttr is set to null, the image will not attempt to load
    // also expose the src @Input() property to capture the reference to the intended image’s source.
    // (set hostbinding property to input property)
    @HostBinding('attr.src') srcAttr: string | null = null;
    @Input() src!: string;

    constructor(private el: ElementRef) {}

    ngAfterViewInit(): void {
        this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage();
    }

    private canLazyLoad = (): boolean => {
        return window && 'IntersectionObserver' in window;
    };

    // The Intersection Observer API lets code register a callback function
    // that is executed whenever an element they wish to monitor enters or exits another element (or the viewport).
    // The Intersection Observer constructor takes two arguments.
    // First argument is a callback function that will be called when the image enters or leaves the viewport.

    // The second argument, is an options object that lets you control the circumstances under which the observer’s callback is invoked.
    // chose not to pass the options as second argument to Intersection Observer constructor,
    // because the defaults work very well enough.
    private lazyLoadImage = (): void => {
        const obs = new IntersectionObserver((entries) => {
            // Inside the callback function, check if image isIntersecting with current viewport.
            // If it is, we load the image else unload the image.
            entries.forEach(({ isIntersecting }) => {
                // console.log(isIntersecting);
                isIntersecting ? this.loadImage() : this.unloadImage();
            });
        });
        // To kick off observing process, call observe method on observer instance with reference to image element,
        // that the img[imgLazyLoad] directive is attached to.
        obs.observe(this.el.nativeElement);
    };

    /** @function responsible to load the image, must set the srcAttr to the value stored in the src property. */
    private loadImage = (): void => {
        this.srcAttr = this.src;
    };

    /** @function responsible to unload the image, must set the srcAttr to empty string. */
    private unloadImage = (): void => {
        this.srcAttr = '';
    };
}
