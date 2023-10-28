import { terminal } from "terminal-kit";
import GameManager from "../classes/GameManager";
import Mods from "../classes/Mods";
import { Bosses, Menu, Monster, Player } from "../interface";
import Entity from "../classes/Entity";

/** Better Combat Option mod.
 * We need to implement displayAttackOption().
 */
export class BetterCombatOptions extends Mods {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    property: string[] = ["displayAttackOptions"];

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Better Combat Options");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }

    /** This method adds 'Escape' and 'Protect' options in the menu.
     * Escape will get a new ennemy in the current floor.
     * Protect will push the updated mobAttack in the properties, 
     * then the method used in the GameManager will be different for the next turn.
     * After that, the updated mobAttack() is removed.
     */
    public displayAttackOptions(player: Bosses, menu: Menu[]) {
        menu.splice(2, 0, {
            content: "Escape",
            callback: () => {
                console.clear();
                console.log("Escaping... A new ennemie appeared !\n")
                setTimeout(() => {
                    if (GameManager.currentFightPlayer) {
                        GameManager.setCurrentFightMob(GameManager.getNextMob());
                        GameManager.displayCurrentTurn();
                    }
                }, 1000);
            }
        });
        menu.splice(3, 0, {
            content: "Protect",
            callback: () => {
                this.property.push("mobAttack")
                GameManager.nextTurn();
                GameManager.displayCurrentTurn();
                setTimeout(() => {
                    this.property = this.property.filter(props => props !== "mobAttack");
                }, 2000);
            }
        });
        return menu;
    }

    /** The new mobAttack(), for one turn only */
    mobAttack(player: Entity, Monster: Entity, damage: number): number {
        return damage / 2;
    }
}