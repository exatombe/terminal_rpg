import { Menu, Player, returnMod } from "../interface";
import Entity from "./Entity";

/** This class handle the mods. It defines method to implement in each mods.
 * name: name of the mod.
 * enable: activated or not.
 * property: properties/methods to use.
 */
export default abstract class Mod{

  
    name: string;
    enabled: boolean;
    property: string[] = [];
    constructor(name:string){
        this.name = name;
        this.enabled = false;
    }

    public static getName(){
        return this.name;
    }
    public getName(){
        return this.name;
    }
    
    public isEnabled(){
        return this.enabled;
    }

    public enable(){
        this.enabled = true;
    }

    public disable(){
        this.enabled = false;
    }

    /**
     * 
     * @param menuStart The menu to display at the start of the game
     */
    start(menuStart: Menu[]): Menu[] {
        throw new Error("Method not implemented.");
    }

    /** This method returns player entity damages that will be passed as argument for the main attack function */
    attack(player: Entity, Monster: Entity, damage: number, text?:string[]):returnMod<number|string[]> {
        throw new Error("Method not implemented.");
        return {
            text: text || [],
            damage: damage,        
        }
    }; 

    /** This method returns ennemi entity damages that will be passed as argument for the main attack function */
    mobAttack(player: Entity, Monster: Entity, damage: number, text?:string[]):number{
        throw new Error("Method not implemented.");
        return damage;
    };

    /** This method have to be called when an ennemi entity dies and before changing floor */
    victory(player: Entity, text?:string[]):returnMod<Entity> {
        throw new Error("Method not implemented.");
        return {
            text: text || [],
            entity: player,
        }
    }

    /** The ennemi entity to target */
    mobToFight(mobToFight: Entity): Entity {
        throw new Error("Method not implemented.");
    }

    /** Display the attack menu and options */
    displayAttackOptions(player: Player, menu:Menu[], text?:string[]):Menu[] {
        throw new Error("Method not implemented.");
        return menu;
    }

    firstTurn(turn: number):number {
        throw new Error("Method not implemented.");
        return turn;
    }
}