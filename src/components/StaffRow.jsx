import { useState } from 'react';
import { ROLE_LABELS } from '../utils/labels';
import { formatDate } from '../utils/format';

// One staff member: rename inline, change role, activate / deactivate. Staff are never deleted,
// so their history stays attributable. TODO(auth): owner-only.
export default function StaffRow({ member, onSave }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(member.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const save = async (changes) => {
    setBusy(true);
    setError(null);
    try {
      await onSave(member.id, changes);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitRename = async (event) => {
    event.preventDefault();
    if (!name.trim()) return setError('Name is required.');
    if (await save({ name: name.trim() })) setRenaming(false);
  };

  return (
    <tr className={member.isActive ? undefined : 'is-inactive'}>
      <td>
        {renaming ? (
          <form className="inline-form" onSubmit={submitRename} onKeyDown={(e) => e.key === 'Escape' && setRenaming(false)}>
            <input
              className="field__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              aria-label="Name"
              autoFocus
            />
            <button type="submit" className="button button--primary button--small" disabled={busy}>
              Save
            </button>
            <button type="button" className="button button--small" onClick={() => setRenaming(false)} disabled={busy}>
              Cancel
            </button>
          </form>
        ) : (
          <div className="product-name">
            <span className="cell-title">{member.name}</span>
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setName(member.name);
                setRenaming(true);
              }}
            >
              Rename
            </button>
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
      </td>
      <td>
        <select
          className="field__input"
          value={member.role}
          aria-label={`Role of ${member.name}`}
          disabled={busy}
          onChange={(event) => save({ role: event.target.value })}
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td>
        {member.isActive ? <span className="pill pill--success">Active</span> : <span className="pill pill--muted">Inactive</span>}
      </td>
      <td className="nowrap">{formatDate(member.createdAt)}</td>
      <td>
        <button
          type="button"
          className={`button button--small${member.isActive ? ' button--danger-outline' : ''}`}
          disabled={busy}
          onClick={() => save({ isActive: !member.isActive })}
        >
          {member.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    </tr>
  );
}
