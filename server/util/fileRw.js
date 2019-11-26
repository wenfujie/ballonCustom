const fs = require('fs');
const path = require('path');

const readFile = function(fileName) {
  let filePath = path.resolve(__dirname, '../data') + '/' + fileName;
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const writeFile = function(fileName, data) {
  let filePath = path.resolve(__dirname, '../data/') + '/' + fileName;
  return new Promise(function(resolve, reject) {
    fs.writeFile(filePath, data, err => {
      if (err) return reject(error);
      resolve('写入成功!');
    });
  });
};
module.exports = {
  readFile: readFile,
  writeFile: writeFile
};
