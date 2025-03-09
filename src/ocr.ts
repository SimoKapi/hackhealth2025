var path = require('path');

const testDirectory = "src/test_images"
const image = "impella.png"

const imgPath = path.join(testDirectory, image)

import { Jimp } from 'jimp';
import { createWorker } from 'tesseract.js';

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
        const im = await Jimp.read(imgPath)
        for (const field of rectangles) {
            if (field.rectangle.top + field.rectangle.height > im.height) { field.rectangle.height = im.height - field.rectangle.top }
            if (field.rectangle.left + field.rectangle.width > im.width) { field.rectangle.width = im.width - field.rectangle.left }
            const { data: { text } } = await worker.recognize(imgPath, { rectangle: field.rectangle });
            values.push({
                id: field.name,
                value: text.trim().replaceAll("/", "")
            })
        }
        await worker.terminate();
        return values;
    } catch (exception: any) {
        console.error(exception)
        return null
    } 
};