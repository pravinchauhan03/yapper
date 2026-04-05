import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, signOut, getToken } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/profiles/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      setUsername(res.data.username);
      setBio(res.data.bio || '');
      setIsPublic(res.data.is_public);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/profiles/me`,
        { username, bio, is_public: isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Profile updated successfully! ✅');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setMessage('Failed to update profile.');
    }
    setLoading(false);
  };

  if (!profile) return <div style={styles.loading}>Loading profile...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.avatar}>
            {profile.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={styles.username}>{profile.username}</h2>
            <p style={styles.email}>{user.email}</p>
            <span style={{
              ...styles.badge,
              backgroundColor: profile.is_public ? '#e8f5e9' : '#fce4ec',
              color: profile.is_public ? '#2e7d32' : '#c62828',
            }}>
              {profile.is_public ? '🌐 Public' : '🔒 Private'}
            </span>
          </div>
        </div>

        {/* Bio */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Bio</h3>
          <p style={styles.bio}>{profile.bio || 'No bio yet.'}</p>
        </div>

        {/* Edit Form */}
        {editing ? (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Edit Profile</h3>

            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label style={styles.label}>Bio</label>
            <textarea
              style={styles.textarea}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell something about yourself..."
              rows={3}
            />

            <label style={styles.label}>Account Privacy</label>
            <div style={styles.toggleRow}>
              <span>{isPublic ? '🌐 Public profile' : '🔒 Private profile'}</span>
              <div
                style={{
                  ...styles.toggle,
                  backgroundColor: isPublic ? '#6c63ff' : '#ccc',
                }}
                onClick={() => setIsPublic(!isPublic)}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: isPublic ? 'translateX(20px)' : 'translateX(0)',
                }} />
              </div>
            </div>

            {message && <p style={styles.message}>{message}</p>}

            <div style={styles.btnRow}>
              <button style={styles.saveBtn} onClick={updateProfile} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button style={styles.cancelBtn} onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.btnRow}>
            <button style={styles.editBtn} onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          </div>
        )}

        {message && !editing && <p style={styles.message}>{message}</p>}

        {/* Sign Out */}
        <button style={styles.signOutBtn} onClick={signOut}>
          Sign Out
        </button>

      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: '#6c63ff',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  username: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 4px',
  },
  email: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 8px',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  bio: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.5',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#666',
    marginBottom: '6px',
    marginTop: '12px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    fontSize: '15px',
    color: '#333',
  },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s',
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    transition: 'transform 0.2s',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '16px',
  },
  editBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#6c63ff',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#6c63ff',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '15px',
    cursor: 'pointer',
  },
  signOutBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#fce4ec',
    color: '#c62828',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '16px',
  },
  message: {
    textAlign: 'center',
    color: '#4caf50',
    fontSize: '14px',
    marginTop: '12px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: '#888',
  },
};

export default Profile;