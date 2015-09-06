### WK-Charts-2.0

Build with Typescript, d3, JSPM.

Before you start:
- install JSPM: 

    npm install jspm -g
	
- install TSD to get typescript definitions: 

    npm install tsd -g
	
- install a local file server. I am using my live-server fork for development: 

    npm install willidad/live-server -g
	
- install dependencies:

    jspm install 
	
- install typescript definition files:
	
	tsd update --save
	
- run server (launches default browser at port 8080): 

    live-server 
	
- to build, run tsc (the typescript compiler). If you are using VSCode as editor, enter `shift-ctrl b` to start the build process. 
This will start tsc in watch mode, so the code will be re-compiled and re-loaded every time you save a change
	
have fun




