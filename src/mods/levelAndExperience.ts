import { yellow } from "ansi-colors";
import Entity from "../classes/Entity";
import Mod from "../classes/Mods";
import { Bosses, Monster, Player, returnMod } from "../interface";

/** Level And Experience mob.
 * We need to implement victory().
 */
export class levelAndExperience extends Mod {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    property: string[] = ["victory"];
    level: number = 0;
    xp: number = 0;

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Level And Experience");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }

    /** victory() is called after an ennemy death.
     * We earn random XP. When we level up it upgrades HP or STR randomly by 5.
     */
    victory(player: Entity, text: string[]= []): returnMod<Entity> {   
        let xpEarned = Math.round(Math.random()*35) + 15;
        this.xp += xpEarned;
        text.push(`You have earned ${yellow(xpEarned.toString())} xp`);
        if(this.xp >= (50*(this.level+1))){
            this.xp = (this.xp-(50*(this.level+1)));
            this.level++;
            let rand = Math.random();
            if(rand > 0.5){
                text.push("You have leveled up, +5 💕💖");
                player.maxHp += 5
            }else {
                text.push("You have leveled up, +5 ⚔️🤺");
                player.str += 5;
            }
        }
        return {
            text,
            entity: player,
        }
    }
}