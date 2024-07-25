import multer from 'multer'
import path from 'path'
import { v4 as uuid } from 'uuid'

const tmpFolder = path.resolve(__dirname, '..', 'tmp')

// Configurar armazenamento do multer e nome do arquivo
const storage = multer.diskStorage({
    destination: tmpFolder,
    filename: function (req: any, file: any, callback: any) {
        const extension = file.originalname.substring(file.originalname.lastIndexOf('.'));
        const uuidName = uuid()
        const filename = `${uuidName}${extension}`
        return callback(null, filename)
    }
});

// Filtro de tipos de arquivos e verificação de tamanho
const fileFilter = (req: any, file: any, cb: any) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        return cb(new Error('Extensao nao permitida. Use: ' + filetypes), false);
    }
};

// Verificação de tamanho de arquivo
const limits = {
    fileSize: 5 * 1024 * 1024 // 5 MB
};

export default {
    directory: tmpFolder,
    storage: storage,
    fileFilter: fileFilter,
    limits: limits,
}

