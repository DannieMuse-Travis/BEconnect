import { Schema, Document, model, Types } from 'mongoose';

// Define the interface for the Prayer Notification attributes
interface PrayerNotificationAttributes {
    message: string;
    createdAt: Date;
    recipients: Types.ObjectId[]; // Array of user IDs
}

// Define the interface for the Prayer Notification document (extends mongoose.Document)
interface PrayerNotificationDocument extends Document, PrayerNotificationAttributes {}

// Define the schema for the Prayer Notification model
const PrayerNotificationSchema = new Schema<PrayerNotificationDocument>({
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    recipients: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }] // Array of user IDs referencing the User model
});

// Create and export the Prayer Notification model
const PrayerNotificationModel = model<PrayerNotificationDocument>('PrayerNotification', PrayerNotificationSchema);

export default PrayerNotificationModel;
