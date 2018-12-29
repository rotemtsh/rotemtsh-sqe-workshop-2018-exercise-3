const esgraph = require('esgraph');
import * as escodegen from 'escodegen';
import {colorCfg} from './evaluateGraphPath';


function makeGraph(callCode, code) {
    var cfg = buildCfg(code);
    return addColorsAndBuildDot(cfg, callCode, code);
}

function buildCfg(code){
    var cfg = esgraph(code.body[0].body)[2];
    cfg = removeFromCfg(cfg);
    return cfg;
}

function addColorsAndBuildDot(cfg, callCode, code){
    colorCfg(cfg, callCode, code, {});
    return buildDot(cfg);
}

function removeFromCfg(cfg){
    cfg.forEach(node => delete node.exception);
    let last = cfg.length - 1;
    let exitNode = cfg[last];
    cfg[0].normal.type = 'entry';
    cfg[0].normal.prev = [];
    changeReturnNode(exitNode);
    cfg = cfg.slice(1, last);
    cfg.forEach(node => node.label = escodegen.generate(node.astNode, {format: {compact: true}}));
    unionNormalNodes(cfg);
    return cfg;
}

function changeReturnNode(exitNode){
    for(var node of exitNode.prev){
        if (node.astNode.type === 'ReturnStatement') {
            node.type = 'exit';
            node.next = [];
            delete node.normal;
            return;
        }
    }
}

function unionNormalNodes(cfg){
    for (var i=0; i<cfg.length; i++){
        let nodei = cfg[i];
        if (nodei.normal && nodei.normal.normal){
            let next = nodei.normal;
            nodei.label += '\n' + next.label;
            nodei.next = next.next;
            nodei.normal = next.normal;
            cfg.splice(cfg.indexOf(next), 1);
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
        if (node.color != null)
            res +=' style = filled fillcolor = green';
        let shape = 'box';
        if (node.true != null || node.false != null)
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


export {makeGraph, buildCfg};