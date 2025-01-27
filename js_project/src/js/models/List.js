import uniqid from 'uniqid';

export default class List {
    constructor(){
        this.items=[];
    }


    addItem(count,unit,ingredient){
        const item={
            id:uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }
    deleteItem(id){
        const index =this.items.findIndex(el=> el.id===id);
        //diff between slice and splice
        // [2,4,8] slice(1,2) --> return 4 and the original array  [2,4,8]
        // [2,4,8] splice(1,2) --> return [4,8] and the original array  [2]
        this.items.splice(index,1);
    }

    updateCount(id,newCount){
        this.items.find(el=>el.id===id).count=newCount;
    }

}