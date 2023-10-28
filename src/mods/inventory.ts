import { terminal } from "terminal-kit";
import Entity from "../classes/Entity";
import Mod from "../classes/Mods";
import { Bosses, Menu, Monster, Player, returnMod } from "../interface";
import GameManager from "../classes/GameManager";

interface Item{
    name: string;
    damage?:number;
    hp?:number;
}

export class Inventory extends Mod {
    players: Player[];
    mobs: Monster[];
    boss: Bosses[];
    property: string[] = ["displayAttackOptions", "attack", "victory"];
    inventory: Item[] = [];
    potionUsed?:Item|undefined;

    constructor(players: Player[], mobs: Monster[], boss: Bosses[]) {
        super("Inventory");
        this.players = players;
        this.mobs = mobs;
        this.boss = boss;
    }

    displayAttackOptions(player: Bosses, menu: Menu[], text?: string[] | undefined): Menu[] {
        menu.unshift({
            content: "Inventory",
            callback: () => {
                this.displayInventory();
            }
        })
        
        return menu;
    }

    victory(player: Entity, text: string[]= []): returnMod<Entity> {
        text.push(this.dropItem());
        return {
            text,
            entity: player
        }
    }

    dropItem() {
        let item: Item ={
            name: "Potion",
        }
        
        let rand = Math.floor(Math.random()*50);
        Math.round(Math.random()) === 0 ? (item.damage = rand) : (item.hp = rand);
        let msg = "";
        if (item.damage) {
            item.name = "Damage potion("+rand+")";
            msg = "You received a damage potion";
        }else if(item.hp){
            item.name = "Heal potion("+rand+")";
            msg = "You received a heal potion";
        }
        this.inventory.push(item);
        return msg;
    }

    displayInventory() {
        console.clear();
        let menu = this.inventory.map(item => item.name);
        menu.push("Back");
        terminal.gridMenu(menu, (error, response) => {
            if (response) {
                if(response.selectedText == "Back"){
                    GameManager.displayCurrentTurn();
                }else{
                    let potion = this.inventory.find(popo => popo.name == response.selectedText);
                    if(potion){
                        this.inventory = this.inventory.filter(popo => popo.name !== response.selectedText);
                        // actions sur l'ennemie...
                        if(potion.damage){
                            this.potionUsed = potion;
                            console.log(this.potionUsed);
                            GameManager.emit("attack",GameManager.currentFightPlayer);
                        }else if(potion.hp){
                            let player = GameManager.currentFightPlayer;
                            if(player){
                                player.heal(potion.hp);
                                GameManager.setCurrentFightPlayer(player);
                            }
                            console.clear();
                            console.log(`The potion ${potion.name} as been used and healed ${potion.hp} HP`);
                            setTimeout(() => {
                                GameManager.nextTurn();
                                GameManager.displayCurrentTurn();
                            }, 1000);
                        }
                    }
                }
            }
        });
    }

    attack(player: Entity, Monster: Entity, damage: number, text: string[]= []):returnMod<number> {
        if (this.potionUsed?.damage) {
            text.push(`The potion ${this.potionUsed.name} as been used and infliged ${this.potionUsed.damage}`)
            damage = this.potionUsed.damage;
            this.potionUsed = undefined;
        }
        return {
            text:text|| [],
            damage
        }
    }

}