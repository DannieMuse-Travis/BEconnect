import { Request, Response,NextFunction} from 'express';
import EventModel from '../Model/EventModel';
import MainError from '../Errors/mainError';

// Controller function to create a new event
export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const {phote, title, description, dateTime, location, registrationStatus } = req.body;

        // Create new event
        const event = await EventModel.create({ phote,title, description, dateTime, location, registrationStatus });

        res.status(201).json({ success: true, data: event });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function to get all events
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        // Find all events
        const events = await EventModel.find();

        res.status(200).json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const getOneEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
  
      const Event = await EventModel.findById(req.params.id);
    
       
      if (!Event) {
        return next(new MainError('No tour with that ID', 404));
      }
  
      return res.status(200).json({
        status: 'success',
        message: 'Data retrieved successfully',
        data: Event
      });
    } catch (error: any) {
      console.error('Invalid ID', error);
      return res.status(404).json({
        status: 'fail',
        message: error.message
      });
    }
  };


// Controller function to delete an event
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Delete event
        const deletedEvent = await EventModel.findByIdAndDelete(id);

        if (!deletedEvent) {
            res.status(404).json({ success: false, error: 'Event not found' });
            return;
        }

        res.status(200).json({ success: true, data: deletedEvent });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
