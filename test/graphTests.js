import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
import {makeGraph} from '../src/js/graphMaker';
import {colorCfg, clearMyRows} from '../src/js/evaluateGraphPath';


describe('The javascript parser for assignment', () => {
    it('is parsing a simple flow correctly', () => {
        clearMyRows();
        let ret = makeGraph('1', parseCode('function foo(a){return a;}'));
        var str = 'digraph cfg { n0 [label="(1)\nreturn a;" style = filled fillcolor = green shape="box"]\n }';
        assert.equal(ret, str);
    });
    it('is parsing an assignment correctly', () => {
        clearMyRows();
        let ret =makeGraph('1' ,parseCode('function myFunc(a){a=1;return a;}'));
        var ans = 'digraph cfg { n0 [label="(1)\na = 1" style = filled fillcolor = green shape="box"]\nn1 ' +
            '[label="(2)\nreturn a;" style = filled fillcolor = green shape="box"]\nn0 -> n1 []\n }';
        assert.equal(ret, ans);});
    it('is parsing a variable correctly', () => {
        clearMyRows();
        let ret = makeGraph('1', parseCode('function myFunc(a){let b=1; return b;}'));
        var ans = 'digraph cfg { n0 [label="(1)\nlet b = 1;" style = filled fillcolor = green shape="box"]' +
            '\nn1 [label="(2)\nreturn b;" style = filled fillcolor = green shape="box"]\nn0 -> n1 []\n }';
        assert.equal(ret, ans);});
});

describe('The javascript parser for conditions', () => {
    it('is parsing a if statement correctly', () => {
        clearMyRows();
        let ret = makeGraph('1',parseCode('function myFunc(a){if(a < 1)a=a+1; return a;}'));
        var ans = 'digraph cfg { n0 [label="(1)\na < 1" style = filled fillcolor = green shape="diamond"]\n' +
            'n1 [label="(2)\na = a + 1" shape="box"]\nn2 [label="(3)\nreturn a;" style = filled fillcolor = green ' +
            'shape="box"]\nn0 -> n1 [label="T"]\nn0 -> n2 [label="F"]\nn1 -> n2 []\n }';
        assert.equal(ret, ans);});
    it('is parsing a else if correctly', () => {
        clearMyRows();
        let ret = makeGraph('1', parseCode('function myFunc(a){if(a < 1)a=a+1; else if(a == 1) a = a+2; return a;}'));
        var ans = 'digraph cfg { n0 [label="(1)\na < 1" style = filled fillcolor = green shape="diamond"]\nn1 ' +
            '[label="(2)\na = a + 1" shape="box"]\nn2 [label="(3)\nreturn a;" style = filled fillcolor = green shape="box"]' +
            '\nn3 [label="(4)\na == 1" style = filled fillcolor = green shape="diamond"]\nn4 [label="(5)\na = a + 2" ' +
            'shape="box"]\nn0 -> n1 [label="T"]\nn0 -> n3 [label="F"]\nn1 -> n2 []\nn3 -> n4 [label="T"]\nn3 -> n2 ' +
            '[label="F"]\nn4 -> n2 []\n }';
        assert.equal(ret, ans);});
    it('is parsing a else correctly', () => {
        clearMyRows();
        let ret = makeGraph('1', parseCode('function myFunc(a){let b = a +1;let c =0;if(b > c){b = b +1;}else {a=1;} return b;}'));
        var ans = 'digraph cfg { n0 [label="(1)\nlet b = a + 1;\nlet c = 0;" style = filled fillcolor = green ' +
            'shape="box"]\nn1 [label="(2)\nb > c" style = filled fillcolor = green shape="diamond"]\nn2 [label="(3)' +
            '\nb = b + 1" style = filled fillcolor = green shape="box"]\nn3 [label="(4)\nreturn b;" style = filled ' +
            'fillcolor = green shape="box"]\nn4 [label="(5)\na = 1" shape="box"]\nn0 -> n1 []\nn1 -> n2 [label="T"]\n' +
            'n1 -> n4 [label="F"]\nn2 -> n3 []\nn4 -> n3 []\n }';
        assert.equal(ret, ans);});
    it('is parsing a else with else if correctly', () => {
        clearMyRows();
        let ret = makeGraph('1', parseCode('function myFunc(a){let b = a +1;let c =0;if(b > c){b = b +1;}else if(b == c){c = b;}else {a=1;} return a+b+c;}'));
        var ans = 'digraph cfg { n0 [label="(1)\nlet b = a + 1;\nlet c = 0;" style = filled fillcolor = green ' +
            'shape="box"]\nn1 [label="(2)\nb > c" style = filled fillcolor = green shape="diamond"]\nn2 [label="(3)\n' +
            'b = b + 1" style = filled fillcolor = green shape="box"]\nn3 [label="(4)\nreturn a + b + c;" ' +
            'style = filled fillcolor = green shape="box"]\nn4 [label="(5)\nb == c" shape="diamond"]\nn5 [label="(6)\n' +
            'c = b" shape="box"]\nn6 [label="(7)\na = 1" shape="box"]\nn0 -> n1 []\nn1 -> n2 [label="T"]\nn1 -> n4 ' +
            '[label="F"]\nn2 -> n3 []\nn4 -> n5 [label="T"]\nn4 -> n6 [label="F"]\nn5 -> n3 []\nn6 -> n3 []\n }';
        assert.equal(ret, ans);});
});

