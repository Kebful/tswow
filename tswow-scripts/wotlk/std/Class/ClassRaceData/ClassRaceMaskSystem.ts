import { makeMask, MaskCellWrite, MaskCon } from "../../../../data/cell/cells/MaskCell";
import { MultiRowSystem } from "../../../../data/cell/systems/MultiRowSystem";
import { IDeletable, MainEntity } from "../../Misc/Entity";
import { RaceMask } from "../../Race/RaceType";
import { ClassMaskCell, ClassMaskInput, makeClassMask } from "../ClassMaskCell";

export interface IClassRaceMaskEntry {
    readonly ClassMask: ClassMaskCell<this>
    readonly RaceMask: MaskCellWrite<this,typeof RaceMask>
}

export abstract class ClassRaceMaskEntry<T extends IDeletable>
extends MainEntity<T>
implements IClassRaceMaskEntry
{
    abstract get ClassMask(): ClassMaskCell<this>
    abstract get RaceMask(): MaskCellWrite<this,typeof RaceMask>
}

export abstract class ClassRaceMaskSystemBase<E extends IClassRaceMaskEntry,T>
    extends MultiRowSystem<E,T>
{
    clearClass(cls: ClassMaskInput) {
        this.forEach(v=>{
            v.ClassMask.set(cls,'NOT')
        })
        return this.owner;
    }

    clearRace(race: MaskCon<keyof typeof RaceMask>) {
        let rmask = makeMask(RaceMask,race);
        this.forEach(v=>{
            v.RaceMask.set(v.RaceMask.get()&(~rmask>>>0));
        })
        return this.owner;
    }

    clearPair(cls: ClassMaskInput, race: MaskCon<keyof typeof RaceMask>) {
        this.forEach(v=>{
            if(v.ClassMask.hasAll(cls) && v.RaceMask.hasAll(race)) {
                v.ClassMask.set(cls,'NOT');
                v.RaceMask.set(race,'NOT');
            }
        })
        return this.owner;
    }
}

export abstract class ClassRaceMaskSystem<E extends ClassRaceMaskEntry<R>,R extends IDeletable,T> extends ClassRaceMaskSystemBase<E,T> {
    protected abstract _addGet(classmask: bigint, racemask: number): E;
    addGet(classes: ClassMaskInput, races: MaskCon<keyof typeof RaceMask>) {
        return this._addGet(makeClassMask(classes),makeMask(RaceMask,races));
    }

    addMod(classes: ClassMaskInput, races: MaskCon<keyof typeof RaceMask>, callback: (entity: E)=>void) {
        callback(this.addGet(classes,races));
        return this.owner;
    }
}