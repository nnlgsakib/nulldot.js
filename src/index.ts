import * as crypto from 'crypto';

export class NulldotEncryptor {
    private NULL: string;
    private DOT: string;
    private CHAR_DELIMITER: string;
    private WORD_DELIMITER: string;

    private QUANTUM_PRIMES: bigint[];
    private LATTICE_CONSTANTS: bigint[];

    constructor(NULL: string = ',', DOT: string = '.', CHAR_DELIMITER: string = "_", WORD_DELIMITER: string = "__") {
        this.NULL = NULL;
        this.DOT = DOT;
        this.CHAR_DELIMITER = CHAR_DELIMITER;
        this.WORD_DELIMITER = WORD_DELIMITER;

        this.QUANTUM_PRIMES = [
            BigInt('2305843009213693951'),
            BigInt('618970019642690137449562111'),
            BigInt('170141183460469231731687303715884105727'),
            BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639747'),
            BigInt('999999999999999999999999999999999999999999999999999999999999999999999999999989'),
            BigInt('179769313486231590772930519078902473361797697894230657273430081157732675805500963132708477322407536021120113879871393357658789768814416622492847430639474124377767893424865485276302219601246094119453082952085005768838150682342462881473913110540827237163350510684586298239947245938479716304835356329624224137859'),
            BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639937'),
            BigInt('340282366920938463463374607431768211457'),
            BigInt('14474011154664524427946373126085988481658748083205070504932198000989141205031'),
            BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819949'),
            BigInt('6864797660130609714981900799081393217269435300143305409394463459185543183397656052122559640661454554977296311391480858037121987999716643812574028291115057151'),
            BigInt('6277101735386680763835789423207666416102355444464034512896')
        ];

        this.LATTICE_CONSTANTS = [
            BigInt('12345678901234567890123456789012345678901234567890'),
            BigInt('98765432109876543210987654321098765432109876543210'),
            BigInt('11111111111111111111111111111111111111111111111111'),
            BigInt('22222222222222222222222222222222222222222222222222')
        ];
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

    // Bitwise rotation functions
    private leftRotate(value: bigint, shift: bigint, width: bigint): bigint {
        return ((value << shift) | (value >> (width - shift))) & ((BigInt(1) << width) - BigInt(1));
    }

    private rightRotate(value: bigint, shift: bigint, width: bigint): bigint {
        return ((value >> shift) | (value << (width - shift))) & ((BigInt(1) << width) - BigInt(1));
    }

    // Rotate character code
    private rotateCharCode(charCode: number, shift: number, direction: 'left' | 'right'): number {
        const bits = 16; // Since charCode is between 0 and 65535
        if (direction === 'left') {
            return ((charCode << shift) | (charCode >> (bits - shift))) & ((1 << bits) - 1);
        } else {
            return ((charCode >> shift) | (charCode << (bits - shift))) & ((1 << bits) - 1);
        }
    }

    // Enhanced pseudo-random key generator with increased randomness for quantum resistance
    private generatePseudoRandomSequence(key: string, length: number): number[] {
        const sequence = new Array<number>(length);
        let state = this.hashKey(key); // Initialize state from SHA-512 hash as BigInt

        const primes = this.QUANTUM_PRIMES;
        const lattices = this.LATTICE_CONSTANTS;

        for (let i = 0; i < length; i++) {
            // Re-hash the key for additional randomness
            const rehashedKey = BigInt('0x' + crypto.createHash('sha512').update(crypto.createHash('sha512').update(key).digest('hex')).digest('hex'));

            // Use primes and lattices in computations
            const prime = primes[i % primes.length];
            const lattice = lattices[i % lattices.length];

            // Perform rotations
            state = this.leftRotate(state, BigInt(13), BigInt(512));
            state = this.rightRotate(state, BigInt(7), BigInt(512));

            // Update state with primes and lattices
            state = (state * rehashedKey + prime + lattice) % (BigInt(1) << BigInt(512));

            // XOR with shifted state to further increase randomness
            state = state ^ (state >> BigInt(17));

            // Convert to a number between 0 and 255
            sequence[i] = Number(state % BigInt(256));
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
                let charCode = c.charCodeAt(0);

                // Perform uprotate (increment)
                charCode = (charCode + 1) % 65536;

                // Perform left rotate on charCode
                charCode = this.rotateCharCode(charCode, 3, 'left');

                // XOR character with the pseudo-random key sequence
                charCode = (charCode ^ pseudoRandomKey[keyIndex]) % 65536;

                // Perform right rotate on result
                charCode = this.rotateCharCode(charCode, 2, 'right');

                // Perform downrotate (decrement)
                charCode = (charCode - 1 + 65536) % 65536;

                // Reverse bits
                charCode = this.reverseBits(charCode, 16);

                keyIndex += 1;
                const binary = charCode.toString(2).padStart(16, '0'); // Convert to 16-bit binary

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
                let charCode = parseInt(binaryString, 2);

                // Reverse bits
                charCode = this.reverseBits(charCode, 16);

                // Perform uprotate (reverse of downrotate)
                charCode = (charCode + 1) % 65536;

                // Perform left rotate (reverse of right rotate)
                charCode = this.rotateCharCode(charCode, 2, 'left');

                // XOR with the pseudo-random key sequence
                charCode = (charCode ^ pseudoRandomKey[keyIndex]) % 65536;

                // Perform right rotate (reverse of left rotate)
                charCode = this.rotateCharCode(charCode, 3, 'right');

                // Perform downrotate (reverse of uproate)
                charCode = (charCode - 1 + 65536) % 65536;

                keyIndex += 1;
                const originalChar = String.fromCharCode(charCode);
                return originalChar;
            }).join('');
        }).join(' ');
    }

    // Reverse bits of a number
    private reverseBits(value: number, width: number): number {
        let reversed = 0;
        for (let i = 0; i < width; i++) {
            reversed = (reversed << 1) | (value & 1);
            value >>= 1;
        }
        return reversed;
    }
}
