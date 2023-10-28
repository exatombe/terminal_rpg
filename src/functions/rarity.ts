import { Player } from "../interface";

export default function Rarity(entity: Player[]){
    let rarity50 = entity.filter((player) => player.rarity === 1);
    let rarity30 = entity.filter((player) => player.rarity === 2);
    let rarity15 = entity.filter((player) => player.rarity === 3);
    let rarity4 = entity.filter((player) => player.rarity === 4);
    let rarity1 = entity.filter((player) => player.rarity === 5);
    let raritySelector = Math.floor(Math.random() * 100);
    if(raritySelector>= 50){
        return rarity50[Math.floor(Math.random() * rarity50.length)];
    }else if(raritySelector >= 30){
        return rarity30[Math.floor(Math.random() * rarity30.length)];
    }else if(raritySelector >= 15){
        return rarity15[Math.floor(Math.random() * rarity15.length)];
    }else if(raritySelector >= 4){
        return rarity4[Math.floor(Math.random() * rarity4.length)];
    }else if(raritySelector >= 0){
        return rarity1[Math.floor(Math.random() * rarity1.length)];
    }
}