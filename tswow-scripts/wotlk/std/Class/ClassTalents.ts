import { makeMask, MaskCon } from "../../../data/cell/cells/MaskCell";
import { MultiRowSystem } from "../../../data/cell/systems/MultiRowSystem";
import { RaceMask } from "../Race/RaceType";
import { TalentTreeRegistry } from "../Talents/Talents";
import { TalentTree } from "../Talents/TalentTree";
import { classBit } from "./ClassMaskCell";
import { Class } from "./Class";

export class ClassTalents extends MultiRowSystem<TalentTree,Class> {
    protected getAllRows(): TalentTree[] {
        return TalentTreeRegistry
            .filter(x=>x.row.ClassMask.get()&(classBit(this.owner.ID)))
    }
    protected isDeleted(value: TalentTree): boolean {
        return value.row.isDeleted();
    }

    addGet(mod: string, id: string, tabIndex: number, races?: MaskCon<keyof typeof RaceMask>) {
        let tree = TalentTreeRegistry.create(mod,id)
        tree.row.OrderIndex.set(tabIndex)
                .RaceMask.set(makeMask(RaceMask,races))
                .ClassMask.set(classBit(this.owner.ID))
        return tree;
    }

    addMod(mod: string, id: string, tabIndex: number, callback: (tree: TalentTree)=>void = ()=>{}) {
        callback(this.addGet(mod,id,tabIndex));
        return this.owner;
    }
}