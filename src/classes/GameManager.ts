import { EventEmitter } from "events";
import Entity from "./Entity";
import Mod from "./Mods";
import { terminal } from "terminal-kit";
import Rarity from "../functions/rarity";
import { Menu, Monster, Player } from "../interface";
import { green, hidden, red } from "ansi-colors";
export class GameManager extends EventEmitter {
    mobsAvailable: Monster[] = [];
    playersAvailable: Player[] = [];
    BossesAvailable: Monster[] = [];
    players: Entity[] = [];
    mobs: Entity[] = [];
    floor: number = 1;
    mods: Mod[] = [];
    turn: number = 1;
    mobPlayed: Entity[] = [];
    currentFightPlayer: Entity | undefined = undefined;
    currentFightMob: Entity | undefined = undefined;
    defaultOptions: string[] = ["Attack", "Heal","Quit"];
    maxFloor: number = 10;
    constructor() {
        super();

        /** This handle the attack event. */
        this.on("attack", (player: Entity) => {
            console.clear();
            let consoleDefault: string[] = [];
            if (this.currentFightMob) {
                let attack = player.str;
                if (this.mods.length > 0) { // If there is mods,
                    let mod = this.mods.filter((mod) => mod.property.includes("attack")); // We check if the attack property is pushed.
                    if (mod.length > 0) {
                        mod.forEach((mod) => { // Then we loop through mods,
                            let { text, damage } = mod.attack(player, this.currentFightMob as Entity, attack); // We get new damages for each mod.
                            if (text instanceof Array) {
                                consoleDefault = consoleDefault.concat(text);
                            }
                            if (typeof damage === "number") {
                                attack = damage; // Attack damages are accumulated because for each mod we update attack.
                            }
                        });
                    }
                }

                this.currentFightMob = player.attack(this.currentFightMob, attack); // The main attack function.
                /** After the attack the ennemy dies or loses hp. */
                    if (this.currentFightMob) { 
                        if (this.currentFightMob?.hp === 0) {
                            if (this.mods.length > 0) {
                                let mod = this.mods.filter((mod) => mod.property.includes("victory"));
                                if (mod.length > 0) {
                                    mod.forEach((mod) => {
                                        let { entity, text } = mod.victory(player);
                                        if (entity instanceof Entity) {
                                            player = entity;
                                        }
                                        if (text instanceof Array) {
                                            consoleDefault = consoleDefault.concat(text);
                                        }

                                    });
                                    this.setCurrentFightPlayer(player);
                                }
                            }
                            consoleDefault.push(green(`${this.currentFightMob.name} has been defeated!`));
                            this.removeFightMob();
                        } else {
                            consoleDefault.push(`${this.currentFightMob?.name} has ${red(this.currentFightMob.hp.toString())} hp left!`);
                        }
                    }

               /** If there is no ennemy. */
            } else {
                if (this.mods.length > 0) {
                    let mod = this.mods.filter((mod) => mod.property.includes("victory"));
                    if (mod.length > 0) {
                        mod.forEach((mod) => {
                            let { entity, text } = mod.victory(player);
                            if (entity instanceof Entity) {
                                player = entity;
                            }
                            if (text instanceof Array) {
                                consoleDefault = consoleDefault.concat(text);
                            }

                        });
                        this.setCurrentFightPlayer(player);
                    }
                }
                consoleDefault.push(green(`The monster has been defeated!`));
            }
            let height = ((terminal.height / 2) - consoleDefault.length) - 1;
            console.log("\n".repeat(height > 0 ? height: 0));
            console.log(consoleDefault.map((e) => {
                return " ".repeat((terminal.width / 2) - (e.length / 2)) + e;
            }).join("\n"));
            setTimeout(() => {
            let specialMessage = "";
            if (!this.currentFightMob) {
                if (this.getFloor() == 3) {
                    specialMessage = `You have found a key !`
                } else if (this.getFloor() == 6) {
                    specialMessage = [`You have found the treasure chest, because you have the key you can open it !`, `You have found a special Key to open the door of the princess !`].join("\n");
                } else if (this.getFloor() == 8) {
                    specialMessage = `You have found the princess, you can now leave the castle with her !`;
                } else if (this.getFloor() == 9) {
                    specialMessage = [`..............`, `It was all a dream, you are still in the castle !, be prepared to encounter a Real fight !`].join("\n");
                }                    
                if(specialMessage.length > 0){
                    let length = (terminal.width / 2) - (specialMessage.length);
                    if(length < 0) length = 5;
                    specialMessage = " ".repeat(length) + specialMessage + " ".repeat(length);
                }
            }
            
            if (specialMessage.length > 0) {
                terminal.slowTyping(specialMessage, {
                    delay: 30,
                }).then(() => {
                    this.nextTurn();
                    this.displayCurrentTurn();
                });
            } else {
                this.nextTurn();
                this.displayCurrentTurn();
            }
        }, 1000);
        });

        /** This handle the heal. */
        this.on("heal", (player: Entity) => {
            player.heal();
            console.log("\n".repeat((terminal.height / 2) - 1));
            let msg = `${player.name} has ${red(player.hp.toString())} hp left!`
            console.log(" ".repeat((terminal.width / 2) - (msg.length / 2)) + msg);
            setTimeout(() => {
                this.nextTurn();
                this.displayCurrentTurn();
            }, 1000);
        });

        this.on("menu", (player: Entity) => {
            console.clear();
            terminal("Are you sure you want to exit? (y/n) ");
            terminal.yesOrNo({ yes: ['y', 'ENTER'], no: ['n'] }, (error, response) => {
                if (response) {
                    terminal.clear();
                    process.exit();
                } else {
                    console.clear();
                    this.displayCurrentTurn();
                }
            });
        });
    }

