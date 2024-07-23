import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

const tmpFolder = path.resolve(__dirname, '..', 'tmp')

// Configurar armazenamento do multer
const storage = multer.diskStorage({
    destination: tmpFolder,
    filename: function (req: any, file: any, callback: any) {
        const fileHash = crypto.randomBytes(10).toString('hex')
        const filename = `${fileHash}-${file.originalname}`
        return callback(null, filename)
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Error: File upload only supports the following filetypes - " + filetypes);
    }
};

export default {
    directory: tmpFolder

}