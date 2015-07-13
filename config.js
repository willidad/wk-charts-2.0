System.config({
  "baseURL": "/",
  "defaultJSExtensions": true,
  "transpiler": "typescript",
  "paths": {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },
  "packages": {
    "app": {
      "defaultExtension": "ts",
      "meta": {
        "*.ts": {
          "loader": "ts" 
        }
      }
    }
  },
  typescriptOptions: {
    "noImplicitAny": true
  }
});

System.config({
  "map": {
    "d3": "npm:d3@3.5.6",
    "lodash": "npm:lodash@3.10.0",
    "ts": "github:frankwallis/plugin-typescript@2.0.1",
    "typescript": "github:mhegazy/typescript@v1.5-beta2",
    "github:frankwallis/plugin-typescript@2.0.1": {
      "typescript": "github:mhegazy/typescript@v1.5-beta2"
    },
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "npm:lodash@3.10.0": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    }
  }
});