    addPlayer(player: Entity) {
        this.players.push(player);
    }

    addMob(mob: Entity) {
        this.mobs.push(mob);
    }

    
    start(){
        terminal.clear();
        let link = Rarity(this.playersAvailable);
        if (link) {
            let player = new Entity(link);
            this.addPlayer(player);    
        }
        let menuStart: Menu[] = [];
        if(this.mods.length > 0){
            let mod = this.mods.filter((mod) => mod.property.includes("start"));
            if(mod.length > 0){
                mod.forEach((mod) => {
                    menuStart = mod.start(menuStart);
                });
            }
        }

        if(menuStart.length > 0){
            console.log("Welcome to the Hyrule Castle !");
            terminal.singleRowMenu(menuStart.map(e => e.content), (error, response) => {
                if(error){
                    console.log(error);
                }
                if (response) {
                    let callback = menuStart.find((e) => e.content === response.selectedText);
                    if (callback) {
                        callback.callback();
                    }
                }
            });
        }else{
            this.historyStart();
        }
    }

    clear(){
        this.mobs = [];
        this.players = [];
        this.floor = 1;
        this.currentFightMob = undefined;
        this.currentFightPlayer = undefined;
        this.turn = 1;
        this.maxFloor = 10;
        this.mobPlayed = [];
    }

    historyStart(){
        this.floor = 1;
        this.currentFightMob = undefined;
        this.currentFightPlayer = undefined;
        this.turn = 1;
        terminal.slowTyping("Welcome to the Hyrule Castle, " + this.players[0].name + " !\n", {
            flashStyle: terminal.brightYellow,
            delay:50,
        }).then(() => {
            terminal.slowTyping("You are now in the castle, you can explore it, and fight monsters !\n", {
                delay: 50,
            }).then(() => {
                terminal.slowTyping("You will need to defeat 9 monsters and find hidden objects !\nAfter that, you will win the right to leave the castle with zelda !\n", {
                    delay: 40,
                }).then(() => {
                    this.displayCurrentTurn();
                });
            });
        });
        
    }

