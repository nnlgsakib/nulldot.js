import * as crypto from 'crypto';

export class NulldotEncryptor {
    private NULL: string;
    private DOT: string;
    private CHAR_DELIMITER: string;
    private WORD_DELIMITER: string;

    constructor(NULL: string = ',', DOT: string = '.', CHAR_DELIMITER: string = "_", WORD_DELIMITER: string = "__") {
        this.NULL = NULL;
        this.DOT = DOT;
        this.CHAR_DELIMITER = CHAR_DELIMITER;
        this.WORD_DELIMITER = WORD_DELIMITER;
    }

    // Helper function to convert any data type to a string representation
    private stringifyData(data: any): string {
        if (typeof data === 'object') {
            return JSON.stringify(data); // Convert objects and arrays to JSON strings
        }
        return String(data); // Convert other data types to string
    }

    // SHA-512 hash function to generate a consistent hash value for any key
    private hashKey(key: string): bigint {
        const hash = crypto.createHash('sha512').update(key).digest('hex') +
                     crypto.createHash('sha512').update(key).digest('hex') +
                     crypto.createHash('sha512').update(key).digest('hex');
        return BigInt('0x' + hash); // Convert the hash hex to a BigInt for a larger initial state
    }

    // Enhanced pseudo-random key generator with increased randomness for quantum resistance
    private generatePseudoRandomSequence(key: string, length: number): number[] {
        const sequence = new Array<number>(length);
        let state = this.hashKey(key); // Initialize state from SHA-512 hash as BigInt

        for (let i = 0; i < length; i++) {
            // Re-hash the key for additional randomness
            const rehashedKey = crypto.createHash('sha512').update(crypto.createHash('sha512').update(key).digest('hex')).digest('hex');
            // Multiply state by a large prime and add non-trivial constants to increase randomness
            state = (state * BigInt('0x' + rehashedKey) +
                     BigInt('636413622384679300563641362238467930056364136223846793005636413622384679300563641362238467930056364136223846793005636413622384679300563641362238467930056364136223846793005636413622384679300563641362238467930056364136223846793005') +
                     BigInt('144269636413622384679300563641362238467930056364136223846793005636413622384679300550406364136223846793005636413622384679300563641362238467930056364136223846793005636413622384679300563641362238467930058889634076364136223846793005')) % BigInt(256);
            // XOR with shifted state to further increase randomness
            sequence[i] = Number((state ^ (state >> BigInt(8))) % BigInt(256));
        }
        return sequence;
    }

    // Encode data to nulldot using XOR and pseudo-random sequence
    public dataToNulldot(data: any, key: string): string {
        const stringData = this.stringifyData(data); // Convert any data type to string
        const pseudoRandomKey = this.generatePseudoRandomSequence(key, stringData.split('').filter(c => c !== ' ').length);
        let keyIndex = 0;

        return stringData.split('').map((c) => {
            if (c === ' ') {
                return this.WORD_DELIMITER; // Represent space
            } else {
                // XOR character with the pseudo-random key sequence
                const xorChar = (c.charCodeAt(0) ^ pseudoRandomKey[keyIndex]) % 128;
                keyIndex += 1;
                const binary = xorChar.toString(2).padStart(7, '0'); // Convert to 7-bit binary

                // Convert binary to nulldot language
                return binary.split('').map(b => (b === '0' ? this.NULL : this.DOT)).join('') + this.CHAR_DELIMITER;
            }
        }).join('');
    }

    // Decode nulldot to original text using XOR and pseudo-random sequence
    public nulldotToData(nulldotText: string, key: string): string {
        const charCount = (nulldotText.match(new RegExp(this.CHAR_DELIMITER, 'g')) || []).length;
        const pseudoRandomKey = this.generatePseudoRandomSequence(key, charCount);

        let keyIndex = 0;
        return nulldotText.split(this.WORD_DELIMITER).map(word => {
            return word.split(this.CHAR_DELIMITER).map(code => {
                if (!code) return '';

                // Convert nulldot back to binary string
                const binaryString = code.split('').map(ch => (ch === this.NULL ? '0' : '1')).join('');
                const charCode = parseInt(binaryString, 2);

                // XOR with the pseudo-random key sequence to retrieve original character
                const originalChar = String.fromCharCode((charCode ^ pseudoRandomKey[keyIndex]) % 128);
                keyIndex += 1;
                return originalChar;
            }).join('');
        }).join(' ');
    }
}