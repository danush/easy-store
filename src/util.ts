import { Fridge, Oven, TV } from './shoppingItems';
import { UserStateContext } from './userStateContext';
export function extractEntity(results){
    if(results && results.entities && results.entities.ApplianceName)
        return results.entities.ApplianceName[0];
    else null;
}

export function crateItem(name){
    if(/fridge|refrigerator/i.test(name)){
        return new Fridge();;
    }else if(/television|tv/i.test(name)){
        return new TV();
    }else{
        return new Oven();
    }
}

export function crateUserContext(ctx){
    return new UserStateContext(ctx.currentState, ctx.cart);
}