    addMod(mod: Mod) {
        mod.enable();
        this.mods.push(mod);
    }
    removePlayer(name: string) {
        this.players = this.players.filter((player) => player.name !== name);
    }

    setPlayerAvailable(players: Player[]) {
        this.playersAvailable = players;
    }

    setMobsAvailable(mobs: Monster[]) {
        this.mobsAvailable = mobs;
    }

    setBossesAvailable(bosses: Monster[]) {
        this.BossesAvailable = bosses;
    }
    removeMob(name: string) {
        this.mobs = this.mobs.filter((mob) => mob.name !== name);
    }

    getPlayer(name: string) {
        return this.players.find((player) => player.name === name);
    }

    getMob(name: string) {
        return this.mobs.find((mob) => mob.name === name);
    }

    setCurrentFightPlayer(player: Entity) {
        this.currentFightPlayer = player;
    }

    removeFightPlayer() {
        this.currentFightPlayer = undefined;
    }
    setCurrentFightMob(mob: Entity) {
        this.currentFightMob = mob;
    }
    removeFightMob() {
        this.currentFightMob = undefined;
    }

    changeFloor() {
        this.floor++;
    }

    getFloor() {
        return this.floor;
    }

    isPlayerTurn() {
        return this.turn === 1;
    }

    isMobTurn() {
        return this.turn === 2;
    }

    isTurn() {
        if (this.turn === 1) {
            return true;
        } else {
            return false;
        }
    }

    nextTurn() {
        this.turn++;
        if (this.turn > 2) {
            this.turn = 1;
        }
        if (this.players.length > 0) {
            let checkIfAlivePlayer = this.players.find((player) => player.hp > 0);
            if (!checkIfAlivePlayer) {
                terminal.red("Game Over !\n");
                return process.exit();
            }
        }
        if (!this.currentFightMob) {
            this.floor++;
            this.turn = 1;
            if (this.getFloor() > this.maxFloor) {
                terminal.clear();
                terminal.green.slowTyping("You have defeated all the monsters and found the princess, you can now leave the castle with her !\n", {
                    delay: 100,
                    flashStyle: terminal.brightGreen,
                }).then(() => {
                    terminal.green.slowTyping("You have won the game !\n", {
                        delay: 100,
                        flashStyle: terminal.brightGreen,
                    }).then(() => {
                        terminal.green.slowTyping("Thanks for playing !\n", {
                            delay: 100,
                            flashStyle: terminal.brightGreen,
                        }).then(() => {
                            process.exit();
                        });
                    });
                });
            } else {
                this.setCurrentFightMob(this.getNextMob());
                if (this.mods.length > 0) {
                    let mod = this.mods.filter((mod) => mod.property.includes("firstTurn"));
                    if (mod.length > 0) {
                        mod.forEach((mod) => {
                            this.turn = mod.firstTurn(this.turn);
                        });
                    }
                }
            }
        }
    }

    getTurn() {
        return this.turn;
    }

    getNextMob() {
        let mobToFight = new Entity(Rarity(this.mobsAvailable) as Monster);
        let bossToFight = new Entity(Rarity(this.BossesAvailable) as Monster);
        if (this.getFloor() % 10 === 0) {
            mobToFight = bossToFight;
        }
        if (this.mods.length > 0) {
            let mod = this.mods.filter((mod) => mod.property.includes("mobToFight"));
            if (mod.length > 0) {
                mod.forEach((mod) => {
                    mobToFight = mod.mobToFight(mobToFight);
                });
            }
        }
        return mobToFight;
    }



    displayCurrentTurn() {
        terminal.clear();
        let nameFloor = `Floor #${this.floor}`;
        console.log("\n" + " ".repeat((terminal.width / 2) - nameFloor.length) + nameFloor + "\n");
        if (!this.currentFightMob && !this.currentFightPlayer) {
            let mobToFight = this.getNextMob();
            this.setCurrentFightMob(mobToFight);
            this.setCurrentFightPlayer(this.players[0]);
        }
        if (this.isMobTurn()) {
            this.displayMobTurn();
        } else {
            this.displayPlayerTurn();
        }
    }

