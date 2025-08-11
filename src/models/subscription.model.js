import mongoose, { Schema, Types } from "mongoose"; 

const subscriptionSchema = new Schema({
    subscriber: {
        Type: Schema.Types.ObjectId, // onw who subscribe
        ref: "User"
    },
    channel: {
        Type: Schema.Types.ObjectId, 
        ref: "User"
    }

}, {
    timestamps: true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)