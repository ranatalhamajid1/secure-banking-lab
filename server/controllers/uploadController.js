const fs = require('fs');

exports.uploadProfile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded'
        });
    }

    const filePath = req.file.path;

    try {
        const buf = fs.readFileSync(filePath);
        
        // 1. Image integrity & signature check
        const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 && buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a;
        
        if (!isJpeg && !isPng) {
            throw new Error('Invalid file format. Only true JPEG and PNG images are allowed.');
        }

        // 2. Resolution boundaries check
        let width = 0;
        let height = 0;

        if (isPng) {
            // Width is at offset 16 (4 bytes)
            width = buf.readInt32BE(16);
            // Height is at offset 20 (4 bytes)
            height = buf.readInt32BE(20);
        } else if (isJpeg) {
            let offset = 2; // skip start marker
            while (offset < buf.length) {
                if (buf[offset] === 0xff) {
                    const marker = buf[offset + 1];
                    // SOF markers (Start of Frame)
                    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3) {
                        height = buf.readUInt16BE(offset + 5);
                        width = buf.readUInt16BE(offset + 7);
                        break;
                    }
                    offset += 2 + buf.readUInt16BE(offset + 2);
                } else {
                    offset++;
                }
            }
        }

        // Enforce resolution bounds (e.g. min 120x120px, max 4096x4096px)
        if (width < 120 || height < 120) {
            throw new Error('Image resolution too low. Minimum required is 120x120px.');
        }
        if (width > 4096 || height > 4096) {
            throw new Error('Image resolution too high. Maximum allowed is 4096x4096px.');
        }

        res.status(200).json({
            message: 'File uploaded successfully',
            file: req.file.filename,
            dimensions: { width, height }
        });
    } catch (err) {
        // Remove file on validation failure
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return res.status(400).json({
            message: err.message || 'File validation failed'
        });
    }
};