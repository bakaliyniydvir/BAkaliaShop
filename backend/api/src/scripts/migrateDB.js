const mongoose = require('mongoose');
const axios = require('axios');
const sharp = require('sharp');
const { v2: cloudinary } = require('cloudinary');
const stream = require('stream');
const util = require('util');

// MongoDB URIs
const OLD_DB = '';
const NEW_DB = '';

// Cloudinary config
const oldCloudinary = cloudinary.config({
    cloud_name: 'da1s0wrkj',
    api_key: '739287711489798',
    api_secret: 'kmGUWseT2cKNDXMeNSTBvej4i5U',
});
// bakaliyniydvirprod
// QzWdmzbqsIYQB2p0
const newCloudinary = {
    cloud_name: 'dxibg3lql',
    api_key: '911814289188964',
    api_secret: 'jIFX_qkxqYa1qH3Seik3b6rVmRI',
};

// Product schema (simplified)
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    minOrder: { type: Number, required: true, default: 1 },
    image: { type: String },
}, {
    timestamps: true
});

async function migrate() {
    const oldConn = await mongoose.createConnection(OLD_DB).asPromise();
    const newConn = await mongoose.createConnection(NEW_DB).asPromise();

    const OldProduct = oldConn.model('Product', productSchema);
    const NewProduct = newConn.model('Product', productSchema);

    const products = await OldProduct.find();
    console.log(`Found ${products.length} products.`);

    for (const product of products) {
        try {
            const url = product.image;
            const publicId = extractPublicId(url);

            // Download original image
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            let buffer = Buffer.from(response.data);

            // Compress if over 200KB
            if (buffer.length > 200 * 1024) {
                buffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();
            }

            // Upload to new Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream.bind(
                cloudinary.config(newCloudinary)
            );
            const pipeline = util.promisify(stream.pipeline);

            const uploadPromise = new Promise((resolve, reject) => {
                const passthrough = new stream.PassThrough();
                passthrough.end(buffer);
                uploadStream({ resource_type: 'image' }, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })(passthrough);
            });

            const result = await uploadPromise;

            // Update image URL
            const newProduct = { ...product.toObject(), image: result.secure_url };
            delete newProduct._id; // Let Mongo create a new one
            await NewProduct.create(newProduct);

            console.log(`Migrated: ${product.name}`);
        } catch (err) {
            console.error(`Error with ${product.name}:`, err.message);
        }
    }

    await oldConn.close();
    await newConn.close();
    console.log('Migration complete!');
}

function extractPublicId(url) {
    const parts = url.split('/');
    const file = parts.pop().split('.')[0];
    const folder = parts.slice(parts.indexOf('upload') + 1).join('/');
    return folder ? `${folder}/${file}` : file;
}

migrate();
