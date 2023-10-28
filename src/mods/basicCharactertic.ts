import { readFileSync } from "fs";
import Mod from "../classes/Mods";
import { Bosses, Classes, Menu, Monster, Player, Race, returnMod } from "../interface";
import GameManager from "../classes/GameManager";
import { terminal } from "terminal-kit";
import Entity from "../classes/Entity";
import { green, red } from "ansi-colors";

/** Basic characteristic mod.
 * We need to implement displayAttackOptions(), mobAttack() and attack().
 */
export class BasicCharacteristic extends Mod {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    class: Classes[];
    races: Race[];
    property: string[] = ["displayAttackOptions", "mobAttack", "attack"];
    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Basic Characteristic");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
        try {
            this.class = JSON.parse(readFileSync("./json/classes.json", "utf8")) as Classes[];
            this.races = JSON.parse(readFileSync("./json/races.json", "utf8")) as Race[];
        } catch (e) {
            this.class = [];
            this.races = [];
        }
    }
    getName() {
        return this.name;
    }

    /** This adds a characteristics option that will handle a method in his callback. */
    displayAttackOptions(player: Player, menu: Menu[]) {
        menu.unshift({
            content: "Characteristics",
            callback: () => {
                this.displayCharacteristics(player);
            }
        });
        return menu;
    }

    /** The method to pass in the callback when we use the characteristic option.
     * It displays the stats in a table (terminal-kit).
     */
    displayCharacteristics(player: Player) {
        terminal.clear();
        terminal.singleRowMenu(["Back"], (error, response) => {
            if (response.selectedText === "Back") {
                GameManager.displayCurrentTurn();
            }
        });
        process.stdout.write("\n".repeat(2));
        let currentRace = this.races.find(e => e.id == player.race);
        let currentClass = this.class.find(e => e.id == player.class);

        if (currentClass && currentRace) {
            let strongAgainst = this.mobs.filter((e) => currentRace?.strength.includes(e.race)).map(e => {
                return e.name;
            });
            let weakAgainst = this.mobs.filter((e) => currentRace?.weakness.includes(e.race)).map(e => {
                return e.name;
            });
            let strongAgainstClass = this.mobs.filter((e) => currentClass?.strengths.includes(e.class)).map(e => {
                return e.name;
            });
            let weakAgainstClass = this.mobs.filter((e) => currentClass?.weaknesses.includes(e.class)).map(e => {
                return e.name;
            });
            terminal.table([
                [" Race", " Class"],
                [currentRace.name, currentClass.name],
                [" Strong Against(Race)", " Weak Against(Race)"],
                [strongAgainst.length > 0 ? strongAgainst.join(", ") : "Strong again no one", weakAgainst.length > 0 ? weakAgainst.join(", ") : "Weak against no one"],
                [" Strong Against(Class)", " Weak Against(Class)"],
                [strongAgainstClass.length > 0 ? strongAgainstClass.join(", ") : "Strong again no one", weakAgainstClass.length > 0 ? weakAgainstClass.join(", ") : "Weak against no one"],
            ], {
                hasBorder: true,
                borderChars: "lightRounded",
                firstRowTextAttr: { bgColor: 'yellow', color: "black" },
                evenRowTextAttr: {
                    bgColor: 'red',
                },
                evenCellTextAttr: {
                    bgColor: 'blue',
                },
                fit: true,
                expandToWidth: true,
            });
        }
        terminal.table([
            [" Damage", " Defense", " Magic Damage", " Magic Defense", " Speed", " Luck"],
            [player.str.toString(), player.def.toString(), player.int.toString(), player.res.toString(), player.spd.toString(), player.luck.toString()]
        ], {
            hasBorder: true,
            borderChars: "lightRounded",
            firstRowTextAttr: { bgColor: 'yellow', color: "black" },
            fit: true,
            expandToWidth: true,
        });
    }

    /** attack() method implemented with modifier to base damage.
     * Damages are multiplied by 2 or 4 according to race or class.
     */
    attack(player: Entity, Monster: Entity, damage: number, text: string[] = []): returnMod<number> {
        let { playerMultiplier, playerWeakness } = this.checkFighter(player, Monster);
        if (playerWeakness > 1) {
            text.push(red("Glancing Hit !"));
        } else if (playerMultiplier > 1) {
            text.push(green("Critical Hit !"));
        }            
        return {
            text: text,
            damage: (damage * playerMultiplier) / playerWeakness,
        }
    }

    /** mobAttack() implemented to modify damages with a multiplier based on race or class. */
    mobAttack(player: Entity, Monster: Entity, damage: number): number {
        let { playerMultiplier, playerWeakness } = this.checkFighter(player, Monster);
        return (damage * playerWeakness) / playerMultiplier;
    }

    /** Checks the entity race and class, 
     * then apply multipliers if the race or class of an entity is stronger or weaker than the other entity. 
     */
    checkFighter(player: Player, mob: Monster | Bosses) {
        let playerClass = this.class.find((classe) => classe.id === player.class);
        let playerRace = this.races.find((race) => race.id === player.race);
        let mobClass = this.class.find((classe) => classe.id === mob.class);
        let mobRace = this.races.find((race) => race.id === mob.race);
        let playerMultiplier = 1, playerWeakness = 1;
        console.clear();

        if (playerClass!.weaknesses.includes(mobClass!.id)) {
            playerWeakness *= 2;
        }

        if (playerRace!.weakness.includes(mobRace!.id)) {
            playerWeakness *= 2;
        }

        if (playerClass!.strengths.includes(mobClass!.id)) {
            playerMultiplier *= 2;
        }

        if (playerRace!.strength.includes(mobRace!.id)) {
            playerMultiplier *= 2;
        }
        return {
            playerMultiplier,
            playerWeakness,
        };
    }
}
