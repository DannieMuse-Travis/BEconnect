import { Request, Response } from 'express';
import PrayerNotificationModel from "../Model/PrayerModel"

// Define types for request body and response data if needed
interface CreatePrayerNotificationRequest {
    message: string;
    recipients: string[]; // Array of user IDs
}

// Controller function to create a new prayer notification
export const createPrayerNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, recipients } = req.body as CreatePrayerNotificationRequest;

        // Create new prayer notification
        const prayerNotification = await PrayerNotificationModel.create({ message, recipients });

        res.status(201).json({ success: true, data: prayerNotification });
    } catch (error) {
        console.error('Error creating prayer notification:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function to get all prayer notifications
export const getAllPrayerNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        // Find all prayer notifications
        const prayerNotifications = await PrayerNotificationModel.find();

        res.status(200).json({ success: true, data: prayerNotifications });
    } catch (error) {
        console.error('Error fetching prayer notifications:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function to delete a prayer notification
export const deletePrayerNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Delete prayer notification
        const deletedPrayerNotification = await PrayerNotificationModel.findByIdAndDelete(id);

        if (!deletedPrayerNotification) {
            res.status(404).json({ success: false, error: 'Prayer notification not found' });
            return;
        }

        res.status(200).json({ success: true, data: deletedPrayerNotification });
    } catch (error) {
        console.error('Error deleting prayer notification:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
