const {Schema, model} = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PublicationSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
        required: true
    },
    file: {
        type: String,
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

// Registra el plugin de paginación en el esquema
PublicationSchema.plugin(mongoosePaginate);

module.exports = model("Publication", PublicationSchema, "publications");