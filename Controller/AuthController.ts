import UserModel from "../Model/UserModel";
import {Request,Response,NextFunction} from "express";
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from "dotenv"
import MainError from "../Errors/mainError";
import { asyncMiddleware } from "../Errors/CatchAsync"
import sendMail  from "../Utils/Email";
import crypto from "crypto"

dotenv.config()

export interface CustomRequest extends Request {
    user?: any;
    // user.password = undefined
     // Update the type of user as per your User model
}
interface UserObject {
    _id: string;
    // Add other properties if needed
  }

  const cookieOptions: any = {
    expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRES ? parseInt(process.env.JWT_COOKIE_EXPIRES, 10) : 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
};

const signToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES });
  };
  // const skip: number = (page - 1) * limit;
  const createSendToken = (user: UserObject, statusCode: number, res: Response): void => {
    const token = signToken(user._id); // Assuming signToken function generates JWT token
    
    if(process.env.NODE_ENV === "Production") cookieOptions.secure = true
    res.cookie(`jwt`,token, cookieOptions)
   
    res.status(statusCode).json({
      status: 'success',
      message: 'User is created',
      data: {
        user,
        token
      }
    });
  };

  

export const SignUp = asyncMiddleware(async (req: Request, res: Response) => {
    
        const { email, name, photo, password,role } = req.body;
        
        const newUser = await UserModel.create({
          email, 
          name,
          password,
        
          
        })   
      // console.log(newUser)
      // console.log(newUser
      // )
        if (!newUser || !newUser._id) {
            throw new Error('Failed to create user');
        }
       
        const url = `${req.protocol}://${req.get('host')}/me`;
        // console.log(url);
        await new sendMail(newUser, url)
        
        // .sendWelcome();
        createSendToken(newUser,201,res);
        
        
      
    
})

export const Login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        
        // Check if email and password are provided
        if (!email || !password) {
            return next(new MainError('Please provide email and password', 404));
        }

        // Find user by email
        const user = await UserModel.findOne({ email }).select('+password');
        // Check if user exists and password is correct
        if (!user || !(await user.correctPassword(password, user.password) )) {
            return next(new MainError('Incorrect email or password', 401));
        }

        createSendToken(user,200,res);
        
    } catch (error) {
       
};

}

export const logout = (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

export const isLoggedIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await jwt.verify(req.cookies.jwt, process.env.JWT_SECRET as string) as JwtPayload;
      // 2) Check if user still exists
      const currentUser = await UserModel.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat!)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }  
  next();
};

export const Protect =  asyncMiddleware(async (req: CustomRequest, res: Response, next: NextFunction) => {
    
        // 1) Getting token and check if it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new MainError('You are not logged in! Please log in to get access.', 401));
        }

        // 2) Verify token asynchronously
        const decoded = await jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        // 3) Check if user still exists
        const currentUser = await UserModel.findById(decoded.id);
        if (!currentUser) {
            return next(new MainError('The user belonging to this token does no longer exist.', 401));
        }

        // 4) Check if user changed password after the token was issued
        // Assuming 'changedPasswordAfter' is a method in your User model
        if (currentUser.changedPasswordAfter(decoded.iat!)) {
            return next(new MainError('User recently changed password! Please log in again.', 401));
        }

        // Add the currentUser to the request object
        req.user = currentUser;

        // Proceed to the next middleware
        next();

});

export const isAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
    // Check if the user's role is 'admin'
    if (req.user && req.user.role === 'admin') {
        // If user is admin, proceed to the next middleware or route handler
        next();
    } else {
        // If user is not admin, return an error
        return res.status(403).json({ message: "You don't have permission to perform this action" });
    }
};

 
export const restrictTo = (...roles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            return next(new MainError(`You don't have permission to perform this action`, 403));
        }

        next();
    };
};

export const forgotPassword =asyncMiddleware(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get user based on POSTed email
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return next(new MainError('User not found with this email address.', 404));
    }

    // 2) Generate and set the reset token
    const resetToken: string = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send password reset email to the user
    try {
      // Create password reset URL
      const resetURL: string = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;

      // Send email with password reset instructions
      await new sendMail(user, resetURL).sendPasswordReset();

      res.status(200).json({
        status: 'success',
        message: 'Password reset token sent to email!'
      });
    } catch (err) {
      // If an error occurs, handle it and reset the user's reset token fields
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new MainError(
          'There was an error sending the password reset email. Please try again later.',
          500
        )
      );
    }
  }
);

export const verifyEmail = asyncMiddleware(async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
      throw new MainError('Verification code is missing.', 400);
  }

  const user = await UserModel.findOne({ verificationCode: code });

  if (!user) {
      throw new MainError('Invalid verification code.', 400);
  }

  // Mark the user as verified
  user.isVerified = true;
  user.verificationCode = undefined; // Clear the verification code
  await user.save();

  res.status(200).json({
      status: 'success',
      message: 'Email verified successfully.'
  });
});



export const ResetPassword = asyncMiddleware (async (req:Request,res:Response,next:NextFunction)=>{
   const hashedToken = crypto.createHash(`sha256`).update(req.params.token).digest(`hex`)

   const user =  await UserModel.findOne({passwordResetToken:hashedToken , passwordResetExpires:{$gt:Date.now()}})


   if(!user){
    return next(new MainError(`Token is Invalid  or has expired`,404))
   }
   user.password = req.body.password;
   user.passwordConfirm = req.body.passwordConfirm;
   user.passwordResetToken=undefined
   user.passwordResetExpires=undefined
   await user.save()
   
   createSendToken(user,201,res);

   next();
})


export const updatePassword = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // 1) Get user from collection
      const user = await UserModel.findById(req.user.id).select('+password');
  
      if (!user) {
        return next(new MainError('User not found.', 404));
      }
  
      // 2) Check if POSTed current password is correct
      if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new MainError('Your current password is wrong.', 401));
      }
  
      // 3) If so, update password
      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      await user.save();
  
      // 4) Log user in, send JWT
      createSendToken(user, 200, res);
    } catch (err) {
      return next(err);
    }
  };


