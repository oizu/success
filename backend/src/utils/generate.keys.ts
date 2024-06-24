import * as fs from 'fs';
import * as pem from 'pem';

if (!fs.existsSync('./keys/server.key')) {
    pem.createCertificate({ days: 365, selfSigned: true }, (error, keys) => {
        if (error) {
            console.error(error);
        } else {
            const privateKey = keys.serviceKey;
            const certificate = keys.certificate;
            const publicKey = keys.clientKey;

            console.log('Private Key:', privateKey);
            console.log('Public Key:', publicKey);
            console.log('Certificate:', certificate);

            fs.writeFileSync('./keys/server.key', privateKey, 'utf8');
            fs.writeFileSync('./keys/server.pub', publicKey, 'utf8');
            fs.writeFileSync('./keys/server.cer', certificate, 'utf8');
        }
    });
} else {
    console.info('Server keys are already exist.');
}
