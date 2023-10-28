import { Bosses, EntityI, Monster, Player } from "../interface";
import { blue, green, magenta, red } from "ansi-colors";
import * as fs from "fs";
import { terminal } from "terminal-kit";

/**
 * This class handle the entitites.
 */
export default class Entity implements EntityI {
  public id: number;
  name: string;
  hp: number;
  mp: number;
  str: number;
  int: number;
  def: number;
  res: number;
  spd: number;
  luck: number;
  race: number;
  class: number;
  rarity: number;
  maxHp: number;
  constructor(stats: EntityI) {
    this.id = stats.id;
    this.name = stats.name;
    this.hp = stats.hp;
    this.mp = stats.mp;
    this.str = stats.str;
    this.int = stats.int;
    this.def = stats.def;
    this.res = stats.res;
    this.spd = stats.spd;
    this.luck = stats.luck;
    this.race = stats.race;
    this.class = stats.class;
    this.rarity = stats.rarity;
    this.maxHp = stats.hp;
  }

  /** This is the main attack function, it can takes damages returned by other functions.
   * It returns an entity.
   */
  public attack(entity: Entity, damage: number) {
    entity.hp -= damage;
    if (entity.hp < 0) {
      entity.hp = 0;
    }

    return entity;
  }

  /** This is the main heal function, it can takes hp as arguments (health potions) */
  public heal(pv?: number) {
    if (this.hp < this.maxHp) {
      this.hp += pv ? pv : (this.maxHp / 2);

      if (this.hp > this.maxHp) {
        this.hp = this.maxHp;
      }
    }
  }

  /* This function display the life bar of the current entity. */
  public displayLife() {
    let lenght = 40;
    let lifeFull = "█".repeat(Math.round((this.hp / this.maxHp) * lenght));
    let lifeEmpty = "░".repeat(lenght - lifeFull.length);
    let life = lifeFull + lifeEmpty;
    let monsters = JSON.parse(fs.readFileSync("./json/enemies.json", "utf8")) as Monster[];
    let bosses = JSON.parse(fs.readFileSync("./json/bosses.json", "utf8")) as Bosses[];
    let player = JSON.parse(fs.readFileSync("./json/players.json", "utf8")) as Player[];
    let colors = monsters.find((monster) => monster.name === this.name) ? red : bosses.find((boss) => boss.name === this.name) ? magenta : player.find((player) => player.name === this.name) ? blue : green;
    let displaylife = [this.name, colors(life), this.hp + "/" + this.maxHp].join("|");
    return displaylife;
  }
}
