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
    // https://github.com/foliojs/pdfkit/issues/265 straight brain rot
    let writeStream = fs.createWriteStream("output.pdf");

    doc.pipe(writeStream);

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

    if (keyWord) {
      doc.moveDown();
      doc.font("Times-Roman").fontSize(15).text("Key words:", {
        underline: true,
      });
      doc.font("Times-Roman").fontSize(15).list(result.key_words);
    }

    //Finalize PDF file
    doc.end();
    console.log("PDF Created");

    writeStream.on("finish", function () {
      // do stuff with the PDF file
      const pdfFilePath = "output.pdf";
      // Read the entire file into memory
      fs.readFile(pdfFilePath, (err, data) => {
        if (err) {
          console.error("Error reading PDF file:", err);
          res.status(500).send("Internal Server Error");
        } else {
          // Set the appropriate headers for a PDF file
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", "attachment; filename=example.pdf");

          // Add cache control headers to prevent caching
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");

          // Send the file data as the response
          res.send(data);

          fs.unlink("output.pdf", () => {});
          fs.unlink("./dataset/" + req.file.originalname, () => {});
        }
      });
    });
    // // Assuming the PDF file is stored locally in a folder named 'pdfs'
    // const pdfFilePath = "output.pdf";

    // // Set the appropriate headers for a PDF file
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", "attachment; filename=example.pdf");

    // // Add cache control headers to prevent caching
    // res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    // res.setHeader("Pragma", "no-cache");
    // res.setHeader("Expires", "0");
    // // Create a read stream to send the file contents to the response
    // const fileStream = fs.createReadStream(pdfFilePath);
    // console.log(fileStream);

    // var stat = fs.statSync("output.pdf");
    // console.log(stat);
    // // Error handling for the file stream
    // fileStream.on("error", (error) => {
    //   console.error("Error reading PDF file:", error);
    //   res.status(500).send("Internal Server Error");
    // });

    // // Pipe the file stream to the response
    // fileStream.pipe(res);
    // // Close the file stream when the response is finished
    // fileStream.on("close", () => {
    //   res.end();
    // });
  });
};
