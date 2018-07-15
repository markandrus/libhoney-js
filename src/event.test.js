/* global describe, it */
import assert from "assert";
import libhoney from "./libhoney";

describe("libhoney events", function() {
  let hny = new libhoney();

  it("inherit fields and dyn_fields from builder", function() {
    let b = hny.newBuilder(
      { a: 5 },
      {
        b: function() {
          return 3;
        }
      }
    );

    let ev = b.newEvent();
    assert.equal(5, ev.data.a);
    assert.equal(3, ev.data.b);
  });

  it("accepts dict-like arguments to .add()", function() {
    let b = hny.newBuilder();
    let ev = b.newEvent();

    ev.add({ a: 5 });
    assert.equal(5, ev.data.a);

    let ev2 = b.newEvent();
    let map = new Map();
    map.set("a", 5);
    ev2.add(map);
    assert.equal(5, ev2.data.a);
  });

  it("it toString()'s keys from Maps in .add()", function() {
    let b = hny.newBuilder();
    let ev = b.newEvent();

    let map = new Map();
    map.set(
      {
        toString: function() {
          return "hello";
        }
      },
      5
    );
    ev.add(map);

    assert.equal(5, ev.data.hello);
  });

  it("doesn't stringify object values", function() {
    let postData = { c: { a: 1 } };

    let ev = hny.newEvent();

    ev.add({ c: { a: 1 } });

    assert.equal(JSON.stringify(ev.data), JSON.stringify({ c: { a: 1 } }));
  });

  it("converts all values to primitive types in .add/.addField", function() {
    let b = hny.newBuilder();
    let ev;
    let map;

    ev = b.newEvent();
    map = new Map();

    // Object, we pass it on through (and let Honeycomb serialize it if necessary)
    map.set("obj", { a: 1, b: 2 });

    // String converts to a string
    map.set("String", new String("a:1"));
    map.set("string", "a:1");

    // Number converts to a number
    map.set("Number", new Number(5));
    map.set("number", 5);

    // Boolean converts to a boolean
    map.set("Boolean", new Boolean(true));
    map.set("boolean", true);

    // Date does not convert
    let d = new Date(1, 2, 3, 4, 5, 6, 7);
    map.set("Date", d);

    // Null/undefined both end up being null in the output
    map.set("null", null);
    map.set("undefined", undefined);

    ev.add(map);

    assert.equal(
      JSON.stringify(ev.data),
      `{"obj":{"a":1,"b":2},"String":"a:1","string":"a:1","Number":5,"number":5,"Boolean":true,"boolean":true,"Date":${JSON.stringify(
        d
      )},"null":null,"undefined":null}`
    );
  });
});