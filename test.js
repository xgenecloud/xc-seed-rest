const ora = require('ora')
// spinner.prefixText = '';]
const clear = require('clear');
clear();

var exec = require('child_process').exec;
var spinner;

function execute(command) {
  return new Promise((resolve, reject) => {
    try {
      // const child_proc = exec(command, function (error, stdout, stderr) {
      //   if (stderr) return reject(stderr);
      //   resolve(stdout);
      // });
      //
      // child_proc.stdout.on('data', (data) => {
      //   console.log(`${data}`);
      // });
      const { spawn } = require('child_process');
      const ls = spawn('npm' , ['install']);

      ls.stdout.on('data', (data) => {
       spinner.text += (`stdout: ${data}`);
      });

      ls.stderr.on('data', (data) => {
        spinner.text+=(`stderr: ${data}`);
      });

      ls.on('close', (code) => {
        resolve(code);
      });



    } catch (e) {
      reject(e)
    }
  })
}

let count = 0;

function showBanner(spinner) {
  // spinner.text = 'progress ' + ++count


  const boxen = require('boxen')
  require('colors')


  spinner.text ='Executing \n' + boxen(`Progress ${++count}`.bold.green, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
    align:'center'
  })
}


(async function () {

  const commands = [
    'npm i '
  ]

  for (let cmd of commands) {

     spinner = ora({text: 'Executing ' + cmd, spinner: 'dots2', color: 'green'}).start();

    // const interval = setInterval(() => showBanner(spinner), 1000);
    try {

      const out = await execute(cmd);
      // const out = shell.exec(cmd);

      spinner.succeed(spinner.text);
      // console.log(out)
    } catch (e) {
      spinner.succeed(spinner.text);
      // console.log(e)
    }
    // clearInterval(interval)

  }

})().catch(e => {
  // console.log(e);
  throw e
})


