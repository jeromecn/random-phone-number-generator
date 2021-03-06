import fs from 'fs-extra';
import path from 'path';

import { generateNumbersForFile, removeFile, generateFile } from '../helpers/phonenumberUtils';
import NumberValidator from '../validators/number.validator';


const filePath = path.join(__dirname, '../../public/text.txt');

export const generatePhonenumbers = (req, res) => {
  const { numberOfPhonenumbers } = req.body;
  const { order } = req.query;
  const amountOfNumbers = parseInt(numberOfPhonenumbers);

  let inputNumber = new NumberValidator(amountOfNumbers);

  if (!inputNumber.IsNumber()) {
    return res.status(400).json({ status: 'error', message: 'Please enter a valid number' });
  }

  if (inputNumber.isGreaterThanMaximum(process.env.MAX_VALUE)) {
    return res.status(422)
      .json({ status: 'error', message: `Input Value canot be greater than ${process.env.MAX_VALUE}` });
  }


  if (inputNumber.isLessThanMinimum(process.env.MIN_VALUE)) {
    return res.status(422)
      .json({ status: 'error', message: `Input Value canot be less than ${process.env.MIN_VALUE}` });
  }


  removeFile(filePath, res);

  const stringToBeRead = generateNumbersForFile(amountOfNumbers, order);

  generateFile(filePath, stringToBeRead.sortedPhonenumbers, res);

  return res.status(201).json({
    status: 'success',
    message: 'File Generated Successfully',
    data: stringToBeRead,
  });
};


export const downloadPhonenumbers = (req, res) => {
  const file = path.join(filePath);

  if (!fs.existsSync(file)) {
    return res.status(404).send({ status: 'error', message: 'File does not exist, please generate the file' });
  }
  res.download(filePath, (err) => {
    if (err) {
      return res.status(err.statusCode).send({ status: 'error', message: 'Something went wrong with the download' });
    }
  });
};


export const getPhonenumbersInfo = (req, res) => {
  let fileContents = [];

  if (!fs.existsSync(filePath)) {
    return res.status(404).send({ status: 'error', message: 'File does not exist, please generate the file' });
  }

  fs.readFile(filePath, 'utf8', async(err, data) => {
    if (err) res.status(500).send({ status: 'error', message: err.message });
    fileContents = await data.split('\n');
    const sortedfileContents = fileContents.sort();

    return res.status(200).json({
      status: 'success',
      response: {
        largestNumber: sortedfileContents[ sortedfileContents.length - 1 ],
        smallestNumber: sortedfileContents[ 0 ],
        numberOfPhonenumbers: sortedfileContents.length,
      }
    });
  });
};
