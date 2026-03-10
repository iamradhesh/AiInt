import mongoose from "mongoose";

const usereSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,

        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        credits:{
            type:Number,
            default:100
        }
    },
    {
        timestamps: true,
    }
)