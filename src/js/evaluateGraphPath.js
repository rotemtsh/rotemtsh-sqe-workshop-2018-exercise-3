var Parser = require('expr-eval').Parser;
import {parseCode} from './code-analyzer';

var initAss =[];

const pushFunctions = {
    'Program': ProgramParsing,
    'FunctionDeclaration': FunctionParsing,
    'VariableDeclaration': VariableParsing,
    'ExpressionStatement': ExpressionParsing,
    'AssignmentExpression': AssignmentParsing,
    'BlockStatement': BlockParsing
};

const returnFunctions = {
    'Identifier': IdentifierParsing,
    'BinaryExpression': BinaryParsing,
    'LogicalExpression': BinaryParsing,
    'Literal': LiteralParsing,
    'UnaryExpression': UnaryParsing,
    'MemberExpression': MemberParsing,
    'UpdateExpression': UpdateParsing,
    'ArrayExpression': ArrayParsing
};

function colorCfg(cfg, startCode, parsedCode,assignments){
    var node = cfg[0];
    applyFunc(startCode);
    makeRow(parsedCode,assignments);
    while (node.type !== 'exit'){
        node.color = true;
        if (node.normal){
            makeRow(parseCode(node.label),assignments);
            node = node.normal;
        }
        else if (makeRow(parseCode(node.label).body[0], assignments))
            node = node.true;
        else
            node = node.false;
    }
    node.color = true;
}


function makeRow(parsedCode, assignments){
    return pushFunctions[parsedCode.type](parsedCode, assignments);
}

function ProgramParsing(parsedCode, assignments){
    var i;
    for(i=0; i<parsedCode['body'].length; i++) {
        makeRow(parsedCode['body'][i], assignments);
    }
}

function FunctionParsing(parsedCode, assignments) {
    parsedCode['params'].forEach(param => insertParams(param, assignments));
}

/**
 * @return {boolean}
 */
function VariableParsing(parsedCode, assignments){
    parsedCode['declarations'].forEach(decler => declaration(decler, assignments));
    return true;
}

function declaration(parsedCode, assignments){
    var name = parsedCode['id'];
    name = returnFunctions[name.type](name, assignments);
    var value = parsedCode['init'];
    value = returnFunctions[value.type](value, assignments);
    assignments[name] = value;
}

/**
 * @return {boolean}
 */
function ExpressionParsing(parsedCode, assignments){
    if(parsedCode['expression']['type'] === 'AssignmentExpression')
        return AssignmentParsing(parsedCode['expression'], assignments);
    return returnFunctions[parsedCode['expression'].type](parsedCode['expression'], assignments);
}

/**
 * @return {boolean}
 */
function AssignmentParsing(parsedCode, assignments){
    var left = parsedCode['left'];
    var value = parsedCode['right'];
    value = returnFunctions[value.type](value, assignments);
    if(left.type === 'Identifier'){
        assignments[left.name] = value;
    }
    else{//array
        var prop = left.property.value;
        var oldVal = assignments[left.object.name];
        var splitedOld = oldVal.slice(1, -1).split(', ');
        splitedOld[prop] = value;
        var newVal = '[';
        splitedOld.forEach(str => newVal += str + ', ');
        newVal.slice(0, -2);
        newVal +=']';
    }
    return true;
}

function BlockParsing(parsedCode, assignments){
    var newAss = {};
    newAss = Object.create(assignments);
    parsedCode['body'].forEach(body => makeRow(body, newAss));
}

function IdentifierParsing(parsedCode, assignments){
    return checkInAss(parsedCode['name'], assignments);
}

/**
 * @return {string}
 */
function BinaryParsing(parsedCode, assignments){
    var left = returnFunctions[parsedCode['left'].type](parsedCode['left'], assignments);
    var oper = parsedCode['operator'];
    var right = returnFunctions[parsedCode['right'].type](parsedCode['right'], assignments);
    if(oper === '*' || oper === '/')
        return getAns('('+ left + ') ' + oper + ' ' + right, assignments);
    else
        return getAns(''+ left + ' ' + oper + ' ' + right, assignments);
}

function LiteralParsing(parsedCode){
    return parsedCode['raw'];
}

/**
 * @return {string}
 */
function UnaryParsing(parsedCode, assignments){
    var value = parsedCode['argument'];
    value = returnFunctions[value.type](value, assignments);
    return getAns(parsedCode['operator'] + '' + value,assignments);
}

/**
 * @return {string}
 */
function MemberParsing(parsedCode, assignments){
    var value = parsedCode['object'];
    value = returnFunctions[value.type](value, assignments);
    var property = returnFunctions[parsedCode['property'].type](parsedCode['property'], assignments);
    var toRet = value.slice(1, -1).split(',')[property].trim();
    return toRet;
}


/**
 * @return {string}
 */
function UpdateParsing(parsedCode,assignments){
    var arg = parsedCode['argument'];
    arg = returnFunctions[arg.type](arg,assignments);
    let res = getAns('' + arg + parsedCode['operator'].charAt(0) + '1', assignments);
    assignments[arg] = getAns(res,assignments);
}

/**
 * @return {string}
 */
function ArrayParsing(parsedCode,assignments){
    var arg = parsedCode['elements'];
    var retVal = '[';
    arg.forEach(body=> retVal += returnFunctions[body.type](body, assignments) + ', ');
    retVal = retVal.slice(0, -2);
    retVal += ']';
    return retVal;
}

function insertParams(parsedCodeParam, assignments){
    if(initAss.length > 0) {
        assignments[parsedCodeParam['name']] = initAss[0];
        initAss.shift();
    }
}

