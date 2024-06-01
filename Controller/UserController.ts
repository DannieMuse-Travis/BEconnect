import express,{Application,Request,Response,NextFunction} from "express"
import multer from "multer";
import UserModel from "../Model/UserModel";
import MainError from "../Errors/mainError"
import { asyncMiddleware } from "../Errors/CatchAsync";
import { CustomRequest } from "./AuthController";
import { FileFilterCallback } from 'multer';

const multerStorage = multer.diskStorage({
    destination: (req: CustomRequest, file, cb) => {
        cb(null, "/BE/Upload");
    },
    filename: (req: CustomRequest, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});

const multerFiler = (req: CustomRequest, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        const error = new MainError('not an image, please upload image', 400);
        cb(error as any, false);

    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFiler
});


export const  UploadUserPhoto = upload.single(`photo`);


const filterObj = (obj: Record<string, any>, ...allowfield: string[]) => {
  const newObj: Record<string, any> = {}; // Declare newObj outside the loop

  if (allowfield.length === 0) {
    return obj; // Return original object if allowfield is empty
  }

  Object.keys(obj).forEach(el => {
    if (allowfield.includes(el)) {
      newObj[el] = obj[el]; // Assign the property to newObj
    }
  });

  return newObj; // Return filtered object
};


// User Router
export const getAllUser = asyncMiddleware (async (req: Request, res: Response) => {
  
  const users = await UserModel.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  })

    
  
})

export const UpdateMe = asyncMiddleware(async (req: CustomRequest, res: Response, next: NextFunction) => {
  if (req.body.password || req.body.passwordconfirm) {
      return next(new MainError(`This route is not for password update, please use /updateMypass`, 400));
  }

  const filterBody = filterObj(req.body, 'name', 'email');
     if(req.file) filterBody.photo = req.file.filename
  const UpdateUser = await UserModel.findByIdAndUpdate(req.user.id, filterBody, {
      new: true,
      runValidators: true
  });

  res.status(200).json({
      message: 'Update has been made to your data',
      data:{
        user:UpdateUser
      }
  });
});


export const DeleteMe = asyncMiddleware(async(req:CustomRequest,res:Response,next:NextFunction)=>{
  await UserModel.findByIdAndUpdate(req.user.id,{active:false})

  res.status(204).json({
    message:`User deleted`,
    data:null
  })
})

export const createUser = async (req: Request, res: Response) => {
 
    res.status(404).json({
      status: 'Error',
      message: "Route is Not define please use /signUp"
    });
}

export const getMe = async (req: CustomRequest, res:Response, next: NextFunction) => {
  try {

    const getUser = await UserModel.findById(req.params.id = req.user.id);
  
     
    if (!getUser) {
      return next(new MainError('No tour with that ID', 404));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Data retrieved successfully',
      data: getUser
    });
  } catch (error: any) {
    console.error('Invalid ID', error);
    return res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};


export const getOneUser = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const getUser = await UserModel.findById(req.params.id);
  
     
    if (!getUser) {
      return next(new MainError('No tour with that ID', 404));
    }

    return res.status(200).json({
      status: 'success',
      message: 'Data retrieved successfully',
      data: getUser
    });
  } catch (error: any) {
    console.error('Invalid ID', error);
    return res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};
  //  dont update password with this
  export  const updateUser = asyncMiddleware (async (req:Request,res:Response,next:NextFunction)=>{
  
    const Update = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if(!Update){
      return    next(
            new MainError(`no Tour with that ID`, 404)
          )
        }
    return res.status(200).json({
        status:`sucess`,
        message: "Contact updated",
        data:Update
    })
})


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await UserModel.findById(id);
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }

        // Delete user
        await UserModel.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
