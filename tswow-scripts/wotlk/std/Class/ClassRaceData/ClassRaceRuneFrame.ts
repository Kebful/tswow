export type RuneClassRaces = {[key: string]: readonly string[]}

export function BuildRuneEligibilityExpression(classRaces: RuneClassRaces): string {
    const classChecks = Object.entries(classRaces)
        .filter(([,races])=>races.length > 0)
        .map(([className,races])=>{
            const raceChecks = races
                .map(race=>`race_id == ${JSON.stringify(race)}`)
                .join(' or ')
            return `(class_id == ${JSON.stringify(className)} and (${raceChecks}))`
        })

    return classChecks.length > 0 ? classChecks.join(' or ') : 'false'
}

export function BuildRuneClassCondition(classRaces: RuneClassRaces, operator: '=='|'~='): string {
    const expression = BuildRuneEligibilityExpression(classRaces)
    return operator === '=='
        ? `\tif (${expression}) then`
        : `\tif (not (${expression})) then`
}

export function FindRuneClassCondition(lines: readonly string[]): string {
    const matcher = /^\tif \( class (?:~=|==) "DEATHKNIGHT" \) then\r?$/
    const matches = lines.filter(line=>matcher.test(line))
    if(matches.length !== 1) {
        throw new Error(`Expected one rune class condition, found ${matches.length}`)
    }
    return matches[0]
}
