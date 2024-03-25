const spawn = require("child_process").spawn;
const fs = require("fs");
const PDFDocument = require("pdfkit");

const sanitizeRequest = (request) => {
  let { summary, bullet, verbosity, keyWord } = request;
  const sanitizedUser = {
    verbosity: Number.parseInt(verbosity),
    summary: summary === "true",
    bullet: bullet === "true",
    keyWord: keyWord === "true",
  };

  return sanitizedUser;
};

exports.summarize = async (req, res) => {
  let body = req.body;
  try {
    await fs.readFile(req.file.path, function (err1, data) {
      if (err1) throw err;

      fs.writeFile("./dataset/" + req.file.originalname, data, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
    });

    let { summary, bullet, verbosity, keyWord } = sanitizeRequest(body);
    console.log(summary, bullet, verbosity, keyWord);
    const ls = spawn("python", [
      "./scripts/main.py",
      "./dataset/" + req.file.originalname,
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

      // Create a PDF document
      const doc = new PDFDocument();
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

        let keyWordArr = Object.keys(result.key_words).map((v) => {
          return v + " = " + result.key_words[v];
        });

        doc.font("Times-Roman").fontSize(15).list(keyWordArr);
      }

      //Finalize PDF file
      doc.end();

      writeStream.on("finish", function () {
        console.log("PDF Created");

        // do stuff with the PDF file
        const pdfFilePath = "output.pdf";
        // Read the entire file into memory
        fs.readFile(pdfFilePath, (err, data) => {
          if (err) {
            console.error("Error reading PDF file:", err);
            res.status(500).send("Failed to create PDF");
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
            console.log("File deleted");
          }
        });
      });
    });
  } catch (e) {
    res.status(500).send("Internal server error");
  }
};
