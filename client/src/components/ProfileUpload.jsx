import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Camera, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { refreshUser } = useAuth();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      await api.post('/upload/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Profile picture updated successfully!');
      setSuccess(true);
      refreshUser();
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-panel"
      style={{ padding: '24px', flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--accent-light)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Camera size={16} />
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-heading)', margin: 0 }}>Profile Picture</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          border: success ? '2px solid var(--success)' : '2px dashed var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px', overflow: 'hidden', position: 'relative',
          background: 'var(--bg-secondary)'
        }}>
          {preview ? (
            <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Camera size={32} color="var(--text-tertiary)" />
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{
              position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer'
            }}
          />
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px', textAlign: 'center' }}>
          JPG, GIF or PNG. Max size of 5MB.
        </p>

        <button 
          onClick={handleUpload} 
          disabled={!file || loading}
          className="btn-secondary"
          style={{ width: '100%', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading ? (
            <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
          ) : success ? (
            <><CheckCircle size={18} color="var(--success)" /> Uploaded</>
          ) : (
            <><Upload size={18} /> Upload Image</>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ProfileUpload;
