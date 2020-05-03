// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { 
    ActionTypes,
    CardFactory,
    ActivityHandler, 
    MessageFactory, 
    TurnContext, 
    UserState, 
    ConversationState} from 'botbuilder';

import {LuisRecognizer, LuisApplication, LuisRecognizerOptionsV2, LuisRecognizerOptionsV3} from 'botbuilder-ai';
import { UserConversationState, UserStateContext } from './userStateContext';
import { extractEntity, crateItem, crateUserContext } from './util';
export class OrderAssistantBot extends ActivityHandler {

    dispatchRecognizer: LuisRecognizer;
    userState;
    userStateContext;

    constructor(conversationState: ConversationState, userState: UserState) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');

        const dispatchRecognizer = new LuisRecognizer({
            applicationId: process.env.LuisAppId,
            endpointKey: process.env.LuisAPIKey,
            endpoint: process.env.LuisAPIHostName
        }, <LuisRecognizerOptionsV2> {
            includeAllIntents: true,
            includeInstanceData: true,
            staging: true
        }, true);

        this.dispatchRecognizer = dispatchRecognizer;
        this.userState = userState;
        this.userStateContext = userState.createProperty('userStateContext');

            
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            
            const usrCtx = await this.userStateContext.get(context, {});

            const recognizerResult = await dispatchRecognizer.recognize(context);
            //we can update luis's app 
            const intent = LuisRecognizer.topIntent(recognizerResult);
            var newUserCtx = crateUserContext(usrCtx);

            switch (usrCtx.currentState) {
                case UserConversationState.CreateOrder: {
                    if(/AddItemToCart/i.test(intent)){
                        let applianceName = extractEntity(recognizerResult);
                        if(!/tv|television|fridge|refrigerator|oven/gi.test( applianceName ) ){
                            await context.sendActivity(MessageFactory.text("Sorry we don't sell '"+applianceName+"'. Please order either a fridge, tv or an oven."));
                        }else{
                            var item = crateItem(applianceName);

                            newUserCtx.setState(UserConversationState.AddMoreItemsQuestion);
                            await this.userStateContext.set(context, newUserCtx );

                            await context.sendActivity(MessageFactory.text(item.getName()+" is added to your cart."));
                            await context.sendActivity(MessageFactory.text("Do you like to buy more Items?"));
                        }
                    }
                    
                    break;
                }
                case UserConversationState.AddMoreItemsQuestion: {
                    if(/NotOk/i.test(intent)){
                        newUserCtx.setState(UserConversationState.createShipping);
                        await this.userStateContext.set(context, newUserCtx );
                        await context.sendActivity(MessageFactory.text("Where do you need to ship this order?. Please tell me the complete address."));
                    }else{
                        newUserCtx.setState(UserConversationState.CreateOrder);
                        await this.userStateContext.set(context, newUserCtx );
                        await context.sendActivity(MessageFactory.text("What else would you like to add in to this order?."));
                    }
                    
                    break;
                }
                case UserConversationState.createShipping: {
                    await context.sendActivity(MessageFactory.text("Thank you! We will ship your order to : "+context.activity.text));
                    break;
                }
                default: {
                    await context.sendActivity(MessageFactory.text("Sorry, I did not catch that."));
                    break;
                }
            } 
            
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;

            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await this.userStateContext.set(context, new UserStateContext(UserConversationState.CreateOrder, []));

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

    public async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        //await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}
