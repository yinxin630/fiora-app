import fetch from './fetch';

/**
 * 上传文件
 * @param blob 文件blob数据
 * @param fileName 文件名
 */
export default async function uploadFile(blob: Blob | string, fileName: string, isBase64 = false): Promise<string> {
    const [uploadErr, result] = await fetch('uploadFile', {
        file: blob,
        fileName,
        isBase64,
    });
    if (uploadErr) {
        throw Error(`上传图片失败::${uploadErr}`);
    }
    return result.url;
}
