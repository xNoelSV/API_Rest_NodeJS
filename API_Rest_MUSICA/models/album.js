const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const AlbumSchema = Schema({
    artist: {
        type: Schema.ObjectId,
        ref: "Artist"
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    year: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: "default.png"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Le aplicamos la paginación
AlbumSchema.plugin(mongoosePaginate);

module.exports = model("Album", AlbumSchema, "albums");