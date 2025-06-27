export default function NavigationBar({
  groups,
  selectedGroupId,
  setSelectedGroupId,
  signOut,
  user,
}) {
  return (
    <nav
      style={{
        background: '#f5f5f5',
        padding: '10px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h2 style={{ marginRight: 20 }}>Notes App</h2>
        <label>
          <strong>Group:</strong>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            style={{ marginLeft: 10, padding: 5 }}
          >
            <option value="">🏠 Home (All Groups)</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
      </div>

    {user ? (
      <div>
        <span style={{ marginRight: 10 }}>Hello {user.username}</span>
        <button onClick={signOut}>Sign out</button>
      </div>
    ) : null}
    </nav>
  );
}
