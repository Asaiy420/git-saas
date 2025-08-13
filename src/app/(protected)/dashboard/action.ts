"use server"

import {streamText} from 'ai'
import {createGoogleGenerativeAI} from '@ai-sdk/google'
import { createStreamableValue } from "@ai-sdk/rsc";


const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,

})

export async function askQuestion(question: string){
    
}