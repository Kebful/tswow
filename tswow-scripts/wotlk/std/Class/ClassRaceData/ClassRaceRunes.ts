import { finish } from "../../../../data";
import { CellSystem } from "../../../../data/cell/systems/CellSystem";
import { DBC } from "../../../DBCFiles";
import { LUAXML } from "../../../luaxml/LUAXML";
import { SQL } from "../../../SQLFiles";
import { ClassRacePair } from "./ClassRaces";
import {
    BuildRuneClassCondition,
    FindRuneClassCondition,
} from "./ClassRaceRuneFrame";

export class ClassRaceRunes extends CellSystem<ClassRacePair> {
    set(enabled: boolean) {
        let row = SQL.class_has_runes.query({classID:this.owner.Class.get(),raceID:this.owner.Race.get()});
        if(enabled) {
            if(!row) {
                row = SQL.class_has_runes.add(this.owner.Class.get(),this.owner.Race.get());
            }
            row.undelete();
        } else {
            if(row) {
                row.delete();
            }
        }
    }

    get() {
        let row = SQL.class_has_runes.query({classID:this.owner.Class.get(),raceID:this.owner.Race.get()});
        return row && !row.isDeleted();
    }
}

finish('class-has-runes', () => {
    const runeFrame = LUAXML.file('Interface/FrameXML/RuneFrame.lua')
    runeFrame.replace('	local _, class = UnitClass("player")'
    ,'	local _,class_id = UnitClass("player");\n	local _,race_id = UnitRace("player");')

    let classFilenameMap: {[key: number]: string} = {}
    let raceNameMap: {[key: number]: string} = {}

    DBC.ChrRaces.queryAll({}).forEach(x=>{
        raceNameMap[x.ID.get()] = x.ClientFilestring.get()
    })

    DBC.ChrClasses.queryAll({}).forEach(x=>{
        classFilenameMap[x.ID.get()] = x.Filename.get()
    })

    let perClass: {[key: string]: string[]}= {}
    SQL.class_has_runes.queryAll({}).forEach(x=>{
        if(x.isDeleted()) {
            return;
        }
        let classFile = classFilenameMap[x.classID.get()]
        let raceName = raceNameMap[x.raceID.get()]
        if(!classFile || !raceName) {
            return;
        }
        if(perClass[classFile] === undefined) {
            perClass[classFile] = []
        }
        perClass[classFile].push(raceName)
    })

    const classCondition = FindRuneClassCondition(runeFrame.lines)
    const operator = classCondition.includes(' class == ') ? '==' : '~='
    const replacement = BuildRuneClassCondition(perClass, operator)
    runeFrame.replace(classCondition, classCondition.endsWith('\r')
        ? replacement + '\r'
        : replacement)
});
