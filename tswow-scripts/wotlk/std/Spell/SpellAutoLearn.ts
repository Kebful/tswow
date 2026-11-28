import { ClassMaskCell, ClassMaskInput } from "../Class/ClassMaskCell";
import { makeMaskCell32, MaskCon } from "../../../data/cell/cells/MaskCell";
import { isTrinityCore } from "../../../data/Settings";
import { SqlRow } from "../../../data/sql/SQLRow";
import { spell_autolearnRow } from "../../sql/spell_autolearn";
import { SQL } from "../../SQLFiles";
import { ClassRaceMaskEntry, ClassRaceMaskSystem } from "../Class/ClassRaceData/ClassRaceMaskSystem";
import { RaceMask } from "../Race/RaceType";
import { Spell } from "./Spell";
import { SpellRegistry } from "./Spells";

if(isTrinityCore()) {
    // Queued with the writes, never executed while the build runs. A read here deleted the table
    // immediately, at module load, before the datascripts had re-inserted anything: every interrupted
    // build (Ctrl-C, a crash, a killed terminal) then left spell_autolearn empty, and the next
    // worldserver start loaded that empty list, so characters logged in without their class spells.
    // Deferring it means the table only changes in the write stage, together with the new rows; a
    // build that dies earlier leaves the previous build's data in place.
    SQL.Databases.world_dest.writeEarly(`DELETE FROM \`spell_autolearn\`;`);
    SQL.spell_autolearn.queryAll({})
        .forEach(x=>{
            SqlRow.markDirty(x);
        })
}

export class SpellAutoLearn extends ClassRaceMaskEntry<spell_autolearnRow> {
    get Spell() { return SpellRegistry.readOnlyRef(this, this.row.spell); }
    get Level() { return this.wrap(this.row.level); }
    get ClassMask(): ClassMaskCell<this> {
        return new ClassMaskCell(this, this.wrapUnlock(this.row.classmask)) as any;
    }
    get RaceMask() {
        return makeMaskCell32(RaceMask, this, this.wrapUnlock(this.row.racemask)) as any;
    }
}

export class SpellAutoLearns extends ClassRaceMaskSystem<SpellAutoLearn,spell_autolearnRow,Spell> {
    protected _addGet(classmask: bigint, racemask: number): SpellAutoLearn {
        return new SpellAutoLearn(
            SQL.spell_autolearn.add(this.owner.ID,racemask,classmask)
                .level.set(1)
        )
    }

    protected getAllRows(): SpellAutoLearn[] {
        return SQL.spell_autolearn.queryAll({spell:this.owner.ID})
            .map(x=>new SpellAutoLearn(x));
    }
    protected isDeleted(value: SpellAutoLearn): boolean {
        return value.row.isDeleted();
    }

    add(level: number, classes?: ClassMaskInput, races?: MaskCon<keyof typeof RaceMask>) {
        this.addGet(classes,races).Level.set(level);
        return this.owner;
    }
}