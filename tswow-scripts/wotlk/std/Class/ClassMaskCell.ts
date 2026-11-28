import { Bit, MaskCell64, MaskCon } from "../../../data/cell/cells/MaskCell";
import { Cell } from "../../../data/cell/cells/Cell";
import { ClassMask } from "./ClassRegistry";

export type ClassMaskInput = MaskCon<keyof typeof ClassMask> | bigint;

export function classBit(classId: number): bigint {
    if (!Number.isInteger(classId) || classId < 1 || classId > 64) {
        throw new RangeError(`Invalid class ID ${classId}`);
    }
    return BigInt(1) << BigInt(classId - 1);
}

export function makeClassMask(value: ClassMaskInput): bigint {
    if (value === undefined) return BigInt(0);
    if (Array.isArray(value)) {
        return value.reduce((mask, part) => mask | makeClassMask(part), BigInt(0));
    }
    if (typeof value === 'string') return BigInt(ClassMask[value]);
    if (typeof value === 'number' && !Number.isSafeInteger(value)) {
        throw new RangeError(`Class mask ${value} requires an exact bigint value`);
    }
    return BigInt.asUintN(64, BigInt(value));
}

export class ClassMaskCell<T> extends MaskCell64<T> {
    constructor(owner: T, cell: Cell<bigint, any>, private readonly signed = false) {
        super(owner, cell);
    }

    get(): bigint {
        return makeClassMask(this.cell.get());
    }

    set(value: ClassMaskInput, mode: 'SET' | 'OR' | 'NOT' = 'SET'): T {
        const mask = makeClassMask(value);
        const result = mode === 'OR' ? this.get() | mask : mode === 'NOT' ? this.get() & ~mask : mask;
        return super.set(this.signed ? BigInt.asIntN(64, result) : result);
    }

    setBit(bit: number, enabled: Bit): T {
        return this.set(classBit(bit + 1), enabled ? 'OR' : 'NOT');
    }

    add(value: ClassMaskInput): T { return this.set(value, 'OR'); }
    remove(value: ClassMaskInput): T { return this.set(value, 'NOT'); }
    hasAll(value: ClassMaskInput): boolean {
        const mask = makeClassMask(value);
        return (this.get() & mask) === mask;
    }
}
