import fs from 'fs';
import { Parser } from 'json2csv';

const json = JSON.parse(fs.readFileSync('projects.json', 'utf8'));

const parser = new Parser();
const csv = parser.parse(json);

fs.writeFileSync('projects.csv', csv);