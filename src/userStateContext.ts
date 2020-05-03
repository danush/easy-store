import {Item} from './shoppingItems';
export class UserStateContext{

    cart = [];
    currentState : UserConversationState;

    constructor(state, cart){
        this.currentState = state;
        this.cart = cart;
    }

    public AddItem(item : Item){
        this.cart.push(item);
    }

    public setState(state){
        this.currentState = state;
    }

    public getState(){
        return this.currentState;
    }

    public getOrderedItems(){
        return this.cart;
    }
}

export enum UserConversationState {
    CreateOrder = "CREATE_ORDER",
    AddMoreItemsQuestion = "ADD_MORE_ITEMS_Q",
    createShipping = "CREATE_SHIPPING",
}

