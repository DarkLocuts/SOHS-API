import { Location } from "@models";
import "@controllers";

export default async function LocationSeeder() {
    // =========================>
    // ## Seed the application's database
    // =========================>
    
    await (new Location).pump([
        { "name": "Ruang A", "code": "SOHSL/RUANGA" },
        { "name": "Ruang B", "code": "SOHSL/RUANGB" },
    ]);
}
