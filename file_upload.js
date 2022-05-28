var Busboy = require("busboy");
var path = require("path");
var fs = require("fs");
var sha1 = require("sha1");

// Gets a filename extension.
function getExtension(filename) {
return filename.split(".").pop();
}

// Test if a file is valid based on its extension and mime type.
function isFileValid(filename, mimetype) {
var allowedExts = ["mp4", "webm", "ogg"];
var allowedMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

// Get file extension.
var extension = getExtension(filename);

return allowedExts.indexOf(extension.toLowerCase()) != -1  &&
allowedMimeTypes.indexOf(mimetype) != -1;
}

function upload (req, callback) {
// The route on which the file is saved.
var fileRoute = "/uploads/";

// Server side file path on which the file is saved.
var saveToPath = null;

// Flag to tell if a stream had an error.
var hadStreamError = null;

// Used for sending response.
var link = null;

// Stream error handler.
function handleStreamError(error) {
// Do not enter twice in here.
if (hadStreamError) {
return;
}

hadStreamError = error;

// Cleanup: delete the saved path.
if (saveToPath) {
return fs.unlink(saveToPath, function (err) {
return callback(error);
});
}

return callback(error);
}

// Instantiate Busboy.
try {
var busboy = new Busboy({ headers: req.headers });
} catch(e) {
return callback(e);
}

// Handle file arrival.
busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
// Check fieldname:
if ("file" != fieldname) {
// Stop receiving from this stream.
file.resume();
return callback("Fieldname is not correct. It must be " + file + ".");
}

// Generate link.
var randomName = sha1(new Date().getTime()) + "." + getExtension(filename);
link = fileRoute + randomName;

// Generate path where the file will be saved.
var appDir = path.dirname(require.main.filename);
saveToPath = path.join(appDir, link);

// Pipe reader stream (file from client) into writer stream (file from disk).
file.on("error", handleStreamError);

// Create stream writer to save to file to disk.
var diskWriterStream = fs.createWriteStream(saveToPath);
diskWriterStream.on("error", handleStreamError);

// Validate file after it is successfully saved to disk.
diskWriterStream.on("finish", function() {
// Check if file is valid
var status = isFileValid(saveToPath, mimetype);

if (!status) {
return handleStreamError("File does not meet the validation.");
}

return callback(null, {link: link});
});

// Save file to disk.
file.pipe(diskWriterStream);
});

// Handle file upload termination.
busboy.on("error", handleStreamError);
req.on("error", handleStreamError);

// Pipe reader stream into writer stream.
return req.pipe(busboy);
}

module.exports = upload;