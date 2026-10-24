import * as assert from 'assert';
import {
    BuildRuneClassCondition,
    BuildRuneEligibilityExpression,
    FindRuneClassCondition,
} from '../../wotlk/std/Class/ClassRaceData/ClassRaceRuneFrame';

const runeClasses = {
    DEATHKNIGHT: ['Human', 'Orc'],
};

function EvaluateEligibility(classId: string, raceId: string): boolean {
    const expression = BuildRuneEligibilityExpression(runeClasses)
    const javascript = expression
        .replace(/class_id/g, JSON.stringify(classId).replace(/"/g, "'"))
        .replace(/race_id/g, JSON.stringify(raceId).replace(/"/g, "'"))
        .replace(/ and /g, ' && ')
        .replace(/ or /g, ' || ')
    return Function(`return (${javascript})`)() as boolean
}

describe('ClassRaceRuneFrame', function() {
    it('uses a positive condition for the current rune frame template', function() {
        assert.strictEqual(
            BuildRuneClassCondition(runeClasses, '=='),
            '\tif ((class_id == "DEATHKNIGHT" and (race_id == "Human" or race_id == "Orc"))) then'
        )
        assert.strictEqual(EvaluateEligibility('DEATHKNIGHT', 'Human'), true)
        assert.strictEqual(EvaluateEligibility('DEATHKNIGHT', 'Troll'), false)
        assert.strictEqual(EvaluateEligibility('MAGE', 'Human'), false)
    });

    it('retains the hide-only condition for the older rune frame template', function() {
        assert.strictEqual(
            BuildRuneClassCondition(runeClasses, '~='),
            '\tif (not ((class_id == "DEATHKNIGHT" and (race_id == "Human" or race_id == "Orc")))) then'
        )
        assert.strictEqual(EvaluateEligibility('DEATHKNIGHT', 'Orc'), true)
        assert.strictEqual(EvaluateEligibility('DEATHKNIGHT', 'Dwarf'), false)
    });

    it('uses an explicit false fallback when no rune class is defined', function() {
        assert.strictEqual(BuildRuneEligibilityExpression({}), 'false')
        assert.strictEqual(BuildRuneClassCondition({}, '=='), '\tif (false) then');
        assert.strictEqual(BuildRuneClassCondition({}, '~='), '\tif (not (false)) then');
    });

    it('selects exactly one supported template line', function() {
        assert.strictEqual(
            FindRuneClassCondition([
                'function RuneFrame_UpdateClassContext(self)',
                '\tif ( class == "DEATHKNIGHT" ) then',
                'end',
            ]),
            '\tif ( class == "DEATHKNIGHT" ) then'
        );
        assert.strictEqual(
            FindRuneClassCondition([
                '\tif ( class ~= "DEATHKNIGHT" ) then\r',
                'end',
            ]),
            '\tif ( class ~= "DEATHKNIGHT" ) then\r'
        );
        assert.throws(()=>FindRuneClassCondition([]));
    });
});
