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

// Filtro de tipos de arquivos e verificação de tamanho
const fileFilter = (req: any, file: any, cb: any) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        if (file.size > 5 * 1024 * 1024) { // Verificação de tamanho de arquivo
            return cb(new Error('Imagem deve ser menor que 5Mb'), false);
        } else {
            return cb(null, true);
        }
    } else {
        return cb(new Error('Extensao nao permitida. Use: ' + filetypes), false);
    }
};

export default {
    directory: tmpFolder,
    storage: storage,
    fileFilter: fileFilter,
}

