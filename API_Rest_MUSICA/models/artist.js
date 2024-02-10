const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ArtistSchema = Schema({
    name: {
        type: String,
        required: true
    },
    desciption: String,
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
ArtistSchema.plugin(mongoosePaginate);

module.exports = model('Artist', ArtistSchema, 'artists');