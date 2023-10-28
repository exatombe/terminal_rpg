export interface Bosses {
    id: number
    name: string
    hp: number
    mp: number
    str: number
    int: number
    def: number
    res: number
    spd: number
    luck: number
    race: number
    class: number
    rarity: number
}

export interface Classes {
    id: number
    name: string
    strengths: number[]
    weaknesses: number[]
    attack_type: string
    alignment: string
    rarity: number
}

type Monster = Bosses;

type Player = Bosses;

type EntityI = Monster | Player | Bosses;
export {
    Monster,
    Player,
    EntityI
}

export interface Race {
    id: number
    name: string
    strength: any[]
    weakness: number[]
    rarity: string
  }
  
  export interface Spell {
    id: number
    name: string
    cost: number
    dmg: number
    effect: string
    cooldown: number
    race: string
    class: string
    rarity: number
  }

  export interface Traps {
    id: number
    name: string
    requirement: string
    rarity: number
  }

  export interface Menu {
    content: string;
    callback: () => void;
  }

export interface returnMod<T=string[]> {
    [key: string]: T|string[];
  }
// if T is not defined, returnModI will be equal to returnMod
