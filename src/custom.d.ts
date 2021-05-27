// allow type system to whitelist .svg extension during import
declare module '*.svg' {
    const content: any;
    export default content;
}
