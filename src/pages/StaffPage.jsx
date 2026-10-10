import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import StaffRow from '../components/StaffRow';
import LoadState from '../components/LoadState';
import useApiData from '../hooks/useApiData';
import api from '../api/api';
import { ROLE_LABELS } from '../utils/labels';

export default function StaffPage() {
  const staff = useApiData(() => api.get('/staff'), []);
  const [name, setName] = useState('');
  const [role, setRole] = useState('stylist');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // TODO(auth): adding and editing staff will be owner-only.
  const add = async (event) => {
    event.preventDefault();
    if (!name.trim()) return setAddError('Enter a name.');
    setAdding(true);
    setAddError(null);
    try {
      await api.post('/staff', { name: name.trim(), role });
      setName('');
      staff.reload();
    } catch (err) {
      setAddError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const save = async (id, changes) => {
    const updated = await api.patch(`/staff/${id}`, changes);
    staff.setData((list) => list.map((member) => (member.id === id ? updated : member)));
  };

  return (
    <PageLayout title="Staff">
      <form className="card add-staff" onSubmit={add}>
        <label className="field field--grow">
          <span className="field__label">Name</span>
          <input
            className="field__input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            placeholder="e.g. Riya"
          />
        </label>
        <label className="field">
          <span className="field__label">Role</span>
          <select className="field__input" value={role} onChange={(event) => setRole(event.target.value)}>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="button button--primary" disabled={adding}>
          {adding ? 'Adding…' : 'Add staff'}
        </button>
        {addError && (
          <p className="form-error" role="alert">
            {addError}
          </p>
        )}
      </form>

      <p className="muted">
        Everyone who takes stock out of the storeroom needs an entry here. Deactivate people who leave; their history
        is kept.
      </p>

      <LoadState
        loading={staff.loading}
        error={staff.error}
        hasData={Boolean(staff.data)}
        isEmpty={staff.data?.length === 0}
        emptyText="No staff yet. Add the first person above."
      >
        {staff.data && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {staff.data.map((member) => (
                  <StaffRow key={member.id} member={member} onSave={save} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </LoadState>
    </PageLayout>
  );
}
