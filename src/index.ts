import * as crypto from 'crypto';

export class NulldotEncryptor {
    private NULL: string;
    private DOT: string;
    private CHAR_DELIMITER: string;
    private WORD_DELIMITER: string;
    private readonly PADDING_LAYERS = 12;
    private readonly ROTATION_BITS = 7;
    private readonly TRANSFORMATION_ROUNDS = 16;
    
    // Pre-calculate frequently used masks and constants
    private readonly BIT_MASKS: { [key: number]: bigint } = {};
    private readonly SHIFT_MASKS: { [key: number]: bigint } = {};
    private readonly QUANTUM_PRIMES: bigint[];
    private readonly LATTICE_CONSTANTS: bigint[];
    private readonly MAX_PRIME: bigint;

    constructor(
        NULL: string = ',',
        DOT: string = '.',
        CHAR_DELIMITER: string = "_",
        WORD_DELIMITER: string = "__"
    ) {
        const args = [NULL, DOT, CHAR_DELIMITER, WORD_DELIMITER];
        if (new Set(args).size !== args.length || args.some(arg => !arg)) {
            throw new Error("All arguments must be unique and non-empty.");
        }

        this.NULL = NULL;
        this.DOT = DOT;
        this.CHAR_DELIMITER = CHAR_DELIMITER;
        this.WORD_DELIMITER = WORD_DELIMITER;

        // Initialize quantum primes
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

        // Pre-calculate max prime
        this.MAX_PRIME = this.QUANTUM_PRIMES[this.QUANTUM_PRIMES.length - 1];

        // Pre-calculate bit masks for common operations
        for (let i = 1; i <= 512; i++) {
            this.BIT_MASKS[i] = (BigInt(1) << BigInt(i)) - BigInt(1);
            this.SHIFT_MASKS[i] = BigInt(1) << BigInt(i);
        }
    }

    private stringifyData(data: any): string {
        return typeof data === 'object' ? JSON.stringify(data) : String(data);
    }

    // Optimized rotation functions using pre-calculated masks
    private rightRotate(n: bigint, d: number, bits: number): bigint {
        const mask = this.BIT_MASKS[bits];
        return ((n >> BigInt(d)) | (n << BigInt(bits - d))) & mask;
    }

    private leftRotate(n: bigint, d: number, bits: number): bigint {
        const mask = this.BIT_MASKS[bits];
        return ((n << BigInt(d)) | (n >> BigInt(bits - d))) & mask;
    }

    private upRotate(n: bigint, bits: number): bigint {
        const halfBits = Math.floor(bits / 2);
        const upperMask = this.BIT_MASKS[bits - halfBits] << BigInt(halfBits);
        const lowerMask = this.BIT_MASKS[halfBits];
        const upperHalf = (n & upperMask) >> BigInt(halfBits);
        const lowerHalf = n & lowerMask;
        return (lowerHalf << BigInt(bits - halfBits)) | upperHalf;
    }

    // Optimized quantum transformations
    private latticeTransform(value: bigint): bigint {
        return this.LATTICE_CONSTANTS.reduce((result, constant, index) => 
            (result * constant + this.QUANTUM_PRIMES[index]) % this.MAX_PRIME, value);
    }

    private antiQuantumScramble(value: bigint): bigint {
        let result = value;
        const rounds = Math.min(this.TRANSFORMATION_ROUNDS, this.QUANTUM_PRIMES.length);
        
        for (let i = 0; i < rounds; i++) {
            result = this.rightRotate(result, i + 1, 512);
            result = this.upRotate(result, 512);
            result = this.leftRotate(result, this.ROTATION_BITS, 512);
            result ^= this.QUANTUM_PRIMES[i];
            result = this.latticeTransform(result);
        }
        return result;
    }

    private superPositionHash(input: bigint): bigint {
        let hash = input;
        const layers = Math.min(this.PADDING_LAYERS, this.QUANTUM_PRIMES.length);
        
        for (let i = 0; i < layers; i++) {
            hash = this.antiQuantumScramble(hash);
            hash ^= this.QUANTUM_PRIMES[i];
            hash = this.latticeTransform(hash);
        }
        return hash;
    }

    // Optimized key generation
    private hashKey(key: string): bigint {
        const hash = crypto.createHash('sha512').update(key).digest('hex') +
                    crypto.createHash('sha512').update(key).digest('hex').slice(0, 32);
        return this.superPositionHash(BigInt('0x' + hash));
    }

    private generatePseudoRandomSequence(key: string, length: number): Uint8Array {
        const sequence = new Uint8Array(length);
        let state = this.hashKey(key);

        for (let i = 0; i < length; i++) {
            state = this.superPositionHash(state);
            
            // Reduced transformation rounds for better performance
            for (let j = 0; j < Math.min(8, this.TRANSFORMATION_ROUNDS); j++) {
                state = this.latticeTransform(state);
                state = this.antiQuantumScramble(state);
                state ^= this.QUANTUM_PRIMES[j % this.QUANTUM_PRIMES.length];
            }

            sequence[i] = Number(state % BigInt(256));
        }
        return sequence;
    }

    public dataToNulldot(data: any, key: string): string {
        const stringData = this.stringifyData(data);
        const filtered = stringData.split('').filter(c => c !== ' ');
        const pseudoRandomKey = this.generatePseudoRandomSequence(key, filtered.length);
        let keyIndex = 0;

        const result = new Array(stringData.length);
        for (let i = 0; i < stringData.length; i++) {
            const c = stringData[i];
            if (c === ' ') {
                result[i] = this.WORD_DELIMITER;
                continue;
            }

            let charCode = c.charCodeAt(0);
            for (let j = 0; j < Math.min(8, this.TRANSFORMATION_ROUNDS); j++) {
                charCode ^= pseudoRandomKey[keyIndex];
                charCode = (charCode << (j % 7)) | (charCode >> (7 - (j % 7)));
                charCode = ((charCode & 0xF0) >> 4) | ((charCode & 0x0F) << 4);
                charCode ^= (j * 13 + 7);
            }
            
            const binary = (charCode % 128).toString(2).padStart(7, '0');
            result[i] = binary.split('')
                .map(b => (b === '0' ? this.NULL : this.DOT))
                .join('') + this.CHAR_DELIMITER;
            keyIndex++;
        }

        return result.join('');
    }

    public nulldotToData(nulldotText: string, key: string): string {
        const charCount = (nulldotText.match(new RegExp(this.CHAR_DELIMITER, 'g')) || []).length;
        const pseudoRandomKey = this.generatePseudoRandomSequence(key, charCount);

        return nulldotText.split(this.WORD_DELIMITER).map(word => {
            return word.split(this.CHAR_DELIMITER).map((code, index) => {
                if (!code) return '';

                const binaryString = code.split('')
                    .map(ch => (ch === this.NULL ? '0' : '1'))
                    .join('');
                let charCode = parseInt(binaryString, 2);

                for (let i = Math.min(8, this.TRANSFORMATION_ROUNDS) - 1; i >= 0; i--) {
                    charCode ^= (i * 13 + 7);
                    charCode = ((charCode & 0xF0) >> 4) | ((charCode & 0x0F) << 4);
                    charCode = (charCode >> (i % 7)) | (charCode << (7 - (i % 7)));
                    charCode ^= pseudoRandomKey[index];
                }

                return String.fromCharCode(charCode % 128);
            }).join('');
        }).join(' ');
    }
}