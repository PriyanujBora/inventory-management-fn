import { Link } from 'react-router';
import { formatDateTime } from '../../utils/format';

// Shown on Stock In and Take Out while a count is open: moving stock now would skew the count.
export default function CountOpenBanner({ count }) {
  return (
    <div className="banner banner--warning" role="status">
      <strong>Stock count #{count.id} is in progress</strong> (started {formatDateTime(count.startedAt)}). Please
      don&apos;t receive or take out stock until it is closed, or the count will be off.{' '}
      <Link to="/counts">Review the count</Link>
    </div>
  );
}
