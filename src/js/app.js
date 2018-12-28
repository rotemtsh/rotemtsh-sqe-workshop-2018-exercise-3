import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {makeGraph} from './graphMaker';
import {Module, render } from 'viz.js/full.render.js';
import Viz from 'viz.js';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let callCode = $('#applyCode').val();
        var dot = makeGraph(callCode, parsedCode);
        var svg = new Viz({Module, render });
        var graph = document.getElementById('outputGraph');
        svg.renderSVGElement( dot).then(function (element) {
            graph.innerHTML ='';
            graph.append(element);
        });
    });
});

