/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

/** @type responsible for getting type system for event.target.value */
export type HTMLElementEvent<T extends HTMLElement> = Event & {
    target: T;
    // probably you might want to add the currentTarget as well
    // currentTarget: T;
};
