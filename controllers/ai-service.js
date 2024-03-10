const sequelize = require("../util/database");
const User = require("../models/user");
const { isBlank } = require("../util/helper");
const { trim, escape } = require("validator");
const spawn = require("child_process").spawn;
const fs = require("fs");
const PDFDocument = require("pdfkit");

// const sanitizeRequest = (request) => {
//   let { action, fileType, file, instruction } = request;
//   const sanitizedUser = {
//     action: escape(trim(action || "")),
//     fileType: escape(trim(fileType || "")),
//     file: escape(trim(file || "")),
//     instruction: escape(trim(instruction || "")),
//   };

//   return sanitizedUser;
// };

exports.summarize = async (req, res) => {
  // console.log(req.body);
  // console.log(req.file);
  let body = req.body;
  await fs.readFile(req.file.path, function (err1, data) {
    if (err1) throw err;

    fs.writeFile("./dataset/" + req.file.originalname, data, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  });
  // const body = sanitizeRequest(req.body);
  // console.log(body);

  let fileType = body.fileType;
  let verbosity = Number.parseInt(body.verbosity);
  let summary = body.summary;
  let bullet = body.bullet;
  let keyWord = body.keyWord;

  const ls = spawn("python", [
    "./scripts/main.py",
    req.file.originalname,
    fileType,
    verbosity,
    summary,
    bullet,
    keyWord,
  ]);

  let bufferArray = [];

  ls.stdout.on("data", (data) => {
    bufferArray.push(data);
  });

  ls.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  ls.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
    let dataBuffer = Buffer.concat(bufferArray);

    let result = JSON.parse(dataBuffer.toString());
    console.log(result);

    // Create a document
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream("output.pdf"));

    // Formatting the PDF
    doc.font("Times-Bold").fontSize(20).text(result.title, {
      align: "center",
    });

    if (summary) {
      doc.moveDown();
      doc.font("Times-Roman").fontSize(15).text("Summary:", {
        underline: true,
      });
      doc.font("Times-Roman").fontSize(15).text(result.summary);
    }

    if (bullet) {
      doc.moveDown();
      doc.font("Times-Roman").fontSize(15).text("Key notes:", {
        underline: true,
      });
      doc.font("Times-Roman").fontSize(15).list(result.main_points);
    }

    // if (keyWord) {
    // doc.moveDown();
    //   doc.font("Times-Roman").fontSize(15).text("Key words:", {
    //     underline: true,
    //   });
    //   doc.font("Times-Roman").fontSize(15).text(result.key_words);
    // }

    // Finalize PDF file
    doc.end();
    console.log("PDF Created");

    var file = fs.createReadStream("output.pdf");
    var stat = fs.statSync("output.pdf");
    res.setHeader("Content-Length", stat.size);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
    file.pipe(res);
    // res.status(200).json({
    //   status: "OK",
    //   data: dataBuffer.toString(),
    // });

    //TODO: delete input and output file here
  });

  // res.status(200).json({
  //     status: "OK",
  //     data: req.file
  // });
  //once summarized, store the file into the files table (or just store it in local storage if out of time)

  //return file with 200

  //handle error
};
