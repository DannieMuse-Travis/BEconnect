import express, { Request, Response, NextFunction } from 'express';

class MainError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    path?: string; // Define path as an optional property
    value?: any; // Define value as an optional property
    code?:number;
    errmg!:string
    constructor(message: string, statusCode: number, path?: string, value?: any) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        // Assign path and value if provided
        if (path) this.path = path;
        if (value) this.value = value;

        // Ensure the stack trace is captured properly
        Error.captureStackTrace(this, this.constructor);
    }
}

export default MainError;
