import assert from "node:assert/strict";
import test from "node:test";
import { navigation, pageFromUrl, readSection, updatePageUrl, updateSection } from "../src/ui/navigation";

const installWindow=(address:string)=>{
  let current=new URL(address);
  (globalThis as any).window={get location(){return current},history:{pushState:(_state:unknown,_title:string,url:URL|string)=>{current=new URL(String(url))},replaceState:(_state:unknown,_title:string,url:URL|string)=>{current=new URL(String(url))}}};
  return ()=>current;
};

test("active LifeOS navigation contains eight primary and three System destinations",()=>{
  assert.equal(navigation.filter(item=>item.group==="primary").length,8);
  assert.ok(navigation.some(item=>item.id==="school"&&item.group==="primary"));
  assert.deepEqual(navigation.filter(item=>item.group==="system").map(item=>item.id),["automation","vault","settings"]);
});

test("page navigation is URL-addressable and preserves unrelated query state",()=>{
  const current=installWindow("http://127.0.0.1:3001/?page=dashboard&section=overview");
  updatePageUrl("operations");
  assert.equal(pageFromUrl(),"operations");
  assert.equal(current().searchParams.get("section"),"overview");
});

test("subsections validate allowed values and replace the URL without navigation loss",()=>{
  const current=installWindow("http://127.0.0.1:3001/?page=memory&section=unknown");
  assert.equal(readSection("section",["coverage","confirmed"],"coverage"),"coverage");
  updateSection("section","confirmed");
  assert.equal(current().searchParams.get("page"),"memory");
  assert.equal(readSection("section",["coverage","confirmed"],"coverage"),"confirmed");
});
