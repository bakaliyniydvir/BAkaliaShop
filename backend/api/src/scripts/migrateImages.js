const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

async function uploadBuffer(buffer, publicId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'products', public_id: publicId },
            (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(buffer);
    });
}

async function migrate() {
    await connectDB();
    console.log('✅ MongoDB connected');
    const products = await Product.find({ imageData: { $exists: true, $ne: '' } });
    console.log(`🔄 Found ${products.length} products to migrate…`);

    for (const p of products) {
        try {
            const buf = Buffer.from(p.imageData, 'base64');
            const { secure_url } = await uploadBuffer(buf, p._id.toString());
            p.image = secure_url;
            p.imageData = undefined;
            p.imageType = undefined;
            await p.save();
            console.log(`✔️  ${p._id} → ${secure_url}`);
        } catch (err) {
            console.error(`❌ Error migrating ${p._id}:`, err.message);
        }
    }

    console.log('🎉 Migration complete');
    process.exit(0);
}

migrate();
