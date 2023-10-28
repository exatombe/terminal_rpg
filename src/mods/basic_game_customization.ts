import { terminal } from "terminal-kit";
import GameManager from "../classes/GameManager";
import Mods from "../classes/Mods";
import { Bosses, Menu, Monster, Player, returnMod } from "../interface";
import Entity from "../classes/Entity";

/** Better Combat Option mod.
 * We need to implement displayAttackOption().
 */
export class BasicGameCustomization extends Mods {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    difficulty: number = 1;
    property: string[] = ["start", "mobToFight","victory"];
    playerCoins: number = 12;

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Basic Game Customization");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }
    
    victory(player: Entity, text: string[] = []): returnMod<Entity> {
        this.playerCoins += 1;
        text?.push(`You won 1 coin ! You now have ${this.playerCoins} coins !`);
        return {
            text: text || [],
            damage: player,
        }
    }

    start(menuStart: Menu[]): Menu[] {
        menuStart.unshift({
            content: "Quit",
            callback: () => {
                terminal.clear();
                process.exit();
            }
        })
        menuStart.unshift({
            content: "New Game",
            callback: () => {
                this.displayDifficulty();
            }
        })

        

        return menuStart;
    }

    displayDifficulty() {
        terminal.clear();
        console.log("Choose the difficulty you want to play !");
        terminal.singleColumnMenu(["Normal", "Difficult", "Insane"], (error, response) => {
            if (response.selectedText == "Normal") {
                this.difficulty = 1;
            } else if (response.selectedText == "Difficult") {
                this.difficulty = 1.5;
            } else if (response.selectedText == "Insane") {
                this.difficulty = 2;
            }
            this.chooseNumberOfFloors();
        });
    }

    chooseNumberOfFloors() {
        terminal.clear();
        console.log("Choose the number of floors you want to play !");
        terminal.singleColumnMenu(["10", "20", "50", "100"], (error, response) => {
            GameManager.maxFloor = parseInt(response.selectedText);
            GameManager.historyStart();
        });
    }

    mobToFight(mobToFight: Entity): Entity {
        // multiply each mob stats by the difficulty
        mobToFight.hp *= this.difficulty;
        mobToFight.maxHp *= this.difficulty;
        mobToFight.str *= this.difficulty;
        mobToFight.def *= this.difficulty;
        mobToFight.luck *= this.difficulty;
        mobToFight.res *= this.difficulty;
        mobToFight.spd *= this.difficulty;
        mobToFight.mp *= this.difficulty;
        return mobToFight;
    }
}