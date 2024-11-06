# Nulldot.js - Advanced Symmetric Encryption Library

**Nulldot.js** is a unique, quantum-prime-driven symmetric encryption library designed to protect sensitive information with an adaptable and innovative approach. Developed by [NLG Sakib](https://github.com/nnlgsakib), this library introduces advanced encryption techniques and customizable operators, making it both powerful and versatile for various secure data requirements.

## About the Developer: NLG Sakib

NLG Sakib is a developer specializing in cryptographic solutions, blockchain, and decentralized systems. Known for his expertise in blockchain and cybersecurity, Sakib has built several innovative encryption tools, including Nulldot.js, designed to provide enhanced data protection for modern security needs. Sakib's work is marked by a focus on novel mathematical applications, including quantum prime-based encryption and secure lattice transformations, which power the unique structure of Nulldot.js.

## Overview of Nulldot.js

Nulldot.js uses symmetric encryption, where the same key is required for both encryption and decryption. It leverages quantum primes, lattice constants, and optimized bit rotation functions to transform data securely, offering a powerful alternative to traditional encryption methods.

### Key Features

- **Symmetric Key Encryption**: Data can be encrypted and decrypted with the same key, ensuring simplicity and efficiency.
- **Quantum Prime Transformations**: Employs a series of quantum primes and lattice constants for a high level of encryption security.
- **Customizable Encoding**: Users can define custom operators (`NULL`, `DOT`) and delimiters (`CHAR_DELIMITER`, `WORD_DELIMITER`), allowing unique encrypted outputs.
- **Optimized for Efficiency**: Uses precomputed masks and rotation functions for high-performance encryption.

## Installation

Install Nulldot.js with npm:

```bash
npm install nulldot.js
```

For additional details, refer to the [Nulldot.js npm page](https://www.npmjs.com/package/nulldot.js).

## Getting Started

Here's how to use Nulldot.js with default settings or customized operators to encrypt and decrypt data.

### Basic Usage

```typescript
import { NulldotEncryptor } from 'nulldot.js';

// Initialize with default settings
const encryptor = new NulldotEncryptor();

const secretData = "Classified Information";
const key = "encryptionKey";

// Encrypt data
const encryptedData = encryptor.dataToNulldot(secretData, key);
console.log("Encrypted Data:", encryptedData);

// Decrypt data
const decryptedData = encryptor.nulldotToData(encryptedData, key);
console.log("Decrypted Data:", decryptedData);
```

### Constructor Parameters

The `NulldotEncryptor` constructor allows you to customize the encryption by setting unique operators and delimiters.

| Parameter         | Description                                      | Default |
|-------------------|--------------------------------------------------|---------|
| `NULL`            | Represents binary '0'                            | `,`     |
| `DOT`             | Represents binary '1'                            | `.`     |
| `CHAR_DELIMITER`  | Character-level separator                        | `_`     |
| `WORD_DELIMITER`  | Word-level separator                             | `__`    |

### Custom Operators and Delimiters

This example demonstrates how to initialize `NulldotEncryptor` with customized operators to create a unique encrypted format.

```typescript
const customEncryptor = new NulldotEncryptor(
    "!",    // NULL operator - represents binary '0'
    "*",    // DOT operator - represents binary '1'
    "-",    // Character delimiter
    "::"    // Word delimiter
);

const secretMessage = "Encryption with Custom Operators";
const key = "secureCustomKey";

// Encrypt data
const encrypted = customEncryptor.dataToNulldot(secretMessage, key);
console.log("Custom Encrypted Data:", encrypted);

// Decrypt data
const decrypted = customEncryptor.nulldotToData(encrypted, key);
console.log("Decrypted Data:", decrypted);
```

### Method Documentation

#### Constructor

```typescript
constructor(
    NULL: string = ',',
    DOT: string = '.',
    CHAR_DELIMITER: string = "_",
    WORD_DELIMITER: string = "__"
)
```

Creates an instance of `NulldotEncryptor` with custom operators and delimiters. All parameters must be unique and non-empty to avoid conflicts.

#### dataToNulldot(data: any, key: string): string

Encrypts the data using the provided key, returning an encoded string with the specified operators and delimiters.

#### nulldotToData(nulldotText: string, key: string): string

Decrypts the encoded text back to its original form using the same key.

## Advanced Features

1. **Quantum Prime Transformations**: Combines lattice constants with quantum primes, making the encryption resistant to conventional attacks.
2. **Bit Masking and Rotation Functions**: Encrypts data with multiple bitwise operations and transformations, strengthening data security.
3. **Flexible Encoding Options**: Customizable operators provide adaptable encryption formats, making each encoding unique and personalized.

## Example: Fully Custom Encryption

Below is an example of fully customized encryption and decryption workflow, illustrating how to use non-standard operators and delimiters in Nulldot.js.

```typescript
const myEncryptor = new NulldotEncryptor("~", "#", "|", "::");

const data = "Highly Confidential Data";
const key = "topSecretKey123";

// Encrypt data
const customEncrypted = myEncryptor.dataToNulldot(data, key);
console.log("Encrypted with Custom Operators:", customEncrypted);

// Decrypt data
const customDecrypted = myEncryptor.nulldotToData(customEncrypted, key);
console.log("Decrypted Data:", customDecrypted);
```

## Security Mechanisms

1. **Quantum Primes and Lattice Constants**: The encryption algorithm applies mathematical constants for enhanced security.
2. **Efficient Key Rotation**: Uses optimized rotation functions, making it challenging to decrypt data without the correct key.
3. **Customizable Bit Manipulation**: Multiple transformations enhance data complexity and security against brute-force attacks.

## License

Nulldot.js is open-source software, licensed under the MIT License, allowing it to be used in a wide range of projects and applications.

For further inquiries or to report issues, please refer to [NLG Sakib's GitHub page](https://github.com/nnlgsakib). 

---

**Nulldot.js** provides a robust encryption solution for developers seeking enhanced data security with customizable options and advanced cryptographic methods. Start exploring the unique possibilities of Nulldot.js in your applications today!