function clearMyRows(){
    initAss =[];
}

function checkInAss(variable, assignments){
    var valToRet ='';
    var value = assignments[variable];
    if(value != null) {
        if (assignments[value] != null)
            valToRet = checkInAss(assignments[value], assignments);
        else valToRet = '' + value;
    }
    else valToRet = '' +variable;
    if(['true','false'].includes(valToRet)){
        return valToRet === 'true';
    }
    return valToRet;
}

function getAns(test, assignments){
    test = replaceArray(''+test,assignments);
    var expr = new Parser().parse(test);
    var dict = fillDict(assignments);
    if(test.indexOf('\'') > 0){
        return strInTest(dict, expr);
    }
    if(checkIfBool(expr, dict)) {
        return boolInTest(dict, expr);
    }
    try { return expr.evaluate(dict); }
    catch (e) { return false; }
}

function fillDict(assignments){
    var dict = {};
    for(var key in assignments)
        dict[key] = assignments[key];
    return dict;
}

function strInTest(dict, expr){
    var keyInDict = expr.tokens[0].value;
    let valInDict = dict[keyInDict];
    let val = '\''+expr.tokens[1].value+'\'';
    if(expr.tokens[2].value.indexOf('!') >=0)
        return valInDict !== val;
    else return valInDict === val;
}

function boolInTest(dict,expr){
    let keyInDict = '' + expr.tokens[0].value;
    let valInDict = dict[keyInDict];
    if(expr.tokens.length > 2) {
        let val = '' + expr.tokens[1].value;
        if (expr.tokens[2].value.indexOf('!') >= 0)
            return keyInDict !== val;
        else return keyInDict === val;
    }
    else if(expr.tokens.length === 2)
        return !keyInDict;
    else return valInDict === 'true';
}

function checkIfBool(expr, dict){
    if(expr.tokens.length > 2) {
        for (let i =0; i<expr.tokens.length; i++) {
            if (expr.tokens[i].value === true || expr.tokens[i].value === false) {
                return true;
            }
        }
    }
    return checkIfSingleBool(expr, dict);
}

function checkIfSingleBool(expr, dict) {
    var bool = ['true', 'false', true, false];
    if(expr.tokens.length <= 2) {
        var val = expr.tokens[0].value;
        return (bool.includes(val) || bool.includes(dict[val]));
    }
    return false;
}

function replaceArray(test,assignment){
    var withoutSpaces = test.split(' '), testToRet = '';
    for(var part in withoutSpaces) {
        var splitOpenBraces = withoutSpaces[part].split('[');
        if (splitOpenBraces.length > 1) {
            var splitCloseBraces = splitOpenBraces[1].split(']');
            var place = replaceArray(splitCloseBraces[0], assignment);
            var array = assignment[splitOpenBraces[0]];
            var args = array.split('[')[1].split(']')[0];
            args = args.split(',');
            testToRet += args[place] + ' ';
        }
        else testToRet += withoutSpaces[part] + ' ';
    }
    return testToRet.slice(0,-1);
}

function applyFunc(code){
    let variable ='';
    for(let i=0; i<code.length; i++){
        [i, variable] = getVar(code, i, variable);
        if (i === code.length - 1) {
            initAss.push(variable.trim());
            variable = '';
        }
    }
}

function getVar(code, i, variable){
    if(code.charAt(i) === ','){
        initAss.push(variable.trim());
        variable = '';
    }
    else {
        variable += code.charAt(i);
        if (code.charAt(i) === '[' || code.charAt(i) === '\'') {
            [i, variable] = getArrayStr(i + 1, variable, code, code.charAt(i));
        }
    }
    return [i, variable];
}

function getArrayStr(j, variable, code, startChar){
    var endChar = startChar;
    if(startChar === '[')
        endChar = ']';
    while(code.charAt(j) !== endChar){
        variable += code.charAt(j);
        j++;
    }
    variable += endChar;
    return [j,variable];
}

// function changeArrayIdx(left, value, assignment){
//     var property = '';
//     var arrIdx = left.indexOf('[');
//     for(let i = arrIdx+1; i<left.indexOf(']'); i++){
//         property += left.charAt(i);
//     }
//     var idx = parseInt(property);
//
//     if(initAssignmentDic[left.substr(0, arrIdx)]) {
//         let oldVal = initAssignmentDic[left.substr(0, arrIdx)];
//         let ret = buildArrStr(oldVal, idx, value);
//         initAssignmentDic[left.substr(0, arrIdx)] = ret;
//     }
//     else {
//         let oldVal = assignment[left.substr(0, arrIdx)];
//         let ret = buildArrStr(oldVal, idx, value);
//         assignment[left.substr(0, arrIdx)] = ret;
//     }
// }

// function buildArrStr(oldVal, idx, value){
//     var ret ='';
//     var splitVal = oldVal.split(',');
//     if(idx ===0){
//         ret +='[';
//         ret = forloop(ret, splitVal, idx, value);
//     }
//     else if(idx === splitVal.length-1){
//         ret = forloop(ret, splitVal, idx, value);
//         ret.slice(0, -1);
//         ret += ']';
//     }
//     else{
//         ret = forloop(ret, splitVal, idx, value);
//     }
//     return ret;
// }

// function forloop(ret, splitVal, idx, value){
//     for(let j = 0; j<splitVal.length; j++){
//         if(j !== idx)
//             ret += splitVal[j] +',';
//         else ret += value +',';
//     }
//     return ret;
// }

export {colorCfg, clearMyRows};