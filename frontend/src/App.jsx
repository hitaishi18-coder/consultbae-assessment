import { useState } from 'react';

function App() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Uploading...');

    if (!name || !phone || !audioFile) {
      setStatus('Please fill out all fields and select a file.');
      return;
    }

    // Create a FormData object to send text + files together
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('audioFile', audioFile);

    try {
      // Send to our Node.js backend
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        setStatus('Upload successful! File saved.');
        // Clear the form
        setName('');
        setPhone('');
        setAudioFile(null);
      } else {
        setStatus('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error connecting to backend server.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Gig Worker Audio App</h2>
      <p>Submit your audio recording below.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '10px' }}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number (e.g., 9000000254)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '10px' }}
          required
        />
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          style={{ padding: '10px' }}
          required
        />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
          Submit Audio
        </button>
      </form>
      
      {status && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
}

export default App;