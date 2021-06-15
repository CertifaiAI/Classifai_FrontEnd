# Classifai_FrontEnd

Source code of Classifai with compiled front-end can be found [here](https://github.com/CertifaiAI/classifai).

## Component Design

Refer: [Diagram - Component Design Concept](https://drive.google.com/file/d/1xg-k3xfLo-S6JSjKmyhTeh8bzBbEKezm/view)

## Code Scaffolding

1) Install extension 'Angular Files'.
2) After installed, right click your project src folder
3) Look for the 'Generate' labelled section (Generate Component, Generate Directive and etc)

## Change Development or Production Environment url

Default backend endpoint for development is `http://localhost:4200`.\
Please navigate to `src/environments/environment.ts` and change the endpoint as necessary.

Default backend endpoint for production is `http://localhost:9999`.\
Please navigate to `src/environments/environment.prod.ts` and change the endpoint as necessary.

## Execute for Development

1) Ensure backend is running, then open project.
2) Look for the bottom left side 'NPM SCRIPTS' tab.
3) If the package.json is collapsed, expand it by clicking it
4) Lastly, click on 'start:dev', located just below package.json

## Build Production

1) After open project.
2) Look for the bottom left side 'NPM SCRIPTS' tab.
3) If the package.json is collapsed, expand it by clicking it
4) Click on 'build:normal', located just below package.json
5) The build artifacts will be stored in the `dist/` directory.

## Analyze Project Bundle Size

1) After open project.
2) Look for the bottom left side 'NPM SCRIPTS' tab.
3) If the package.json is collapsed, expand it by clicking it
4) Click on 'build:analyze', located just below package.json
6) After that a browser tab will be opened to display the whole project bundles

## Convert to Web App
1) Remove "target: 'electron-renderer'" in webpack.config.js
2) Remove title bar in app.component.html and app.component.ts

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
