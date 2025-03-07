var path = require('path');

const testDirectory = "src/test_images"
const image = "sucky-adjusted.png"

const imgPath = path.join(testDirectory, image)

import { createWorker } from 'tesseract.js';

const worker = await createWorker('eng');
const rectangles: {
    name: string,
    unit: string,
    rectangle: Tesseract.Rectangle
}[] = [
    {
        name: "V",
        rectangle: {
            left: 1050,
            top: 1274,
            width: 400,
            height: 166,
        },
        unit: "lpm"
    },
    {
        name: "Pven",
        rectangle: {
            left: 1050,
            top: 1274,
            width: 400,
            height: 166,
        },
        unit: "mmHg"
    },
    {
        name: "Pint",
        rectangle: {
            left: 1050,
            top: 1274,
            width: 400,
            height: 166,
        },
        unit: "mmHg"
    },
    {
        name: "Part",
        rectangle: {
            left: 1050,
            top: 1274,
            width: 400,
            height: 166,
        },
        unit: "mmHg"
    },
    {
        name: "Rotation",
        rectangle: {
            left: 1050,
            top: 1274,
            width: 400,
            height: 166,
        },
        unit: "rpm"
    },
];

(async () => {
    await worker.setParameters({
        tessedit_char_whitelist: '0123456789.'
    });
    const values = [];
    for (const field of rectangles) {
        const { data: { text } } = await worker.recognize(imgPath, { rectangle: field.rectangle });
        values.push(`${field.name}: ${text} ${field.unit}`);
    }
    console.log(values);
    await worker.terminate();
})();

// (async () => {
//     await worker.setParameters({
//         tessedit_char_whitelist: '0123456789',
//       });
    
//     const { data: { text } } = await worker.recognize(imgPath);
//     console.log(text);
//     await worker.terminate();
//   })();