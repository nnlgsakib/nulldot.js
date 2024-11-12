"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nulldot_js_1 = require("nulldot.js");
var encryptor = new nulldot_js_1.NulldotEncryptor();
var secretKey = 'mySecretKey';
var originalData = "Hello World!";
// Encrypt the data
var encryptedData = encryptor.dataToNulldot(originalData, secretKey);
console.log("Encrypted Data:", encryptedData);
// Decrypt the data
var decryptedData = encryptor.nulldotToData(encryptedData, secretKey);
console.log("Decrypted Data:", decryptedData);
