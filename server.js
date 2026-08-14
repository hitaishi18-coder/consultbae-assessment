const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

// Tell fluent-ffmpeg where to find both static binaries
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite Database & Ensure Columns Exist
const db = new sqlite3.Database('./consultbae_candidates.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        const alterQueries = [
            "ALTER TABLE Candidates ADD COLUMN duration TEXT;",
            "ALTER TABLE Candidates ADD COLUMN sample_rate TEXT;",
            "ALTER TABLE Candidates ADD COLUMN bitrate TEXT;"
        ];
        alterQueries.forEach(query => {
            db.run(query, (err) => { 
                // Ignore errors here; it just means the column already exists
            });
        });
    }
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// The Audio Upload & Extraction Endpoint
app.post('/api/upload', upload.single('audioFile'), (req, res) => {
    const { phone } = req.body; 
    
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const filePath = req.file.path.replace(/\\/g, '/');
    
    // Use FFmpeg to probe the audio file for metadata
    ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
            console.error("Error reading audio metadata:", err);
            return res.status(500).json({ error: 'Failed to analyze audio.' });
        }

        // Extract the required data
        const duration = metadata.format.duration ? metadata.format.duration.toFixed(2) + 's' : 'Unknown';
        const sampleRate = metadata.streams[0].sample_rate ? (metadata.streams[0].sample_rate / 1000) + ' kHz' : 'Unknown';
        const bitrate = metadata.format.bit_rate ? (metadata.format.bit_rate / 1000).toFixed(0) + ' kbps' : 'Unknown';
        
        console.log(`Extracted -> Duration: ${duration}, Sample Rate: ${sampleRate}, Bitrate: ${bitrate}`);

        // Update the database with the file path AND the extracted metadata
        const sql = `UPDATE Candidates SET audio_url = ?, duration = ?, sample_rate = ?, bitrate = ? WHERE phone = ?`;
        db.run(sql, [filePath, duration, sampleRate, bitrate, phone], function(dbErr) {
            if (dbErr) {
                return res.status(500).json({ error: 'Database update failed.' });
            }
            res.json({ 
                message: 'Upload and analysis successful!', 
                stats: { duration, sampleRate, bitrate }
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});