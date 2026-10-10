import { ROLE_LABELS } from '../../utils/labels';

// Large buttons, one per active staff member, so the right name is a single tap.
export default function StaffPicker({ staff, value, onChange }) {
  return (
    <div className="staff-picker" role="radiogroup" aria-label="Taken by">
      {staff.map((member) => (
        <button
          key={member.id}
          type="button"
          role="radio"
          aria-checked={value === member.id}
          className="staff-picker__option"
          onClick={() => onChange(member.id)}
        >
          <span className="staff-picker__name">{member.name}</span>
          <span className="staff-picker__role">{ROLE_LABELS[member.role]}</span>
        </button>
      ))}
    </div>
  );
}
