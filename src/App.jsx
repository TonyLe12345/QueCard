import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { uploadData, getUrl } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';

import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

// Generate client
const client = generateClient();

export default function App() {
  // State for groups, selected group, notes, forms, image
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [notes, setNotes] = useState([]);
  const [noteData, setNoteData] = useState({ name: '', description: '' });
  const [image, setImage] = useState(null);

  // Fetch groups on load
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch notes whenever selectedGroupId changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchNotes();
    } else {
      setNotes([]);
    }
  }, [selectedGroupId]);

  // Fetch groups
  async function fetchGroups() {
    try {
      const result = await client.models.Group.list();
      setGroups(result.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  }

  // Fetch notes for selected group
  async function fetchNotes() {
    if (!selectedGroupId) return;
    try {
      const result = await client.models.Note.list({
        filter: { groupId: { eq: selectedGroupId } },
      });
      const notesWithUrls = await Promise.all(
        result.data.map(async (note) => {
          if (note.image) {
            note.imageUrl = (await getUrl({ key: note.image })).url;
          }
          return note;
        })
      );
      setNotes(notesWithUrls);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  }

  // Create a new group
  async function createGroup(event) {
    event.preventDefault();
    if (!groupName.trim()) return;
    try {
      await client.models.Group.create({ name: groupName.trim() });
      setGroupName('');
      fetchGroups();
    } catch (err) {
      console.error('Error creating group:', err);
    }
  }

  // Create a new note in the selected group
  async function createNote(event) {
    event.preventDefault();
    if (!noteData.name.trim() || !noteData.description.trim() || !selectedGroupId) return;

    try {
      let imageKey;
      if (image) {
        const { credentials } = await import('aws-amplify');
        const identityId = credentials().identityId; // Identity used in Storage policy

        const extension = image.name.split('.').pop();
        imageKey = `media/${identityId}/${Date.now()}.${extension}`;

        await uploadData({
          key: imageKey,
          data: image,
          options: { contentType: image.type },
        }).result;
      }

      await client.models.Note.create({
        name: noteData.name.trim(),
        description: noteData.description.trim(),
        image: imageKey,
        groupId: selectedGroupId,
      });

      setNoteData({ name: '', description: '' });
      setImage(null);
      fetchNotes();
    } catch (err) {
      console.error('Error creating note:', err);
    }
  }


  // Delete a note
  async function deleteNote(note) {
    try {
      await client.models.Note.delete(note.id);
      fetchNotes();
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>

          <section style={{ marginTop: 20 }}>
            <h2>Create Group</h2>
            <form onSubmit={createGroup} style={{ marginBottom: 20 }}>
              <input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                style={{ width: '70%', marginRight: 10 }}
              />
              <button type="submit">Create Group</button>
            </form>

            <label>
              <strong>Select Group:</strong>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{ width: '100%', padding: 8, marginTop: 5 }}
              >
                <option value="">-- Select a group --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
          </section>

          {selectedGroupId && (
            <>
              <section style={{ marginTop: 40 }}>
                <h2>Create Note</h2>
                <form onSubmit={createNote}>
                  <input
                    placeholder="Note name"
                    value={noteData.name}
                    onChange={(e) => setNoteData({ ...noteData, name: e.target.value })}
                    required
                    style={{ width: '100%', marginBottom: 10 }}
                  />
                  <textarea
                    placeholder="Note description"
                    value={noteData.description}
                    onChange={(e) => setNoteData({ ...noteData, description: e.target.value })}
                    required
                    rows={3}
                    style={{ width: '100%', marginBottom: 10 }}
                  />
                  <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                  <button type="submit" style={{ marginTop: 10 }}>
                    Create Note
                  </button>
                </form>
              </section>

              <section style={{ marginTop: 40 }}>
                <h2>Notes in this Group</h2>
                {notes.length === 0 && <p>No notes yet.</p>}
                {notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      border: '1px solid #ccc',
                      padding: 10,
                      marginBottom: 10,
                      borderRadius: 4,
                    }}
                  >
                    <h3>{note.name}</h3>
                    <p>{note.description}</p>
                    {note.imageUrl && (
                      <img
                        src={note.imageUrl}
                        alt={note.name}
                        style={{ width: 200, display: 'block', marginTop: 10 }}
                      />
                    )}
                    <button onClick={() => deleteNote(note)} style={{ marginTop: 10 }}>
                      Delete Note
                    </button>
                  </div>
                ))}
              </section>
            </>
          )}
        </main>
      )}
    </Authenticator>
  );
}
