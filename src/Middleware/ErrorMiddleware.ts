import { NextFunction, Response } from "express";

export async function ErrorHandler(err:any,req:any,res:Response,next:NextFunction){
    
    const statusCode = err.statusCode? err.statusCode : 500
    res.status(statusCode);
    res.json({
        message:err.message,
        stack:err.stack,
        status:err.statusCode
    })
}