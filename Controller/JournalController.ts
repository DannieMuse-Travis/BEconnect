import { Request, Response,NextFunction } from 'express';
import JournalEntryModel from "../Model/JournalModel";
import MainError from '../Errors/mainError';

// Define types for request body and response data if needed
interface JournalEntryRequestBody {
    title: string;
    content: string;
    userId: string;
    privacy?: 'public' | 'private';
}

// Controller function to create a new journal entry
export const createJournalEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content, userId, privacy } = req.body as JournalEntryRequestBody;

        // Create new journal entry
        const journalEntry = await JournalEntryModel.create({ title, content, userId, privacy });

        res.status(201).json({ success: true, data: journalEntry });
    } catch (error) {
        console.error('Error creating journal entry:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function to get all journal entries for a user
export const getJournalEntries = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Find journal entries for the specified user
        const journalEntries = await JournalEntryModel.find({ userId });

        res.status(200).json({ success: true, data: journalEntries });
    } catch (error) {
        console.error('Error fetching journal entries:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Controller function to edit a journal entry
export const editJournalEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, content, privacy } = req.body as JournalEntryRequestBody;

        // Update journal entry
        const updatedJournalEntry = await JournalEntryModel.findByIdAndUpdate(id, { title, content, privacy }, { new: true });

        if (!updatedJournalEntry) {
            res.status(404).json({ success: false, error: 'Journal entry not found' });
            return;
        }

        res.status(200).json({ success: true, data: updatedJournalEntry });
    } catch (error) {
        console.error('Error editing journal entry:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};


export const getOneJournal = async (req: Request, res: Response, next: NextFunction) => {
    try {
  
      const getJournal = await JournalEntryModel.findById(req.params.id);
    
       
      if (!getJournal) {
        return next(new MainError('No tour with that ID', 404));
      }
  
      return res.status(200).json({
        status: 'success',
        message: 'Data retrieved successfully',
        data: getJournal
      });
    } catch (error: any) {
      console.error('Invalid ID', error);
      return res.status(404).json({
        status: 'fail',
        message: error.message
      });
    }
  };


// Controller function to delete a journal entry
export const deleteJournalEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Delete journal entry
        const deletedJournalEntry = await JournalEntryModel.findByIdAndDelete(id);

        if (!deletedJournalEntry) {
            res.status(404).json({ success: false, error: 'Journal entry not found' });
            return;
        }

        res.status(200).json({ success: true, data: deletedJournalEntry });
    } catch (error) {
        console.error('Error deleting journal entry:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
