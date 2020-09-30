import { AfterViewInit, Directive, ElementRef, HostBinding, Input } from '@angular/core';

@Directive({
    selector: 'img[imgLazyLoad]',
})
export class LazyLoadImgDirective implements AfterViewInit {
    // set hostbinding property to input property
    @HostBinding('attr.src') srcAttr: any = null;
    @Input() src!: string;

    constructor(private el: ElementRef) {}

    ngAfterViewInit(): void {
        this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage();
    }

    private canLazyLoad = (): boolean => {
        return window && 'IntersectionObserver' in window;
    };

    private lazyLoadImage = (): void => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(({ isIntersecting }) => {
                isIntersecting ? (this.loadImage(), obs.unobserve(this.el.nativeElement)) : null;
            });
        });
        obs.observe(this.el.nativeElement);
    };

    private loadImage = (): void => {
        this.srcAttr = this.src;
    };
}