    displayFightersLife() {
        if (this.currentFightPlayer && this.currentFightMob) {
            let mobLife = this.currentFightMob.displayLife();
            let playerLife = this.currentFightPlayer.displayLife();
            let countSpaceBetween = terminal.width - (mobLife.length + playerLife.length);
            let spaceBetween = countSpaceBetween > 0 ? " ".repeat(countSpaceBetween) : "\n";
            console.log(mobLife + spaceBetween + playerLife);
        }
    }

    displayPlayerTurn() {
        if (this.currentFightPlayer && this.currentFightMob) {
            this.displayFightersLife();
            this.displayAttackOptions(this.currentFightPlayer);
        }
    }

    displayMobTurn() {
        if (this.currentFightMob && this.currentFightPlayer) {
            this.displayFightersLife();
            setTimeout(() => {
                if (this.currentFightPlayer && this.currentFightMob) {
                    let attack = this.currentFightMob.str;
                    if (this.mods.length > 0) {
                        let mod = this.mods.filter((mod) => mod.property.includes("mobAttack"));
                        if (mod.length > 0) {
                            mod.forEach((mod) => {
                                attack = mod.mobAttack(this.currentFightPlayer as Entity, this.currentFightMob as Entity, attack);
                            });
                        }
                    }
                    this.currentFightPlayer = this.currentFightMob.attack(this.currentFightPlayer, attack);
                    if (this.currentFightPlayer) {
                        let msg = `${this.currentFightPlayer.name} has ${red(this.currentFightPlayer.hp.toString())} hp left!`
                        console.log("\n".repeat((terminal.height / 2) - 3));
                        console.log(" ".repeat((terminal.width / 2) - (msg.length / 2)) + msg);
                    }
                    setTimeout(() => {
                        this.nextTurn();
                        this.displayCurrentTurn();
                    }, 1000);
                }
            }, 1000);
        }
    }

    defaultMenuManage(menu: string) {
        if (this.currentFightPlayer) {
            if (menu === "Attack") {
                this.emit("attack", this.currentFightPlayer);
            } else if (menu === "Heal") {
                this.emit("heal", this.currentFightPlayer);
            } else if (menu === "Quit") {
                this.emit("menu", this.currentFightPlayer);
            }
        }
    }

    displayAttackOptions(player: Entity) {
        let menu: Menu[] = this.defaultOptions.map((option) => {
            return {
                content: option,
                callback: () => {
                    this.defaultMenuManage(option);
                }
            }
        });
        
        if (this.mods.length > 0) {
            let mod = this.mods.filter((mod) => mod.property.includes("displayAttackOptions"));
            if (mod.length > 0) {
                mod.forEach((mod) => {
                    menu = mod.displayAttackOptions(player, menu);
                });
            }

            let ModofStart = this.mods.filter((mod) => mod.property.includes("start"));
            if (ModofStart.length > 0) {
                menu.push({
                    content: "Menu",
                    callback: () => {
                        this.start();
                    }
                });
            }
        };

        terminal.singleRowMenu(menu.map(e => e.content), (error, response) => {
            if (response) {
                let callback = menu.find((e) => e.content === response.selectedText);
                if (callback) {
                    callback.callback();
                }
            }
        });
        let height = terminal.height - 13;
        process.stdout.write("\n".repeat(height > 0 ? height : 0)); 3
        terminal.table([
            [" Name", " Hp", " Mp", " Str", " Int", " Def", " Res", " Spd", " Luck"],
            [player.name, player.hp.toString(), player.mp.toString(), player.str.toString(), player.int.toString(), player.def.toString(), player.res.toString(), player.spd.toString(), player.luck.toString()]
        ], {
            hasBorder: true,
            borderChars: "lightRounded",
            firstRowTextAttr: { bgColor: 'yellow', color: "black" },
            expandToWidth: true,
        });
    }

}

export default new GameManager();