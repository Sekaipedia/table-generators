import * as fs from 'fs';

const saveToFile = (file: string, content: string): void => {
  try {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Saved to ${file}.`);
  } catch (err) {
    console.error(`Unable to save to ${file}.`, err);
  }
};

export default saveToFile;
