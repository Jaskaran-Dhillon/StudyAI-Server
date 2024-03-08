const sequelize = require("../util/database");
const User = require("../models/user");
const { isBlank } = require("../util/helper");
const { trim, escape } = require("validator");
const spawn = require("child_process").spawn;
const fs = require('fs');

const sanitizeRequest = (request) => {
  let { action, fileType, file, instruction } = request;
  const sanitizedUser = {
    action: escape(trim(action || "")),
    fileType: escape(trim(fileType|| "")),
    file: escape(trim(file || "")),
    instruction: escape(trim(instruction || "")),
  };

  return sanitizedUser;
};
// action = create overall summary or summarize the input into notes
// extension = pdf, text document, transcript (vtt)
// file = data
// instruction = inst to append onto the python script

exports.summarize = async (req, res) => {
  // console.log(req);
  // console.log(req.body);
  console.log(req.file);

  await fs.readFile(req.file.path, function(err1, data){

    if(err1) throw err;

      fs.writeFile("./dataset/" + req.file.originalname, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
  });
  // const body = sanitizeRequest(req.body);
  // console.log(body);
  //check what kind of request it is

  //in correct section, call the script, pass in the input file, extension, and instruction as needed
  
  let fileType = "pdf";
  let verbosity = 0;
  let summary = "true";
  let bullet = "true";
  let keyWord = "true";
  // const ls = spawn("python", ["./scripts/test_ai_pdf.py", req.file.originalname, fileType, verbosity, summary, bullet, keyWord ]);

  // let output = {};
  // let bufferArray = [];
  // ls.stdout.on("data", (data) => {
  //   // output = data;
  //   // console.log(`stdout: ${data}`);
  //   // console.log(data.stdout);
  //   // console.log(data.title)
  //   // console.log(`output: ${output}`)
  //   // console.log(typeof data);
  //   // console.log(data.toString())
  //   // console.log(eval(data.toString()))
  //   bufferArray.push(data);
  //   // res.status(200).json({
  //   //   status: "OK",
  //   //   result: JSON.stringify(data)
  //   //  });
  // });

  

  // ls.stderr.on("data", (data) => {
  //   console.log(`stderr: ${data}`);
  // });

  // ls.on("close", (code) => {
  //   console.log(`child process exited with code ${code}`);
  //   let dataBuffer = Buffer.concat(bufferArray);
  //   console.log(JSON.parse(dataBuffer.toString()))
  //   res.status(200).json({
  //     status: "OK",
  //     data: dataBuffer.toString()
  //    });
  // });

  res.status(200).json({
      status: "OK",
      data: req.file
  });
  //once summarized, store the file into the files table (or just store it in local storage if out of time)

  //return file with 200

  //handle error
};
