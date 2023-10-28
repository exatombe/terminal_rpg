import Entity from "./classes/Entity";
import { readFileSync, readdirSync } from "fs";
import { Monster, Player } from "./interface";
import { terminal } from "terminal-kit";
import { prompt } from "enquirer";
import GameManager from "./classes/GameManager";
import Rarity from "./functions/rarity";
import * as modsLoaded from "./mods/modsLoaded";
let players = JSON.parse(readFileSync("./json/players.json", "utf8")) as Player[];
let mobs = JSON.parse(readFileSync("./json/enemies.json", "utf8")) as Monster[];
let boss = JSON.parse(readFileSync("./json/bosses.json", "utf8")) as Monster[];
terminal.clear();
terminal.windowTitle("Hyrule Castle");
terminal.iconName("Hyrule Castle");
GameManager.setBossesAvailable(boss);
GameManager.setMobsAvailable(mobs);
GameManager.setPlayerAvailable(players);
let modsAvailable = Object.values(modsLoaded).map((mod) => mod.getName());
// Load an image, then ask for mod and start the game.
terminal.drawImage("./images/intro.jpg", {
    shrink: {
        width: terminal.width,
        height: terminal.height
    }
}).then(() => {
    setTimeout(() => {
        let height = (terminal.height / 2) - (modsAvailable.length+2)
        console.log("\n".repeat(height > 0 ? height : 0));
        console.clear();

        let mods = prompt({
            name: "mods",
            type: "multiselect",
            choices: modsAvailable,
            message: "Choose your mods",
            linebreak: true,
            edgeLength: terminal.width / 2,
        })

        interface modsI {
            mods: string[];
        }

        mods.then((answer) => {
            if (answer) {
                let modsEnabled = answer as modsI;
                modsEnabled.mods.forEach((mod) => {
                    let modsToEnable = Object.values(modsLoaded).find((modLoaded) => modLoaded.getName() === mod);
                    if (modsToEnable) {
                        GameManager.addMod(new modsToEnable(players, mobs, boss));
                    }
                })
            }
            GameManager.start();
        })

        process.on("uncaughtException", (err) => {
            console.log("Exciting...", err);
            process.exit();
        });
    },1000);
});
terminal.on('key', function (name: any, matches: any, data: any) {
    if (name === 'CTRL_C') {
        terminal.processExit(0);
    }
});
