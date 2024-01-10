const Parser = require('tree-sitter');
const TypeScript = require('tree-sitter-typescript');
const Python = require('tree-sitter-python');
const fs = require("fs");
const path = require('path');
const _ = require("lodash");

const parser = new Parser();
parser.setLanguage(Python);

function getAllFilesSync(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            getAllFilesSync(filePath, fileList);
        } else {
            if (path.extname(file) === '.py') {
                fileList.push(filePath);
            }
        }
    }

    return fileList;
}

const files = getAllFilesSync("../src/@orbitmines/external/github.com/akissinger/chyp/chyp");
console.log(files)


const classesAndMethods = [];


files.forEach(file => {
    const source = fs.readFileSync(file, 'utf-8')
    const tree = parser.parse(source);
// Traverse the AST to extract classes, methods, arguments, and return types

    tree.rootNode.children.forEach((node) => {
        if (node.type === 'class_definition') {
            const currentClass = {
                name: node.firstChild.nextNamedSibling.text,
                methods: [],
            };

            // Traverse class body for methods
            node.lastChild.children.forEach((classChildNode) => {
                if (classChildNode.type === 'function_definition') {
                    const method = {
                        name: classChildNode.firstChild.nextNamedSibling.text,
                        arguments: [],
                        returnType: 'any', // Default return type
                    };

                    // Traverse method parameters
                    classChildNode.firstChild.nextNamedSibling.nextSibling.children.forEach((paramNode) => {

                        if (paramNode.type === 'typed_parameter') {
                            const paramName = paramNode.firstChild.text;
                            const paramTypeNode = paramNode.lastChild;

                            // console.log(paramTypeNode.text)

                            // Check if there is a type annotation
                            const paramType = paramTypeNode.text ?? 'any';

                            method.arguments.push({ name: paramName, type: paramType });
                        }
                    });

                    // Check for return type annotation
                    const returnTypeNode = classChildNode.lastChild.firstChild;
                    if (returnTypeNode && returnTypeNode.type === 'typed_identifier') {
                        method.returnType = returnTypeNode.lastChild.text;
                    }

                    currentClass.methods.push(method);
                }
            });

            classesAndMethods.push(currentClass);
        }
    });
})
// Print the extracted information
console.log(JSON.stringify(classesAndMethods, null, 2));

function generateTypeScriptTypes(classesAndMethods) {
    const typeScriptCode = [];

    classesAndMethods.forEach((classInfo) => {
        typeScriptCode.push(`export class ${classInfo.name} extends Ray {`);

        classInfo.methods.forEach((method) => {
            const params = method.arguments.map((arg) => `${arg.name}: ${
                _.last(arg.type
                    .replaceAll('[', '<')
                    .replaceAll(']', '>')
                    .replaceAll(/<(.*)>,/g, "$1[],")
                    .split('.'))
            }`).join(', ');
            typeScriptCode.push(`  ${method.name} = (${params}): ${method.returnType} => { throw new NotImplementedError(); }`);
        });

        typeScriptCode.push('}\n');
    });

    return typeScriptCode.join('\n');
}

// Assuming classesAndMethods is the result from the previous script
const typeScriptCode = `
${_.uniq(classesAndMethods.flatMap(c => c.methods).flatMap(method => [method.returnType, ...method.arguments.map(arg => arg.type)])
    .flatMap(arg => arg.split(/[\[\],.|]/g))
    .map(arg => arg.trim())
    .filter(arg => arg !== '')
)
    .filter(arg => arg !== 'any' && !classesAndMethods.map(c => c.name).includes(arg))
    .map(arg => `export type ${
        arg
    }<T1 = any, T2 = any, T3 = any> = any;`).join('\n')}

${generateTypeScriptTypes(classesAndMethods)}
`;


fs.writeFileSync('../src/@orbitmines/external/implementations/chyp/Chyp_naieve_pass.ts', typeScriptCode)