/*
 * This file is part of tswow (https://github.com/tswow)
 *
 * Copyright (C) 2020 tswow <https://github.com/tswow/>
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

export enum RaceIDs {
      HUMAN    = 1
    , ORC      = 2
    , DWARF    = 3
    , NIGHTELF = 4
    , UNDEAD   = 5
    , TAUREN   = 6
    , GNOME    = 7
    , TROLL    = 8
    //
    , BLOODELF = 10
    , DRAENEI  = 11
    // FFXIV Haven: the nine playable FFXIV bodies (module ChrRaces rows 12..20).
    , HYUR_MIDLANDER  = 12
    , HYUR_HIGHLANDER = 13
    , ELEZEN          = 14
    , MIQOTE          = 15
    , ROEGADYN        = 16
    , LALAFELL        = 17
    , AURA            = 18
    , HROTHGAR        = 19
    , VIERA           = 20
}

export enum RaceMask {
      HUMAN    = 0x1
    , ORC      = 0x2
    , DWARF    = 0x4
    , NIGHTELF = 0x8
    , UNDEAD   = 0x10
    , TAUREN   = 0x20
    , GNOME    = 0x40
    , TROLL    = 0x80
    //
    , BLOODELF = 0x200
    , DRAENEI  = 0x400
    // FFXIV Haven: bit (raceID - 1) for races 12..20.
    , HYUR_MIDLANDER  = 0x800
    , HYUR_HIGHLANDER = 0x1000
    , ELEZEN          = 0x2000
    , MIQOTE          = 0x4000
    , ROEGADYN        = 0x8000
    , LALAFELL        = 0x10000
    , AURA            = 0x20000
    , HROTHGAR        = 0x40000
    , VIERA           = 0x80000
}

// FFXIV Haven: the nine playable FFXIV bodies as one AllowableRace/race-mask value. Lives next to
// the enums that define them so callers never rebuild the mask by hand.
// Mask bit of one race id: bit (raceID - 1), the SQL/DBC convention.
export const FfxivRaceMask = (id: RaceIDs): number => (1 << (id - 1)) >>> 0;

export const FFXIV_RACE_MASK =
    (RaceMask.HYUR_MIDLANDER | RaceMask.HYUR_HIGHLANDER | RaceMask.ELEZEN | RaceMask.MIQOTE |
     RaceMask.ROEGADYN | RaceMask.LALAFELL | RaceMask.AURA | RaceMask.HROTHGAR |
     RaceMask.VIERA) >>> 0;