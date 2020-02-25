const fs = require("fs");
require("./common");
require("./images/logo.png");
require("./images/radar_legend.png");
const marked = require("marked");

const cache = {};
function importAll(r) {
  r.keys().forEach(key => (cache[key] = r(key)));
}

importAll(require.context("../data/", true, /\.md$/));

const knownQuadrants = [];
const quadrants = {};
Object.keys(cache).forEach(folder => {
  const key = folder.match(/^\.\/(.+)\//)[1];

  if (knownQuadrants.includes(key)) return;
  knownQuadrants.push(key);

  const labelKey = `./${key}/index.md`;

  let label;
  if (cache[labelKey]) {
    label = cache[labelKey].replace("# ", "").trim();
  } else {
    label = key;
  }

  quadrants[key] = label;
});

const columns = "name,ring,quadrant,isNew,description";
let output = [columns];
Object.keys(cache).forEach(file => {
  try {
    const fnMatch = file.match(/^\.\/(.+)\/(.+)\.md$/);
    if (!fnMatch || fnMatch[2] === "index") return;

    const ring = fnMatch[1].split("-")[0];
    const quadrant = quadrants[fnMatch[1]];

    const contents = cache[file].split("\n").filter(line => line.length);

    const name = contents
      .shift()
      .replace("# ", "")
      .trim();

    let isNew;
    if (contents[0].toUpperCase() === "NEW") {
      isNew = true;
      contents.shift();
    } else {
      isNew = false;
    }

    const desc = marked.inlineLexer(contents.join("").trim(), []);

    output.push(`${name},${ring},${quadrant},${isNew},${desc}`);
  } catch (e) {
    console.error(`Skipped file ${file}, check the file syntax!`);
    console.error(e);
  }
});

output = output.join("\n");
const Radar = require("./util/factory");

Radar().buildFromString(output, "Ometria Tech Radar");
console.log(`This is the CSV generated from the data:\n${output}`);
