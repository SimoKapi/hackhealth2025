import cv from "@techstark/opencv-js"
import { Jimp } from 'jimp';

export async function transform_image(filepath: string){
    var jimpSrc = await Jimp.read(filepath);
    var src = cv.matFromImageData(jimpSrc.bitmap);
    
    let srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, jimpSrc.height, 0, jimpSrc.height, jimpSrc.width, 0, jimpSrc.width]);
    
    // Define destination points (e.g. a rectangle of desired output dimensions)
    let width = 1646;  // desired width
    let height = 871; // desired height
    
    let dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2,
        [
            50,
            50,
    
            650,
            100,
    
            283,
            661.5,
    
            100,
            400
        ]
    );
    
    // Get the perspective transformation matrix
    let M = cv.getPerspectiveTransform(srcPoints, dstPoints);
    
    // Create an output Mat and set the desired size
    let dst = new cv.Mat();
    let dsize = new cv.Size(width, height);
    
    // Apply the warp
    // cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.cvtColor(src, dst, cv.COLOR_BGR2GRAY)
    
    // Don't forget to free memory
    srcPoints.delete(); dstPoints.delete(); M.delete();
    new Jimp({
        width: dst.cols,
        height: dst.rows,
        data: Buffer.from(dst.data)
    })
        .write('output.png');
}