/**
 * Class to implement Curl sponge.
 * @private
 */
export class Curl {
    /**
     * The Hash Length
     */
    public static readonly HASH_LENGTH: number = 243;

    /**
     * The State Length.
     */
    public static readonly STATE_LENGTH: number = 3 * Curl.HASH_LENGTH;

    /**
     * The default number of rounds.
     */
    private static readonly NUMBER_OF_ROUNDS: number = 81;

    /**
     * Truth Table.
     */
    private static readonly TRUTH_TABLE: number[] = [1, 0, -1, 2, 1, -1, 0, 2, -1, 1, 0];

    /**
     * The number of rounds.
     */
    private readonly _rounds: number;

    /**
     * The state of the sponge.
     */
    private _state: Int8Array;

    /**
     * Create a new instance of Curl.
     * @param rounds The number of rounds to perform.
     */
    constructor(rounds: number = Curl.NUMBER_OF_ROUNDS) {
        if (rounds !== 27 && rounds !== 81) {
            throw new Error("Illegal number of rounds. Only `27` and `81` rounds are supported.");
        }

        this._state = new Int8Array(Curl.STATE_LENGTH);
        this._rounds = rounds;
    }

    /**
     * Resets the state
     */
    public reset(): void {
        this._state = new Int8Array(Curl.STATE_LENGTH);
    }

    /**
     * Get the state of the sponge.
     * @param len The length of the state to get.
     * @returns The state.
     */
    public rate(len: number = Curl.HASH_LENGTH): Int8Array {
        return this._state.slice(0, len);
    }

    /**
     * Absorbs trits given an offset and length
     * @param trits The trits to absorb.
     * @param offset The offset to start abororbing from the array.
     * @param length The length of trits to absorb.
     */
    public absorb(trits: Int8Array, offset: number, length: number): void {
        do {
            const limit = length < Curl.HASH_LENGTH ? length : Curl.HASH_LENGTH;

            this._state.set(trits.subarray(offset, offset + limit));

            this.transform();
            length -= Curl.HASH_LENGTH;
            offset += limit;
        } while (length > 0);
    }

    /**
     * Squeezes trits given an offset and length
     * @param trits The trits to squeeze.
     * @param offset The offset to start squeezing from the array.
     * @param length The length of trits to squeeze.
     */
    public squeeze(trits: Int8Array, offset: number, length: number): void {
        do {
            const limit = length < Curl.HASH_LENGTH ? length : Curl.HASH_LENGTH;

            trits.set(this._state.subarray(0, limit), offset);

            this.transform();
            length -= Curl.HASH_LENGTH;
            offset += limit;
        } while (length > 0);
    }

    /**
     * Sponge transform function
     */
    private transform(): void {
        let stateCopy;
        let index = 0;

        for (let round = 0; round < this._rounds; round++) {
            stateCopy = this._state.slice();

            for (let i = 0; i < Curl.STATE_LENGTH; i++) {
                this._state[i] =
                    Curl.TRUTH_TABLE[stateCopy[index] + (stateCopy[(index += index < 365 ? 364 : -365)] << 2) + 5];
            }
        }
    }
}
