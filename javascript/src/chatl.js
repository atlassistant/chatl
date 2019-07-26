#!/usr/bin/env node

const pkg = require('./../package.json');
const fs = require('fs');
const program = require('commander');
const chatl = require('./index');
const utils = require('./utils');

program
  .version(pkg.version)
  .arguments('<files...>')
  .option('-a, --adapter <name>', 'Name of the adapter to use')
  .option('-m --merge <mergeFile>', 'Options file to merge with the final result')
  .action((files) => {
    let options = {};

    if (program.merge) {
      options = JSON.parse(fs.readFileSync(program.merge, 'utf8'));
    }

    let result = files.reduce((r, file) => {
      const input = fs.readFileSync(file, 'utf8');

      return chatl.merge(r, chatl.parse(input));
    }, {});

    if (program.adapter) {
      result = chatl.adapters[program.adapter](result, options);
    }

    console.log(utils.toJSON(result));
  })
  .parse(process.argv);
