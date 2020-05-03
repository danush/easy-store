// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { 
    ActionTypes,
    CardFactory,
    ActivityHandler, 
    MessageFactory, 
    TurnContext, 
    UserState } from 'botbuilder';

import {LuisRecognizer, LuisApplication, LuisRecognizerOptionsV2, LuisRecognizerOptionsV3} from 'botbuilder-ai';

export class OrderAssistantBot extends ActivityHandler {

    dispatchRecognizer: LuisRecognizer;
    userStatePropName = 'userTransitionState';
    userTransitionState: any;

    constructor(userState: UserState) {
        super();
        
        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: process.env.LuisAPIHostName
        }, <LuisRecognizerOptionsV2> {
            includeAllIntents: true,
            includeInstanceData: true,
            staging: /"1"/.test(process.env.LuisIsStaging)
        }, true);

        this.dispatchRecognizer = dispatchRecognizer;
            
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            console.log('Processing Message Activity.');
            console.log(context.activity.text)
            const replyText = `Echo: ${ context.activity.text }`;
            var recognizerResult;

            console.log("**************************************");
                console.log(context);
                console.log(JSON.stringify(context));
                console.log("***************************************");
            
            try{ 
                recognizerResult = await dispatchRecognizer.recognize(context);
                const intent = LuisRecognizer.topIntent(recognizerResult);
                console.log("**************************************");
                console.log(intent);
                console.log(JSON.stringify(intent));
                console.log("***************************************");
            }catch(e){
                console.log(e)
                console.log(JSON.stringify(e))
            }

            // switch (expression) {
            //     case constant - expression1: {
            //         //statements; 
            //         break;
            //     }
            //     case constant_expression2: {
            //         //statements; 
            //         break;
            //     }
            //     default: {
            //         //statements; 
            //         break;
            //     }
            // } 
            
            
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;

            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text('Hello and welcome to the EasyStore!'));
                    await context.sendActivity(MessageFactory.text('I\'m Axio, the store\'s vertual assistant.' + 
                        ' I\'m gonna help you to place an order within few steps.'));
                    await context.sendActivity(MessageFactory.text('What would you like to order from EasyStore?'));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    private async sendIntroCard(context: TurnContext) {
        const card = CardFactory.heroCard(
            'Welcome to Bot Framework!',
            'Welcome to Welcome Users bot sample! This Introduction card is a great way to introduce your Bot to the user and suggest some things to get them started. We use this opportunity to recommend a few next steps for learning more creating and deploying bots.',
            ['https://aka.ms/bf-welcome-card-image'],
            [
                {
                    title: 'Get an overview',
                    type: ActionTypes.OpenUrl,
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0'
                },
                {
                    title: 'Ask a question',
                    type: ActionTypes.OpenUrl,
                    value: 'https://stackoverflow.com/questions/tagged/botframework'
                },
                {
                    title: 'Learn how to deploy',
                    type: ActionTypes.OpenUrl,
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-deploy-azure?view=azure-bot-service-4.0'
                }
            ]
        );

        await context.sendActivity({ attachments: [card] });
    }
}
