#!/usr/bin/env node

const pkg = require('./../package.json');
const fs = require('fs');
const program = require('commander');
const chatl = require('./index');

program
  .version(pkg.version)
  .arguments('<trainingFile> [optionsFile]')
  .option('-g, --generator <name>', 'Name of the generator to use')
  .action((trainingFile, optionsFile) => {
    const inputData = fs.readFileSync(trainingFile, 'utf8');

    let generator = null;
    let options = null;

    if (program.generator) {
      generator = chatl.generators[program.generator];
    }

    if (optionsFile) {
      options = fs.readFileSync(optionsFile, 'utf8');
    }

    console.log(JSON.stringify(chatl.parse(inputData, generator, options), null, 2));
  })
  .parse(process.argv);
