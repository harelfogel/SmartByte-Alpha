import {  switchAcState } from '../controllers/sensibo.js';
import fs from 'fs';
import readline from 'readline';

export const testFn = () => {
    console.log("Yovel test")
}

const readFunctionFileAndExectue = () => {
    const file = readline.createInterface({
        input: fs.createReadStream('../SmartByte-Interpreter/functions.txt'),
        output: process.stdout,
        terminal: false
    });
    
    file.on('line', (line) => {
        if (line == "Turn On The AC") {
            switchAcState(true);          // turn the AC on
         }
    });
}

/**
 * @param {string} tempVal The string
 */
const  activePythonScript = (localScriptPath, paramaters, interpreterDir, pythonFileName, currDir) => {
    const PythonShell = require('python-shell').PythonShell;

    var options = {
        mode: 'text',
        pythonPath: process.env.PYTHON_PATH,
        pythonOptions: ['-u'],
        scriptPath: localScriptPath,
        args: paramaters
    };

    process.chdir(interpreterDir);

    PythonShell.run(pythonFileName, options, function (err, results) {
        try {
            if (err)
                throw err;
            console.log('Changed temp value');
        } catch (err) {
            console.log(err);
        }
    });

    process.chdir(currDir)
}

export const startInterval = () => {
    let i=0;
    setInterval(async()=>{
        i++;
        // const temperature = await getTemperature();
        const temperature = "5000";
        activePythonScript(process.env.PATH_TO_Interpreter_DIR,["temperature", temperature],
        "../SmartByte-Interpreter","setValueBySensor.py","../SmartByte-POC-server");
        activePythonScript(process.env.PATH_TO_Interpreter_DIR,['RUN("examp.txt")'],
        "../SmartByte-Interpreter","shell.py","../SmartByte-POC-server");
        readFunctionFileAndExectue();
        clearFunctionTextFile()
    },1000);
}

const clearFunctionTextFile = () => {
    fs.truncate('../SmartByte-Interpreter/functions.txt', 0, function(){console.log('done')});
}

