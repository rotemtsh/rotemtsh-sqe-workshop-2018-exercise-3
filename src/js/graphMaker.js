const esgraph = require('esgraph');
import * as escodegen from 'escodegen';
import {colorCfg} from './evaluateGraphPath';


function makeGraph(callCode, code) {
    var cfg = esgraph(code.body[0].body)[2];
    cfg = removeFromCfg(cfg);
    colorCfg(cfg, callCode, code, {});
    return buildDot(cfg);
}

function removeFromCfg(cfg){
    cfg.forEach(node => delete node.exception);
    let exitNode = cfg[cfg.length - 1];
    let returnNode = exitNode.prev.filter(node => node.astNode.type === 'ReturnStatement')[0];
    cfg[0].normal.type = 'entry';
    cfg[0].normal.prev = [];
    returnNode.type = 'exit';
    returnNode.next = [];
    delete returnNode.normal;
    cfg = cfg.slice(1, cfg.length - 1);
    cfg.forEach(node => node.label = escodegen.generate(node.astNode));
    unionNormalNodes(cfg);
    return cfg;
}

function unionNormalNodes(cfg){
    for (var i=0; i<cfg.length; i++){
        let nodei = cfg[i];
        if (nodei.normal && nodei.normal.normal){
            let nextNode = nodei.normal;
            let idx = cfg.indexOf(nextNode);
            nodei.next = nextNode.next;
            nodei.normal = nextNode.normal;
            nodei.label += '\n' + nextNode.label;
            cfg.splice(idx, 1);
            i--;
        }
    }
}

function buildDot(cfg) {
    var res = 'digraph cfg { ';
    res = addNodes(cfg, res);
    res = addEdges(cfg, res);
    res +=' }';
    return res;
}

function addNodes(nodes, res){
    for (var [i, node] of nodes.entries()) {
        res += 'n'+i +' [label="('+(i+1)+')\n' + node.label +'"';
        if (node.color)
            res +=' style = filled fillcolor = green';
        let shape = 'box';
        if (node.true || node.false)
            shape = 'diamond';
        res += ' shape="'+ shape+'"]\n';
    }
    return res;
}

function addEdges(nodes, res){
    for (const [i, node] of nodes.entries()) {
        res = normalNode(nodes, res, i, node);
        res = trueNode(nodes, res, i, node);
        res = falseNode(nodes, res, i, node);
    }
    return res;
}

function normalNode(nodes, res, i, node){
    var next = node['normal'];
    if (!next) return res;
    res +='n'+i+' -> n'+nodes.indexOf(next)+' [';
    res +=']\n';
    return res;
}

function trueNode (nodes, res, i, node){
    var next = node['true'];
    if (!next) return res;
    res +='n'+i+' -> n'+nodes.indexOf(next)+' [';
    res +='label="T"';
    res +=']\n';
    return res;
}

function falseNode (nodes, res, i, node){
    var next = node['false'];
    if (!next) return res;
    res +='n'+i+' -> n'+nodes.indexOf(next)+' [';
    res +='label="F"';
    res +=']\n';
    return res;
}


export {makeGraph};