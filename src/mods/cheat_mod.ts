import Entity from "../classes/Entity";
import GameManager from "../classes/GameManager";
import Mod from "../classes/Mods";
import { Bosses, Menu, Monster, Player, returnMod } from "../interface";

export class CheatMod extends Mod {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    property: string[] = ["attack","start"];

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Cheat Mod");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }

    attack(player: Entity, Monster: Entity, damage: number, text: string[] = []): returnMod<number | string[]> {
        return {
            text,
            damage: damage * 100
        }
    }

    start(menuStart: Menu[]): Menu[] {
        let player = GameManager.players[0];
        player.hp *= 100;
        player.maxHp *= 100;
        player.mp *=30;
        player.spd *=30;
        player.def *= 30;
        player.heal = (pv?: number)=>{
            if (player.hp < player.maxHp) {
                player.hp += pv ? pv : 1000;
          
                if (player.hp > player.maxHp) {
                  player.hp = player.maxHp;
                }
              }
        }
        GameManager.players[0] = player;
        return menuStart;
    }


}