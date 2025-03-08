var path = require('path');

const testDirectory = "src/test_images"
const image = "sucky-stretchy.png"

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
            left: 774,
            top: 1961,
            width: 496,
            height: 228,
        },
        unit: "lpm"
    },
    {
        name: "Pven",
        rectangle: {
            left: 754,
            top: 2164,
            width: 501,
            height: 268,
        },
        unit: "mmHg"
    },
    {
        name: "Pint",
        rectangle: {
            left: 769,
            top: 2428,
            width: 496,
            height: 253,
        },
        unit: "mmHg"
    },
    {
        name: "Part",
        rectangle: {
            left: 1564,
            top: 2189,
            width: 516,
            height: 243,
        },
        unit: "mmHg"
    },
    {
        name: "Rotation",
        rectangle: {
            left: 1549,
            top: 1956,
            width: 546,
            height: 208,
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
        values.push(`${field.name}: ${text.trim()} ${field.unit}`);
    }
    console.log(values);
    await worker.terminate();
})();