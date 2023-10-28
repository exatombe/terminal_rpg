import Entity from "../classes/Entity";
import GameManager from "../classes/GameManager";
import Mod from "../classes/Mods";
import { Bosses, Menu, Monster, Player, returnMod } from "../interface";

export class WeakMod extends Mod {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    property: string[] = ["attack","start"];

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Weak Mod");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }

    attack(player: Entity, Monster: Entity, damage: number, text: string[] = []): returnMod<number | string[]> {
        return {
            text,
            damage: damage / 2
        }
    }

    start(menuStart: Menu[]): Menu[] {
        let player = GameManager.players[0];
        player.hp /= 2;
        player.maxHp /= 2;
        player.heal = (pv?: number)=>{
            if (player.hp < player.maxHp) {
                player.hp += pv ? pv : 1;
          
                if (player.hp > player.maxHp) {
                  player.hp = player.maxHp;
                }
              }
        }
        GameManager.players[0] = player;
        return menuStart;
    }


}