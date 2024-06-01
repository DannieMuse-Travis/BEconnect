import { Request, Response, NextFunction } from 'express';
import  MainError from "./mainError";

export const handleValidationDB = (err: MainError) => {
    const message = `Invalid input data`;
    return new MainError(message, 400);
};

export const handleDupfieldDB = (err: MainError) => {
    const message = `Duplicate field value: ${err.value}. Please use another value!`;
    return new MainError(message, 400);
};

export const handlerJWTError = ()=> new MainError(`Invalid Token. Please log in Again`,401)

export const handlerJWTExpire = ()=> new MainError(`Your Token. Please log in Again`,401)

export const handleCastDB = (err: MainError) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new MainError(message, 400);
};

export const SendDevError = (err: MainError, res: Response) => {
    res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
        stack: err.stack,
        error: err
    });
};

export const SendProdError = (err: MainError, res: Response) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    } else {
        console.error('Error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
};

const GlobalErrorHandler = (err: MainError, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        SendDevError(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
       error.message = error.message;
    
        if (error.name === 'CastError') error = handleCastDB(error);
        if (error.code === 11000) error = handleDupfieldDB(error);
        if (error.name === 'ValidatingError') error = handleValidationDB(error);
        if(error.name === `JsonwebTokenError`) error = handlerJWTError()
        if(error.name === `JsonwebTokenExpire`) error = handlerJWTExpire()
        SendProdError(error, res);
    }
};

export default GlobalErrorHandler;
