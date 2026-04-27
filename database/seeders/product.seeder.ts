import { Category, Brand, Product } from "@models";
import * as xlsx from "xlsx";
import * as path from "path";

export default async function ProductSeeder() {
    // =========================>
    // ## Seed the application's database
    // =========================>

    const excelPath = path.join(__dirname, "source", "sku-hs.xlsx");
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

    let category = await Category.query().where('name', 'Semua Jenis').getFirst() as Category;
    if (!category) {
        category = await Category.create({ name: "Semua Jenis" }) as Category;
    }

    const brandMap = new Map<string, Brand>();
    const productsToInsert: any[] = [];

    const uniqueCodes = new Set<string>();

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        let code = row[1] ?? null;
        let name = row[2] ?? null;
        let brandName = row[3] ?? null;

        if (code === null && name === null && brandName === null) continue;

        if (typeof name === "string") {
            name = name.replace(/[\t\r\n]/g, "").trim();
        }

        if (typeof code === "string") {
            code = code.trim();
        }

        if (code) {
            if (uniqueCodes.has(code)) {
                continue;
            }
            uniqueCodes.add(code);
        }

        let brandId: number | null = null;
        if (brandName && typeof brandName === "string" && brandName.trim() !== "") {
            brandName = brandName.trim();
            if (!brandMap.has(brandName)) {
                let dbBrand = await Brand.query().where('name', brandName).getFirst() as Brand;
                if (!dbBrand) {
                    dbBrand = await Brand.create({ name: brandName }) as Brand;
                }
                brandMap.set(brandName, dbBrand);
            }
            brandId = brandMap.get(brandName)!.id;
        }

        productsToInsert.push({
            code: code,
            name: name,
            brand_id: brandId,
            category_id: category.id,
            stock: 0,
            last_sequence: 0
        });
    }

    const chunkSize = 200;
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
        const chunk = productsToInsert.slice(i, i + chunkSize);
        await (new Product).pump(chunk);
    }

    // let category = await Category.query().where('name', 'Furnitur').getFirst() as Category;
    // if (!category) {
    //     category = await Category.create({ name: "Furnitur" }) as Category;
    // }

    // let brand = await Brand.query().where('name', 'HS').getFirst() as Brand;
    // if (!brand) {
    //     brand = await Brand.create({ name: "HS" }) as Brand;
    // }

    // await (new Product).pump([
    //     { code: "HS00000000001", name: "Kursi MARKUS", brand_id: brand.id, category_id: category.id, stock: 10, last_sequence: 0 },
    //     { code: "HS00000000002", name: "Meja MALM", brand_id: brand.id, category_id: category.id, stock: 5, last_sequence: 0 },
    //     { code: "HS00000000003", name: "Lemari BILLY", brand_id: brand.id, category_id: category.id, stock: 8, last_sequence: 0 },
    //     { code: "HS00000000004", name: "Lampu HEKTAR", brand_id: brand.id, category_id: category.id, stock: 15, last_sequence: 0 },
    //     { code: "HS00000000005", name: "Sofa Klippan", brand_id: brand.id, category_id: category.id, stock: 3, last_sequence: 0 },
    // ]);
}
