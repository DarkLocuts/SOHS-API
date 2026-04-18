import { Product, ProductLabel, ProductLocation } from "@models"
import { db } from "@utils"

export const ProductLabelService = {
    get: async (productIds?: number[]) => { 
        const query = ProductLabel.query().with('product').with('location')
        if (productIds && productIds.length > 0) {
            query.whereIn('product_id', productIds)
        }
        return await query.get()
    },
    generate: async (payload: { product_id: number; last_number: number }[]) => {
        const generatedLabels: any[] = [];

        await db.transaction(async (trx) => {
            for (const item of payload) {
                const product = await Product.query().where('id', item.product_id).getFirst();
                if (!product) continue;

                const oldLastSequence = product.last_sequence || 0;

                product.last_sequence = item.last_number;

                try {
                    await product.save()
                } catch (error) {
                    throw error
                }
                
                for (let seq = oldLastSequence + 1; seq <= item.last_number; seq++) {
                    const paddedSeq = String(seq).padStart(4, "0");
                    const label = await ProductLabel.create({
                        product_id  :  item.product_id,
                        sequence    :  seq,
                        code        :  `SOHSS/${product.code}/${paddedSeq}`
                    });

                    generatedLabels.push(label);
                }
            }
        });

        return generatedLabels;
    },
}
