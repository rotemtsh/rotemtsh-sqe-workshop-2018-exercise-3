import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parse(codeToParse, { range: true });
};

export {parseCode};
