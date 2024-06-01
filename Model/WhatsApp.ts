import { Schema, Document, model, Types } from 'mongoose';

// Define the interface for the WhatsApp Group attributes
interface WhatsAppGroupAttributes {
    groupName: string;
    description: string;
    joinLink: string;
    centerAffiliation: string;
    members: Types.ObjectId[]; // Array of user IDs
}

// Define the interface for the WhatsApp Group document (extends mongoose.Document)
interface WhatsAppGroupDocument extends Document, WhatsAppGroupAttributes {}

// Define the schema for the WhatsApp Group model
const WhatsAppGroupSchema = new Schema<WhatsAppGroupDocument>({
    groupName: { type: String, required: true },
    description: { type: String, required: true },
    joinLink: { type: String, required: true },
    centerAffiliation: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Array of user IDs referencing the User model
});

// Create and export the WhatsApp Group model
const WhatsAppGroupModel = model<WhatsAppGroupDocument>('WhatsAppGroup', WhatsAppGroupSchema);

export default WhatsAppGroupModel;
