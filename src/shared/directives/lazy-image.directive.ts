/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
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
