
const clear = require('clear');

clear();

const boxen = require('boxen')
require('colors')

console.log(boxen(`${'XgeneCloud'.green.bold} \n\nServer dependencies installed successfully\n\nPlease run \n\n${'$ npm run dev'.bold.green}`, {
  padding: 1,
  margin: 1,
  borderStyle: 'round',
  borderColor: 'green',
  align:'center'
}));
