var path = require('path');

const testDirectory = "src/test_images"
const image = "impella.png"

const imgPath = path.join(testDirectory, image)

import { Jimp } from 'jimp';
import { createWorker } from 'tesseract.js';
// const rectangles: {
//     name: string,
//     unit: string,
//     rectangle: Tesseract.Rectangle
// }[] = [
//     {
//         name: "V",
//         rectangle: {
//             left: 774,
//             top: 1961,
//             width: 496,
//             height: 228,
//         },
//         unit: "lpm"
//     },
//     {
//         name: "Pven",
//         rectangle: {
//             left: 754,
//             top: 2164,
//             width: 501,
//             height: 268,
//         },
//         unit: "mmHg"
//     },
//     {
//         name: "Pint",
//         rectangle: {
//             left: 769,
//             top: 2428,
//             width: 496,
//             height: 253,
//         },
//         unit: "mmHg"
//     },
//     {
//         name: "Part",
//         rectangle: {
//             left: 1564,
//             top: 2189,
//             width: 516,
//             height: 243,
//         },
//         unit: "mmHg"
//     },
//     {
//         name: "Rotation",
//         rectangle: {
//             left: 1549,
//             top: 1956,
//             width: 546,
//             height: 208,
//         },
//         unit: "rpm"
//     },
// ];

// const rectangles: {
//     name: string,
//     unit: string,
//     rectangle: Tesseract.Rectangle
// }[] = [
//     {
//         name: "Ao",
//         unit: "mmHg",
//         rectangle: {
//             left: 1224,
//             top: 367,
//             width: 173,
//             height: 56,
//         }
//     },
//     {
//         name: "Proud motoru",
//         unit: "mA",
//         rectangle: {
//             left: 1224,
//             top: 680,
//             width: 277,
//             height: 77
//         }
//     },
//     {
//         name: "Prutok Impella",
//         unit: "l/min",
//         rectangle: {
//             left: 138,
//             top: 972,
//             width: 190,
//             height: 102
//         }
//     }
// ];

export async function ocr_image(imgPath : string, rectangles: {name: string, unit: string|undefined, rectangle: Tesseract.Rectangle}[]) {
    try {
        const worker = await createWorker('eng', 1, {
            logger(arg) {
                // console.log(arg)
            },
        });
        await worker.setParameters({
            tessedit_char_whitelist: '0123456789.-/'
        });
        const values = [];
        for (const field of rectangles) {
            const im = await Jimp.read(imgPath)
            if (field.rectangle.top + field.rectangle.height > im.height) { field.rectangle.height = im.height - field.rectangle.top }
            if (field.rectangle.left + field.rectangle.width > im.width) { field.rectangle.width = im.width - field.rectangle.left }
            const { data: { text } } = await worker.recognize(imgPath, { rectangle: field.rectangle });
            // values.push(`${field.name}: ${text.trim()}`);//${field.unit}
            values.push({
                id: field.name,
                value: text.trim().replaceAll("/", "")
            })
        }
        // console.log(values);
        await worker.terminate();
        return values;
    } catch (exception: any) {
        console.error(exception)
        return null
    } 
};