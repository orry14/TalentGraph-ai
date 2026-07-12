const fs = require('fs');
const readline = require('readline');

async function extract() {
  const fileStream = fs.createReadStream('C:\\Users\\Acer\\.gemini\\antigravity-ide\\brain\\2ba49083-31df-4926-a0f6-65e06023890a\\.system_generated\\logs\\transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastUser = null;
  for await (const line of rl) {
    if (!line) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT') {
        lastUser = parsed;
      }
    } catch (e) {}
  }

  if (lastUser) {
    fs.writeFileSync('C:\\Users\\Acer\\Downloads\\antigvotu\\redesign_prompt.md', lastUser.content);
    console.log("Extracted");
  } else {
    console.log("Not found");
  }
}
extract();
