import { terminal } from "terminal-kit";
import GameManager, { GameManager as Gm } from "../classes/GameManager";
import Mods from "../classes/Mods";
import { Bosses, Menu, Monster, Player } from "../interface";
import * as modsLoaded from "./modsLoaded";
interface modsI {
    mods: string[];
}
/** Mod Manager mod.
 * We need to implement displayAttackOption().
 */
export class ModManager extends Mods {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    property: string[] = ["start"];
    modsSelected: string[] = [];

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Mod Manager");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }

    start(menuStart: Menu[]): Menu[] {
        menuStart.unshift({
            content: "Mod Manager",
            callback: async () => {
                await this.displayMods();
            }
        })
        return menuStart;
    }

    displayMods() {
            let modsAvailable = Object.values(modsLoaded).map((mod) => mod.getName());
            this.modsSelected = [...GameManager.mods.map((mod) => mod.getName().split(" ").join(""))];
            GameManager.mods = [];
            this.displayModsSelected(["Start","Back to game",...modsAvailable]);
    }

    promptUserForModSelection(modsAvailable: string[]) {
        terminal.singleColumnMenu(modsAvailable, (error, response) => {
            if (response.selectedText == "Start") {
                this.modsSelected.forEach((mod) => {
                    let modsToEnable = Object.values(modsLoaded).find((modLoaded) => modLoaded.getName() === mod);
                    if (modsToEnable) {
                        GameManager.addMod(new modsToEnable(this.players, this.mobs, this.boss));
                    }
                })
                GameManager.clear();
                GameManager.start();
            } else  if(response.selectedText == "Back to game"){
                this.modsSelected.forEach((mod) => {
                    let modsToEnable = Object.values(modsLoaded).find((modLoaded) => modLoaded.getName() === mod);
                    if (modsToEnable) {
                        GameManager.addMod(new modsToEnable(this.players, this.mobs, this.boss));
                    }
                })
                GameManager.displayCurrentTurn();
            }else{
                let checkIfModIsAlreadySelected = this.modsSelected.find((mod) => mod === response.selectedText);
                if(checkIfModIsAlreadySelected){
                    this.modsSelected.splice(this.modsSelected.indexOf(checkIfModIsAlreadySelected),1);
                }else{
                    this.modsSelected.push(response.selectedText);
                }
                this.displayModsSelected(modsAvailable);
            }
        });
    }

    displayModsSelected(modsAvailable: string[]){
        terminal.clear();
        terminal.table([
            ["Mod", "Status"],
            ...this.modsSelected.map((mod) => [mod, "Enabled"])
        ]);
        this.promptUserForModSelection(modsAvailable);
        

    }


}