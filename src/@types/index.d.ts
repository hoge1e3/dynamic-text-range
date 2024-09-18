declare module "sortedlist" {
    class SortedList<E> extends Array<E>{
        constructor(opt:{
            compare:(a:E,b:E)=>number
        });
        insert(...e:E[]):void;
        bsearch(e:E):number;
    }
    export=SortedList;
    //export as namespace SortedList;
}
