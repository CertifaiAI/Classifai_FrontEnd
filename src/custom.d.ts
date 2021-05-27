/**
 * @license
 * Use of this source code is governed by Apache License 2.0 that can be
 * found in the LICENSE file at https://github.com/CertifaiAI/Classifai_FrontEnd/blob/main/LICENSE
 */

// allow type system to whitelist .svg extension during import
declare module '*.svg' {
    const content: any;
    export default content;
}
