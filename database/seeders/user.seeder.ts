import { Role, User } from "@models";
import { permission } from "@utils";
import "@controllers";

export default async function UserSeederSeeder() {
    // =========================>
    // ## Seed the application's database
    // =========================>
    
    const accesses = permission.getAccesses();
    const adminPermissions: string[] = [];
    const petugasPermissions: string[] = [];

    for (const feature of accesses) {
        for (const access of feature.accesses) {
            const permKey = `${feature.key}.${access.key}`;
            adminPermissions.push(permKey);
            
            if (feature.name.toLowerCase().includes("opname")) {
                petugasPermissions.push(permKey);
            }
        }
    }

    await (new Role).pump([
        {"name": "Admin", "permissions": JSON.stringify(adminPermissions)},
        {"name": "Petugas", "permissions": JSON.stringify(petugasPermissions)}
    ]);

    await (new User).pump([
        {"name": "Admin", "username": "admin", "password": "$2b$10$tPX5QhnM.vUEDmDpht6O4OarVyTh43NTxhkzFrNxfRijJ3uhSHcli", "role_id": 1},
        {"name": "Petugas", "username": "petugas", "password": "$2b$10$tPX5QhnM.vUEDmDpht6O4OarVyTh43NTxhkzFrNxfRijJ3uhSHcli", "role_id": 2}
    ]);
}
