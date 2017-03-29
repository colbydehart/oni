// BuildSetupTemplate.js
//
// Helper script to insert template variables into the setup template

const path = require("path")
const fs = require("fs")

const _ = require("lodash")
const shelljs = require("shelljs")

const sourceFile = path.join(__dirname, "setup.template.iss")
const destFile = path.join(__dirname, "..", "dist", "setup.iss")

shelljs.rm(destFile)

shelljs.cp(sourceFile, destFile)

const packageJsonContents = fs.readFileSync(path.join(__dirname, "..", "package.json"))
const packageMeta = JSON.parse(packageJsonContents)
const version = packageMeta.version

// Replace template variables

const valuesToReplace = {
    "AppName": "Oni",
    "AppExecutableName": "oni.exe",
    "AppSetupExecutableName": `Oni_Setup_Windows_${version}_x86`,
    "Version": version,
    "SourcePath": path.join(__dirname, "..", "dist", "win-ia32-unpacked", "*"),
    "WizardImageFilePath": path.join(__dirname, "..", "images", "setup", "Oni_128.bmp"),
    "WizardSmallImageFilePath": path.join(__dirname, "..", "images", "setup", "Oni_64.bmp")
}

_.keys(valuesToReplace).forEach((key) => {
    shelljs.sed("-i", "{{" + key + "}}", valuesToReplace[key], destFile)
})
