import {Buffer} from "../src/Buffer.js";
import * as assert from "assert";
const src=`
define([],function () {
    const a=require("a");
    const b=require("b");
    /* comment is retained. */
    return {a,b};
});
`;

function addRange(str:string) {
    const start=b.text.indexOf(str);
    const end=start+str.length;
    return b.addRange(start,end);
}
const b=new Buffer(src);
const reqa=addRange(`const a=require("a");`);
const reqb=addRange(`const b=require("b");`);
const reqr=addRange(`return {a,b};`);
const def=b.addRange(src.indexOf("{")+1,src.lastIndexOf("}"));
const t=b.transaction();
t.replace(reqa,     `import a from "a";`);
t.replace(reqb,     `import b from "b";`);
t.replace(reqr,     `export default {a,b};`);
t.commit();
console.log(def+"");
assert.equal(def+"",`
    import a from "a";
    import b from "b";
    /* comment is retained. */
    export default {a,b};
`)