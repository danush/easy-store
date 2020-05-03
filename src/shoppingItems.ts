export class Item{

    name;
    price;

    constructor(price, name){
        this.price = price;
        this.name = name;
    }

    public getName() { return this.name }
}

export class TV extends Item{
    constructor(){
        super(225, "Television");
    }
}

export class Fridge extends Item{
    constructor(){
        super(560, "Refrigerator");
    }
}

export class Oven extends Item{
    constructor(){
        super(120, "Refrigerator");
    }
}