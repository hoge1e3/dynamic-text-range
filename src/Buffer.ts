import SortedList from "sortedlist";
//"include": ["test", "src", "@types/index.d.ts"],
  
function rangeList() {
    return new SortedList<Range>({
        compare(a:Range ,b:Range) {
            return a.compare(b);
        }
    });
}
export class Buffer {
    ranges=rangeList();
    constructor(public text:string) {

    }
    toString(){
        return this.text;
    }
    addRange(start:number, end:number):Range {
        const r=new Range(this,start,end);
        this.ranges.insert(r);
        return r;
    }
    transaction():Transaction {
        return new Transaction(this);
    }
}
export class Range {
    constructor(
        public buffer:Buffer, 
        public start:number, 
        public end:number){
    }
    toString(){
        return this.buffer.text.substring(this.start,this.end);
    }
    length() {
        return this.end-this.start;
    }
    replace(to:string) {
        const text=this.buffer.text;
        const pre=text.substring(0,this.start);
        const post=text.substring(this.end);
        const expansion=to.length-this.length();
        this.expand(this.end, expansion);
        this.buffer.text=pre+to+post;
    }
    expand(from:number, by:number) {
        // all range.start/range.end>=from should be +=by  
        if (by==0) return;
        const ranges=this.buffer.ranges;
        let idx=ranges.bsearch(this);
        while(true) {
            idx--;
            if (idx<0) {break;}
            let r=ranges[idx];
            if (r.end<from) break;
        }
        idx++;
        for (;idx<ranges.length;idx++) {
            const r=ranges[idx];
            if (r.start>=from) r.start+=by;
            if (r.end>=from) r.end+=by;
        }
    }
    compare(other:Range) {
        let c1=this.end-other.end ;
        if(c1!=0) return c1;
        return this.start-other.start;
    }
}
export class Transaction {
    replaceTo=new Map<Range,string>();
    rangeList=rangeList();
    constructor(public buffer:Buffer){
    }
    replace(range:Range, to:string) {
        if (!this.replaceTo.has(range)) {
            this.rangeList.insert(range);
        }
        this.replaceTo.set(range,to);
        return this;
    }
    commit() {
        for (let i=this.rangeList.length-1;i>=0;i--) {
            const range=this.rangeList[i];
            range.replace(this.replaceTo.get(range)!);
        }
    }
}