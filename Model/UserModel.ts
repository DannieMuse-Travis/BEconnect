import  crypto from "crypto"
import mongoose, {Query, Schema,model}from "mongoose"
import  validator from "validator"
import  bcrypt  from "bcrypt"
import { User } from "../Utils/Interface"




// Define your schema
const userSchema = new Schema<User>({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo:{
    type:String,
    default:`default.jpeg`
  } ,
   
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  isVerified: 
  { type: Boolean,
   default: false },
    verificationCode:
     { type: String }
});

userSchema.pre(`save`,async function(next){
    if(!this.isModified(`password`))
    return next()
 this.password = await bcrypt.hash(this.password,12)
 

 next()
})

userSchema.pre('save', function (next) {
  // Check if the password field is modified or if it's a new document
  if (!this.isModified('password') || this.isNew) return next();

  // Set the passwordChangedAt field to the current date minus 1 second
  this.passwordChangedAt = new Date(Date.now() - 1000);

  next();
});


userSchema.pre<Query<User, User>>(/^find/, function(next) {
  // Modify the 'this' context to set the 'active' condition
  this.where({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
}; 

userSchema.methods.changedPasswordAfter = function(JWTTimestamp: number) {
  if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
      return JWTTimestamp < changedTimestamp;
  }
  return false; // Default to false if passwordChangedAt is not set
};


userSchema.methods.createPasswordResetToken =function(){
    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and set it to the user's passwordResetToken field
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set an expiration time for the token
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes

    // Log the reset token and hashed token
    console.log({ resetToken }, this.passwordResetToken);

    // Return the unhashed token (to send to the user via email, for example)
    return resetToken;
  
};


  


// Create and export your model
export default model<User>('User', userSchema);
