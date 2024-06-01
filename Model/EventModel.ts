import { Schema, Document, model, Types } from 'mongoose';

// Define the interface for the Event attributes
interface EventAttributes {
    title: string;
    photo:string;
    description: string;
    dateTime: Date;
    location: string;
    startDates:Date;
    createdAt:Date;
    registrationStatus: boolean;
    registeredUsers: Types.ObjectId[]; // Array of user IDs
}

// Define the interface for the Event document (extends mongoose.Document)
interface EventDocument extends Document, EventAttributes {}

// Define the schema for the Event model
const EventSchema = new Schema<EventDocument>({
    title: { type: String, required: true },
    photo:{types:String,},
    description: { type: String, required: true },
    dateTime: { type: Date, required: true },
    location: { type: String, required: true },
    registrationStatus: { type: Boolean, default: true }, // Default to open registration
    registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Array of user IDs referencing the User model
});

// Create and export the Event model
const EventModel = model<EventDocument>('Event', EventSchema);

export default EventModel;
