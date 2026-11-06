import ImageKit from 'imagekit';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let imagekitInstance = null;

export function getImageKit() {
  if (!imagekitInstance) {
    if (config.imagekit.publicKey && config.imagekit.privateKey && config.imagekit.urlEndpoint) {
      imagekitInstance = new ImageKit({
        publicKey: config.imagekit.publicKey,
        privateKey: config.imagekit.privateKey,
        urlEndpoint: config.imagekit.urlEndpoint,
      });
      logger.info('ImageKit client initialized successfully.');
    }
  }
  return imagekitInstance;
}

/**
 * Upload an image (base64 data URL, Buffer or remote URL) to ImageKit CDN.
 *
 * @param {string|Buffer} file - Base64 data URL or buffer
 * @param {string} fileName - File name
 * @param {string} [folder='/libraryhub/aadhar'] - Folder path in ImageKit media library
 * @returns {Promise<{ url: string, fileId: string, name: string }>}
 */
export async function uploadToImageKit(file, fileName, folder = '/libraryhub/aadhar') {
  const ik = getImageKit();
  if (!ik) {
    logger.warn('ImageKit credentials not configured. Returning image data as fallback.');
    return {
      url: typeof file === 'string' ? file : '',
      fileId: `local-${Date.now()}`,
      name: fileName,
    };
  }

  try {
    const uploadRes = await ik.upload({
      file,
      fileName,
      folder,
      useUniqueFileName: true,
      tags: ['library-hub', 'aadhar-verification'],
    });

    logger.info(`Successfully uploaded document to ImageKit: ${uploadRes.url}`);
    return {
      url: uploadRes.url,
      fileId: uploadRes.fileId,
      name: uploadRes.name,
    };
  } catch (err) {
    logger.error(`ImageKit upload failed for "${fileName}": ${err.message}`, { error: err });
    throw new Error(`Failed to upload document to ImageKit: ${err.message}`);
  }
}

export default {
  uploadToImageKit,
  getImageKit,
};
