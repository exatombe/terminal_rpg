import { terminal } from "terminal-kit";
import Entity from "../classes/Entity";
import GameManager from "../classes/GameManager";
import Mod from "../classes/Mods";
import { Bosses, Menu, Monster, Player, returnMod } from "../interface";
import { blue, magenta, yellow} from "ansi-colors";

/** More Statistics mod. 
 * We need to implement attack(), mobAttack() and displayAttackOptions().
*/
export class moreStatistics extends Mod {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    property: string[] = ["attack","mobAttack", "displayAttackOptions","firstTurn"];

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("More Statistics");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }

    /** We add a spell option. spell() is handled in the callback. */
    displayAttackOptions(player: Bosses, menu: Menu[], text?: string[] | undefined): Menu[] {
        menu.splice(2, 0, {
            content: "Spell",
            callback: () => {
                let player = GameManager.currentFightPlayer;
                let monster = GameManager.currentFightMob;
                if(player && monster){
                    this.spell(player,monster);
                }
            }
        })

        return menu;
    }

    /** We add luck to determine critical strikes.
     * We lower our next attack based on the ennemy res and def.
     */
    attack(player: Entity, Monster: Entity, damage: number, text: string[] = []): returnMod<number> {
        let isLucky: boolean = Math.random() < (player.luck/25);

        if (isLucky) {
            text.push(blue(`${player.name} did ${damage} damage`));
        } else {
            text.push(magenta(`Critical strike ! ${player.name} did ${damage} damage`));

        }

        let ignoredDamage = damage * (Monster.def / 100);
        damage -= parseInt(ignoredDamage.toString());
        text.push(yellow(`${ignoredDamage} ignored`));
        
        return {
            text: text,
            damage: isLucky ? (damage*2) : damage
        }
    }

    /** We add luck to determine critical strikes.
     * We lower our next attack based on the ennemy res and def.
     */
    mobAttack(player: Entity, Monster: Entity, damage: number, text?: string[] | undefined): number {
        let isLucky: boolean = Math.random() < (Monster.luck/25);

        let ignoredDamage = damage * (player.def / 100);
        damage -= parseInt(ignoredDamage.toString());
        
        return parseInt((isLucky ? (damage*2) : damage).toString());
    }

    /** spell() takes player and monster entities as arguments.
     * It substracts monster HP by player MP modified by monster res.
     * 
     */
    spell(player: Entity, Monster: Entity){
        let ignoredDamage = player.mp * (Monster.res / 100);
        Monster.hp -= parseInt((player.mp - ignoredDamage).toString());
        console.clear();
        let msg = [`${player.name} dealt ${player.mp} magical damages`,`Ennemi ignored ${parseInt(ignoredDamage.toString())} magical damages`];
        console.log(msg.map((e) => {
            let repeat = (terminal.width/2) -(msg.length);
            if(repeat <= 0) return e;
            return " ".repeat(repeat) + e;
        }).join("\n"));
        setTimeout(()=>{
        if(Monster.hp <= 0){
            GameManager.removeFightMob();
            GameManager.emit("attack",player);
        }else{
            GameManager.setCurrentFightMob(Monster);
            GameManager.nextTurn();
            GameManager.displayCurrentTurn();
        }
        },1000)
    }

    firstTurn(turn: number): number {
        let player = GameManager.currentFightPlayer;
        let monster = GameManager.currentFightMob;
        if(player && monster){
            player.spd > monster.spd ? turn = 1 : turn = 2;            
        }
        return turn;
    }
}