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
    validateRanges() {
        const r=this.ranges;
        for (let i=0;i<r.length;i++) {
            for (let j=i+1;j<r.length;j++) {
                if (!r[i].valid(r[j])) {
                    throw new Error(`Invalid ranges: (${r[i].start}...${r[i].end}) and (${r[j].start}...${r[j].end})`);
                }
            }
        } 
    }
    transaction():Transaction {
        return new Transaction(this);
    }
    clone():Buffer{
        const res=new Buffer(this.text);
        for (let r of this.ranges) {
            res.addRange(r.start,r.end);
        }
        return res;
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
    valid(other: Range) {
        const i=this.intersection(other);
        return !i||this.equals(i)||other.equals(i);
    }
    intersection(other:Range) {
        if (this.end<=other.start || other.end<=this.start) return null;
        // this.end>other.start && other.end>this.start
        const s=Math.max(this.start,other.start), e=Math.min(this.end, other.end);
        return new Range(this.buffer,s,e);
    }
    equals(other:Range){
        return this.start===other.start && this.end===other.end;
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