describe('The javascript parser for loops', () => {
    it('is parsing a while statement correctly', () => {
        clearMyRows();
        let ret = makeGraph('1,2',parseCode('function myFunc(a, b){let x = a;while(x < b){a++;x++;}return x;}'));
        var ans = 'digraph cfg { n0 [label="(1)\nlet x = a;" style = filled fillcolor = green shape="box"]\nn1 ' +
            '[label="(2)\nx < b" style = filled fillcolor = green shape="diamond"]\nn2 [label="(3)\na++\nx++" ' +
            'style = filled fillcolor = green shape="box"]\nn3 [label="(4)\nreturn x;" style = filled fillcolor = green' +
            ' shape="box"]\nn0 -> n1 []\nn1 -> n2 [label="T"]\nn1 -> n3 [label="F"]\nn2 -> n1 []\n }';
        assert.equal(ret, ans);});

});

describe('The javascript parser for apply function', () => {

    it('is parsing applay function correctly', () => {
        clearMyRows();
        let ret = makeGraph('[1,2], 3,4', parseCode('function foo(a, b, c){let x = a;let y = b;if(y > x[0]){b = y +1;a[0] = b;}return y;}'));
        var ans = 'digraph cfg { n0 [label="(1)\nlet x = a;\nlet y = b;" style = filled fillcolor = green shape="box"]\n' +
            'n1 [label="(2)\ny > x[0]" style = filled fillcolor = green shape="diamond"]\nn2 [label="(3)\nb = y + 1\n' +
            'a[0] = b" style = filled fillcolor = green shape="box"]\nn3 [label="(4)\nreturn y;" style = filled ' +
            'fillcolor = green shape="box"]\nn0 -> n1 []\nn1 -> n2 [label="T"]\nn1 -> n3 [label="F"]\nn2 -> n3 []\n }';
        assert.equal(ret, ans);});
});
//
// describe('The javascript parser for program', () => {
//     it('is parsing a example run correctly', () => {clearMyRows();
//         makeRowsForInitAndAll(parseCode('foo(1, 2, 3);'), parseCode('function foo(x, y, z){let a = x + 1;let b = a + y;let c = 0;if (b < z) {' +
//             'c = c + 5;return x + y + z + c;} else if (b < z * 2) {c = c + x + 5;return x + y + z + c;} else {' +
//             'c = c + z + 5;return x + y + z + c;}}'), {});
//         var ans ='function foo(x, y, z){<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;' +
//             'display:inline-block;">if (x + 1 + y < z)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
//             'return x + y + z + 0 + 5;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:green;' +
//             'display:inline-block;">else if (x + 1 + y < (z) * 2)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
//             'return x + y + z + 0 + x + 5;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;else {<br/>&nbsp;&nbsp;' +
//             '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return x + y + z + 0 + z + 5;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>}<br/>';
//         assert.equal(ans, afterSubString);});
// });
//
// describe('The javascript parser for program', () => {
//     it('is parsing a example run correctly', () => {clearMyRows();
//         makeRowsForInitAndAll(parseCode('foo(-1, 2, 3);'), parseCode('function foo(x, y, z){let a = x + 1;let b = a + y;let c = 0;if (b < z) {' +
//             'c = c + 5;return x + y + z + c;} else if (b < z * 2) {c = c + x + 5;return x + y + z + c;} else if (b < z * 3) {++x;' +
//             'return x + y + z + c;} else {c = c + z + 5;return x + y + z + c;}}'), {});
//         var ans ='function foo(x, y, z){<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:green;' +
//             'display:inline-block;">if (x + 1 + y < z)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
//             'return x + y + z + 0 + 5;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;' +
//             'display:inline-block;">else if (x + 1 + y < (z) * 2)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
//             'return x + y + z + 0 + x + 5;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;' +
//             'display:inline-block;">else if (x + 1 + y < (z) * 3)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
//             '++x;<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return x + y + z + 0;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;' +
//             'else {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return x + y + z + 0 + z + 5;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>}<br/>';
//         assert.equal(ans, afterSubString);});
// });
//
// describe('The javascript parser for program with globals', () => {
//     it('is parsing a example run with globals correctly', () => {clearMyRows();
//         makeRowsForInitAndAll(parseCode('foo([1], 2, 3);'), parseCode('let a = 5;function foo(x, y, z){let b = x[0] + a;' +
//             'let c = y + z;if(b < c){x[0] = a;}else{ x[0] = y;}return x[0];}'), {});
//         var ans ='function foo(x, y, z){<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;' +
//             'display:inline-block;">if (x[0] + a < y + z)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
//             'x[0] = a;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;else {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
//             'x[0] = y;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;return x[0];<br/>}<br/>';
//         assert.equal(ans, afterSubString);});
// });
//
// describe('The javascript parser for program with strings', () => {
//     it('is parsing a example run with strings correctly', () => {clearMyRows();
//         makeRowsForInitAndAll(parseCode('foo(\'hello\', 2, 3);'), parseCode('let a = 5;function foo(x, y, z){let b = y + a;' +
//             'let c = y + z;if(x == \'hello\'){y = a;}else{ z = y;}return x;}'), {});
//         var ans ='function foo(x, y, z){<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:green;display:inline-block;">' +
//             'if (x == \'hello\')</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y = a;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}' +
//             '<br/>&nbsp;&nbsp;&nbsp;&nbsp;else {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;z = y;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}' +
//             '<br/>&nbsp;&nbsp;&nbsp;&nbsp;return x;<br/>}<br/>';
//         assert.equal(ans, afterSubString);});
//     it('is parsing a example run with strings not like correctly', () => {clearMyRows();
//         makeRowsForInitAndAll(parseCode('foo(\'hello\', 2, 3);'), parseCode('let a = 5;function foo(x, y, z){let b = y + a;' +
//             'let c = y + z;if(x != \'hello\'){y = a;}else{ z = y;}return x;}'), {});
//         var ans ='function foo(x, y, z){<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;display:inline-block;">' +
//             'if (x != \'hello\')</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y = a;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}' +
//             '<br/>&nbsp;&nbsp;&nbsp;&nbsp;else {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;z = y;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}' +
//             '<br/>&nbsp;&nbsp;&nbsp;&nbsp;return x;<br/>}<br/>';
//         assert.equal(ans, afterSubString);});
// });
//
// describe('The javascript parser for program with booleans', () => {
//     it('is parsing a example run with booleans correctly', () => {clearMyRows();
//         makeRowsForInitAndAll(parseCode('foo(\'hello\', 2, 3);'), parseCode('let a = 5;function foo(x, y, z){let b = y + a;' +
//             'let c = y + z;if(x == \'hello\'){y = a;}else{ z = y;}return x;}'), {});
//         var ans ='function foo(x, y, z){<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:green;display:inline-block;">' +
//             'if (x == \'hello\')</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;y = a;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}' +
//             '<br/>&nbsp;&nbsp;&nbsp;&nbsp;else {<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;z = y;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}' +
//             '<br/>&nbsp;&nbsp;&nbsp;&nbsp;return x;<br/>}<br/>';
//         assert.equal(ans, afterSubString);});
//     it('is parsing a example run with strings not like correctly', () => {clearMyRows();
//         makeRowsForInitAndAll(parseCode('foo(true, false);'), parseCode('function foo(x, y){if(!x){return y;}' +
//             'else if (y){return x;}if(x == true){return x;}if(y != false){return y;}}'), {});
//         var ans ='function foo(x, y){<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;display:inline-block;">if (!x)</div>{<br/>' +
//             '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return y;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;display:inline-block;">' +
//             'else if (y)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return x;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:green;display:inline-block;">' +
//             'if (x == true)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return x;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>&nbsp;&nbsp;&nbsp;&nbsp;<div style="background-color:red;display:inline-block;">' +
//             'if (y != false)</div>{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return y;<br/>&nbsp;&nbsp;&nbsp;&nbsp;}<br/>}<br/>';
//         assert.equal(ans, afterSubString);});
// });