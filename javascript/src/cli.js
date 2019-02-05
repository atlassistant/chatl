#!/usr/bin/env node

const pkg = require('./../package.json');
const fs = require('fs');
const program = require('commander');
const chatl = require('./index');

program
  .version(pkg.version)
  .arguments('<trainingFile> [optionsFile]')
  .option('-a, --adapter <name>', 'Name of the adapter to use')
  .action((trainingFile, optionsFile) => {
    const inputData = fs.readFileSync(trainingFile, 'utf8');
    let options = null;

    if (optionsFile) {
      options = fs.readFileSync(optionsFile, 'utf8');
    }

    let result = chatl.parse(inputData);

    if (program.adapter) {
      result = chatl.adapters[program.adapter](result, options);
    }

    console.log(chatl.toJSON(result));
  })
  .parse(process.argv);
