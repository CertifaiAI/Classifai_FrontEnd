# Classifai_FrontEnd

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.0.

Source code of Classifai with compiled front-end can be found in [here](https://github.com/CertifaiAI/classifai).

## SPA communicate with RestAPI
Sample to refer: [Diagram - Concept](https://drive.google.com/file/d/1xDNitESxmUsZibmf3eKJ88bUmTY-oGqh/view?usp=sharing)

## Component Design
Sample to refer: [Diagram - Component Design](https://drive.google.com/file/d/1xg-k3xfLo-S6JSjKmyhTeh8bzBbEKezm/view)

## Development server

Option 1 (Auto) Preferred:
1) Ensure backend API is running, then open project.
2) Look for the bottom left side 'NPM SCRIPTS' tab.
3) If the package.json is collapsed, expand it by clicking it
4) Lastly, click on 'start', located just below package.json
5) NPM will starts to execute your project with `custom scripts`

Option 2 (Manual):
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Option 1 (Auto) Preferred:
1) Install extension 'Angular Files'.
2) After installed, right click your project src folder
3) Look for the 'Generate' labelled section (Generate Component, Generate Directive and etc)

Option 2 (Manual):\
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build Production

Default backend endpoint is `http://localhost:9999`. Please navigate to `src/environments/environment.prod.ts` and change the endpoint is necessary.

Option 1 (Auto) Preferred:
1) Ensure backend API is running, then open project.
2) Look for the bottom left side 'NPM SCRIPTS' tab.
3) If the package.json is collapsed, expand it by clicking it
4) Lastly, click on 'build:normal', located just below package.json
5) NPM will starts to build your project with `custom scripts & configurations`

Option 2 (Manual):\
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Analyze Project Bundle Sizes

1) Open project.
2) Look for the bottom left side 'NPM SCRIPTS' tab.
3) If the package.json is collapsed, expand it by clicking it
4) Lastly, click on 'build:analyze', located just below package.json
5) NPM will first build your project with `custom scripts & configurations`
6) After that NPM will execute webpack to use a new port to display your whole project bundle into UI on your browser

## Audit Local Production Application's Score via Google LightHouse

1) Ensure backend API is running, then open project.
2) Look for the bottom left side 'NPM SCRIPTS' tab.
3) If the package.json is collapsed, expand it by clicking it
4) Lastly, click on 'build:lighthouse-audit', located just below package.json
5) NPM will serve a production version of your app
6) Then go figure on optimizing / enhancing your app via Google Lighthouse analysis report

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
