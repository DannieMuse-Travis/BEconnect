// Import necessary modules and define types if needed
import { Schema, Document, model,Types } from 'mongoose';

// Define types for Journal Entry attributes
interface JournalEntryAttributes {
    title: string;
    content: string;
    createdAt: Date;
    userId: Types.ObjectId;
    privacy: 'public' | 'private'; // Example privacy options
}

// Define types for Journal Entry document (extends mongoose.Document)
interface JournalEntryDocument extends Document, JournalEntryAttributes {}

// Define Schema for Journal Entry
const JournalEntrySchema = new Schema<JournalEntryDocument>({
    title: { type: String, 
    required: true },
    content: { type: String, 
    required: true },
    createdAt: { type: Date,
     default: Date.now },
    userId: { type: Schema.Types.ObjectId, 
        ref: 'User', required: true },
    privacy: { type: String, enum:
         ['public', 'private'], default: 'private' }
});

// Create and export Journal Entry model
const JournalEntryModel = model<JournalEntryDocument>('JournalEntry', JournalEntrySchema);

export default JournalEntryModel;
